import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const GEMINI_API_KEY = 'AIzaSyBHJkk5l8yEuwbM8GxCOW2Lmtp4HaJ-yNM';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function verifyVisualAccuracy() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const artworkSchema = new mongoose.Schema({
            title: String,
            firebase_image_url: String,
        }, { collection: 'artworks' });
        const Artwork = mongoose.model('Artwork', artworkSchema);

        // '희망' 이라는 제목의 작품 하나를 가져와서 검증
        const art = await Artwork.findOne({ title: { $regex: '희망', $options: 'i' } });
        if (!art) {
            console.log("검증할 작품을 찾지 못했습니다.");
            return;
        }

        console.log(`검증 대상 작품: ${art.title}`);
        console.log(`이미지 URL: ${art.firebase_image_url}`);

        const response = await fetch(art.firebase_image_url);
        const buffer = Buffer.from(await response.arrayBuffer());
        const base64 = buffer.toString('base64');

        const prompt = `
당신은 예술 비평가입니다. 이 사진에 무엇이 구체적으로 보이나요?
1. 주요 색상 (Primary colors)
2. 형태 및 질감 (Shapes and textures)
3. 구체적인 피사체 또는 주제 (Specific subjects)

위 내용을 아주 객관적으로 묘사하고, 그 다음 이 작품을 '회복과 치유'의 관점에서 3문장으로 큐레이션해 주세요.
`;

        const result = await model.generateContent([
            { text: prompt },
            { inlineData: { data: base64, mimeType: "image/jpeg" } }
        ]);

        console.log("\n--- AI의 시각적 분석 결과 ---\n");
        console.log(result.response.text());
        console.log("\n----------------------------\n");

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}
verifyVisualAccuracy();
