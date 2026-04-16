import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local 로드
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// 사용자 제공 고성능 API 키 (Pro 플랜)
const GEMINI_API_KEY = 'AIzaSyBHJkk5l8yEuwbM8GxCOW2Lmtp4HaJ-yNM';
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI가 .env.local에 정의되지 않았습니다.');
    process.exit(1);
}

// Gemini 설정 (gemini-2.0-flash 사용 - 고성능 시각 분석 및 속도 최적화)
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function fetchImageBase64(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`이미지 다운로드 실패: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return buffer.toString('base64');
    } catch (error) {
        console.error(`이미지 가져오기 에러 (${url}):`, error.message);
        return null;
    }
}

async function generateDescription(artwork, imageBase64) {
    const prompt = `
당신은 예술을 통해 치유와 회복을 돕는 전문 아트 테라피스트이자 큐레이터입니다.
먼저 제공된 작품 이미지의 **색감, 형태, 기법 등 시각적 특징을 정확히 파악**한 뒤, 그 내용을 바탕으로 설명글을 작성해 주세요.

[작품 정보]
- 제목: ${artwork.title}
- 카테고리: ${artwork.category || '예술 작품'}
- 재료/기법: ${artwork.material || '정보 없음'}
- 스타일: ${artwork.style || '정보 없음'}
- 주제: ${artwork.subject || '정보 없음'}

[요구사항]
1. 분석 단계: 이미지에서 보이는 실제 시각적 요소(예: 구체적인 색상, 붓터치의 느낌, 묘사된 대상 등)를 큐레이션에 자연스럽게 녹여낼 것. (제목만 보고 지어내지 말 것)
2. 주제: 작품이 가진 에너지를 **정신적, 육체적 회복(Recovery)의 관점**에서 해석할 것.
3. 문체: 정중하고 따뜻한 어조 ("~합니다" 체).
4. 분량: 3~5문장 내외.
5. 형식: 문단 사이 빈 줄 필수, 설명 텍스트만 출력.
`;

    const parts = [{ text: prompt }];
    if (imageBase64) {
        parts.push({
            inlineData: {
                data: imageBase64,
                mimeType: "image/jpeg"
            }
        });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    return response.text().trim();
}

async function runBatch() {
    const isSample = process.argv.includes('--sample');
    const sampleSize = 5;
    const progressFile = path.resolve(__dirname, 'generation_progress.json');
    const failureLogFile = path.resolve(__dirname, 'generation_failures.json');

    let progress = { completed: [], failed: [] };
    if (fs.existsSync(progressFile) && !isSample) {
        progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB 연결 성공');

        const artworkSchema = new mongoose.Schema({
            title: String,
            description: String,
            category: String,
            material: String,
            style: String,
            subject: String,
            firebase_image_url: String,
            status: String
        }, { collection: 'artworks' });

        const Artwork = mongoose.models.Artwork || mongoose.model('Artwork', artworkSchema);

        // 설명이 없는 작품 찾기 (이미 완료된 것은 제외)
        const query = {
            $or: [
                { description: { $exists: false } },
                { description: null },
                { description: '' },
                { description: /^\s*$/ }
            ],
            _id: { $nin: progress.completed }
        };

        const targetArtworks = await Artwork.find(query);
        console.log(`대상 작품 수: ${targetArtworks.length}건`);

        const toProcess = isSample ? targetArtworks.slice(0, sampleSize) : targetArtworks;
        console.log(`${isSample ? '샘플' : '전체'} 작업 시작: ${toProcess.length}건`);

        let count = 0;
        for (const art of toProcess) {
            count++;
            console.log(`[${count}/${toProcess.length}] 처리 중: ${art.title} (${art._id})`);

            try {
                let imageBase64 = null;
                if (art.firebase_image_url) {
                    imageBase64 = await fetchImageBase64(art.firebase_image_url);
                }

                const description = await generateDescription(art, imageBase64);
                
                if (!isSample) {
                    await Artwork.findByIdAndUpdate(art._id, { description });
                    progress.completed.push(art._id);
                    fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
                } else {
                    console.log(`\n--- 생성된 설명 (샘플) ---\n${description}\n------------------------\n`);
                }

                // API 부하 방지 및 지연
                await new Promise(r => setTimeout(r, 2000));

            } catch (err) {
                console.error(`처리 실패 (${art.title}):`, err.message);
                progress.failed.push({ id: art._id, title: art.title, error: err.message });
                fs.writeFileSync(failureLogFile, JSON.stringify(progress.failed, null, 2));
            }
        }

        console.log('\n작업 완료!');
        if (isSample) console.log('샘플 모드이므로 DB를 업데이트하지 않았습니다.');

    } catch (error) {
        console.error('실행 중 에러 발생:', error);
    } finally {
        await mongoose.disconnect();
    }
}

runBatch();
