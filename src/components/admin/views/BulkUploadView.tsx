"use client";

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
    FileUp,
    Images,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Info,
    Download,
    Sparkles
} from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { generateArtworkDescription } from '@/app/actions/ai';
import { uploadImageAsWebP } from '@/lib/upload';
import { createArtwork } from '@/app/actions/artwork';
import ExcelJS from 'exceljs';

interface IUser {
    _id: string;
    email: string;
    name?: string;
}

interface BulkUploadViewProps {
    users: IUser[];
}

interface BulkExcelRow {
    '작품명'?: string;
    '작가이메일'?: string;
    '장르/매체(Category)'?: string;
    '카테고리'?: string;
    '스타일/기법(Style)'?: string;
    '스타일'?: string;
    '소재/주제(Subject)'?: string;
    '주제'?: string;
    '추천공간(Space)'?: string;
    '공간'?: string;
    '판매가(₩)'?: string | number;
    '판매가'?: string | number;
    '월렌탈료(₩)'?: string | number;
    '렌탈료'?: string | number;
    '가로(cm)'?: string | number;
    '세로(cm)'?: string | number;
    '호수(호)'?: string | number;
    '호수'?: string | number;
    '제작연도'?: string | number;
    '재질/기법'?: string;
    '재료'?: string;
    '이미지파일명'?: string;
    '작품설명'?: string;
}

interface BulkItem {
    id: string;
    title: string;
    artistEmail: string;
    category: string;
    style: string;
    subject: string;
    space: string;
    price: number;
    rental_price: number;
    width: number;
    height: number;
    ho: number;
    year?: string;
    material?: string;
    description?: string;
    imageFilename: string;
    fileContent?: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    errorMsg?: string;
}

export default function BulkUploadView({ users }: BulkUploadViewProps) {
    const [items, setItems] = useState<BulkItem[]>([]);
    const [uploading, setUploading] = useState(false);

    // AI Generation Logic
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiProgress, setAiProgress] = useState({ current: 0, total: 0 });

    // 엑셀 템플릿 다운로드 (ExcelJS 기반 드롭다운 포함)
    const downloadTemplate = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('ArtsFactory_Bulk_Template');

        // Headers 설정
        worksheet.columns = [
            { header: '작품명', key: 'title', width: 20 },
            { header: '작가이메일', key: 'artistEmail', width: 25 },
            { header: '장르/매체(Category)', key: 'category', width: 18 },
            { header: '스타일/기법(Style)', key: 'style', width: 18 },
            { header: '소재/주제(Subject)', key: 'subject', width: 18 },
            { header: '추천공간(Space)', key: 'space', width: 18 },
            { header: '판매가(₩)', key: 'price', width: 12 },
            { header: '월렌탈료(₩)', key: 'rental_price', width: 12 },
            { header: '가로(cm)', key: 'width', width: 10 },
            { header: '세로(cm)', key: 'height', width: 10 },
            { header: '호수(호)', key: 'ho', width: 10 },
            { header: '제작연도', key: 'year', width: 12 },
            { header: '재질/기법', key: 'material', width: 20 },
            { header: '이미지파일명', key: 'imageFilename', width: 20 },
            { header: '작품설명', key: 'description', width: 30 },
        ];

        // 예시 데이터 추가
        worksheet.addRow({
            title: '예시 작품 1',
            artistEmail: 'artist@example.com',
            category: '회화',
            style: '추상',
            subject: '풍경',
            space: '거실용',
            price: 1000000,
            rental_price: 100000,
            width: 53,
            height: 45.5,
            ho: 10,
            year: '2024',
            material: '캔버스에 유합',
            imageFilename: 'image1.jpg',
            description: '작품에 대한 상세한 이야기를 적어주세요.'
        });

        // 데이터 유효성 검사 (드롭다운) 설정 값
        const media = ['회화', '판화 및 에디션', '드로잉 및 스케치', '사진', '조각 및 설치', '디지털 아트', '기타'];
        const styles = ['추상', '구상/재현', '팝 아트', '미니멀리즘', '인상주의', '초현실주의', '기타'];
        const subjects = ['풍경', '인물', '정물', '동물', '기하학', '일상/사회', '기타'];
        const spaces = ['거실용', '침실용', '아이방', '사무실/카페'];

        // 2행부터 100행까지 드롭다운 적용
        for (let i = 2; i <= 100; i++) {
            worksheet.getCell(`C${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [`"${media.join(',')}"`] };
            worksheet.getCell(`D${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [`"${styles.join(',')}"`] };
            worksheet.getCell(`E${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [`"${subjects.join(',')}"`] };
            worksheet.getCell(`F${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [`"${spaces.join(',')}"`] };
        }

        // 헤더 스타일링
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'ArtsFactory_Bulk_Upload_Template.xlsx';
        anchor.click();
        window.URL.revokeObjectURL(url);
    };

    // 엑셀 파일 처리
    const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws) as BulkExcelRow[];

            const mappedItems: BulkItem[] = data.map((row, idx) => ({
                id: `bulk-${idx}-${Date.now()}`,
                title: row['작품명'] || '',
                artistEmail: row['작가이메일'] || '',
                category: row['장르/매체(Category)'] || row['카테고리'] || '회화',
                style: row['스타일/기법(Style)'] || row['스타일'] || '추상',
                subject: row['소재/주제(Subject)'] || row['주제'] || '풍경',
                space: row['추천공간(Space)'] || row['공간'] || '거실용',
                price: Number(row['판매가(₩)']) || Number(row['판매가']) || 0,
                rental_price: Number(row['월렌탈료(₩)']) || Number(row['렌탈료']) || 0,
                width: Number(row['가로(cm)']) || 0,
                height: Number(row['세로(cm)']) || 0,
                ho: Number(row['호수(호)']) || Number(String(row['호수'] || '').replace(/[^0-9]/g, '')) || 0,
                year: String(row['제작연도'] || ''),
                material: String(row['재질/기법']) || String(row['재료'] || ''),
                description: String(row['작품설명'] || ''),
                imageFilename: row['이미지파일명'] || '',
                status: 'pending'
            }));

            setItems(mappedItems);
        };
        reader.readAsBinaryString(file);
    };

    // 이미지 파일 다중 업로드 및 매칭
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || items.length === 0) return;

        const uploadedFiles = Array.from(files);

        setItems(prev => prev.map(item => {
            // 1. 전처리 함수 정의
            const normalize = (name: string) => name.replace(/\s+/g, '').toLowerCase();
            const getBaseName = (name: string) => {
                const lastDot = name.lastIndexOf('.');
                if (lastDot === -1) return name;
                // 뒤가 2-4글자면 확장자로 추정하고 제거 (jpg, png, webp 등)
                const ext = name.substring(lastDot + 1).toLowerCase();
                if (ext.length >= 2 && ext.length <= 4) return name.substring(0, lastDot);
                return name;
            };

            const targetRaw = item.imageFilename || '';
            const targetNorm = normalize(targetRaw);
            if (!targetNorm) return item;

            // 2. 매칭 시도
            const matchedFile = uploadedFiles.find(f => {
                const fileName = f.name;
                const fileNorm = normalize(fileName);

                // 시도 A: 완전 일치 (공백/대소문자 무시)
                if (fileNorm === targetNorm) return true;

                // 시도 B: 확장자 제거 후 비교 (타겟이나 파일 중 하나에 확장자가 없을 때 대비)
                const targetBaseNorm = normalize(getBaseName(targetRaw));
                const fileBaseNorm = normalize(getBaseName(fileName));

                return fileBaseNorm === targetBaseNorm || fileBaseNorm === targetNorm || fileNorm === targetBaseNorm;
            });

            if (matchedFile) {
                return { ...item, fileContent: matchedFile };
            }

            return item;
        }));
    };

    // AI 일괄 설명 생성
    const handleBulkAiGenerate = async () => {
        // 이미지가 있고, 설명이 비어있으며, 아직 처리되지 않은 항목 필터링
        const targets = items.filter(item =>
            item.fileContent &&
            (!item.description || item.description.trim() === '') &&
            item.status !== 'success'
        );

        if (targets.length === 0) {
            alert("설명 생성이 필요한 항목이 없습니다. (이미지가 필수입니다)");
            return;
        }

        if (!confirm(`총 ${targets.length}개의 작품에 대해 설명을 생성하시겠습니까?\n(시간이 다소 소요될 수 있습니다)`)) return;

        setAiGenerating(true);
        setAiProgress({ current: 0, total: targets.length });

        const aiImageOptions = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
        };

        for (let i = 0; i < targets.length; i++) {
            const item = targets[i];
            setAiProgress({ current: i + 1, total: targets.length });

            try {
                // 이미지 압축 및 Base64 변환
                const compressedFile = await imageCompression(item.fileContent!, aiImageOptions);
                const reader = new FileReader();
                const imageBase64 = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(compressedFile);
                });

                // AI 호출
                const res = await generateArtworkDescription({
                    title: item.title,
                    category: item.category,
                    material: item.material || '',
                    keywords: '',
                    imageBase64: imageBase64
                });

                if (res.success && res.description) {
                    setItems(prev => prev.map(current =>
                        current.id === item.id
                            ? { ...current, description: res.description }
                            : current
                    ));
                }
            } catch {
                console.error(`Item ${item.id} AI generation failed:`);
            }

            // Rate Limit 방지용 딜레이 (1초)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        setAiGenerating(false);
        alert("일괄 설명 생성이 완료되었습니다.");
    };

    // 일괄 등록 실행
    const handleBulkSubmit = async () => {
        const validItems = items.filter(item => item.fileContent && item.artistEmail);
        if (validItems.length === 0) return;

        setUploading(true);

        for (const item of items) {
            if (!item.fileContent || item.status === 'success') continue;

            const artist = users.find(u => u.email === item.artistEmail);
            if (!artist) {
                setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', errorMsg: '작가를 찾을 수 없음' } : i));
                continue;
            }

            setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'uploading' } : i));

            try {
                // Firebase Upload (Bulk에도 WebP 변환 및 압축 적용)
                const { downloadURL, storagePath } = await uploadImageAsWebP(
                    item.fileContent,
                    'artworks/bulk'
                );

                // DB Save
                const res = await createArtwork({
                    title: item.title,
                    description: item.description || '',
                    category: item.category,
                    style: item.style,
                    subject: item.subject,
                    space: item.space,
                    price: item.price,
                    rental_price: item.rental_price,
                    width: item.width,
                    height: item.height,
                    ho: item.ho,
                    year: item.year,
                    material: item.material,
                    artist_id: artist._id,
                    status: 'approved',
                    firebase_image_url: downloadURL,
                    firebase_storage_path: storagePath
                });

                if (res.success) {
                    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'success' } : i));
                } else {
                    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', errorMsg: 'DB 저장 실패' } : i));
                }
            } catch {
                setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', errorMsg: '업로드 오류' } : i));
            }
        }

        setUploading(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-[42px] font-black tracking-tighter leading-tight text-black">
                        일괄 등록 <br /> (BULK)
                    </h2>
                    <p className="text-gray-400 mt-2 font-medium">엑셀 파일을 사용하여 다수의 작품을 한 번에 등록합니다.</p>
                </div>
                <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
                >
                    <Download className="w-4 h-4" /> 엑셀 템플릿 다운로드
                </button>
            </div>

            {/* Step 1 & 2: Upload Zones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Step 1: Excel */}
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 bg-black h-full" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center font-black text-xs text-black border border-gray-100">1</div>
                        <h3 className="text-base font-bold">엑셀 메타데이터 업로드</h3>
                    </div>
                    <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-100 rounded-2xl hover:border-black transition-all cursor-pointer group-hover:bg-gray-50/50">
                        <FileUp className="w-6 h-6 text-gray-300 mb-1" />
                        <span className="text-xs font-bold text-gray-500">Excel 파일 선택 (.xlsx)</span>
                        <input type="file" onChange={handleExcelUpload} accept=".xlsx, .xls" className="hidden" />
                    </label>
                </div>

                {/* Step 2: Images */}
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 bg-blue-500 h-full" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center font-black text-xs text-black border border-gray-100">2</div>
                        <h3 className="text-base font-bold">이미지 파일 벌크 업로드</h3>
                    </div>
                    <label className={`flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-100 rounded-2xl transition-all ${items.length > 0 ? 'hover:border-blue-500 cursor-pointer' : 'opacity-50 cursor-not-allowed'} group-hover:bg-gray-50/50`}>
                        <Images className="w-6 h-6 text-gray-300 mb-1" />
                        <span className="text-xs font-bold text-gray-500">이미지 폴더 내 전체 선택</span>
                        <input type="file" onChange={handleImageUpload} accept="image/*" multiple className="hidden" disabled={items.length === 0} />
                    </label>
                </div>
            </div>

            {/* Step 3: Preview and Match */}
            {items.length > 0 && (
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-top-4 duration-500">
                    <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold">업로드 검토 및 매칭</h3>
                            <span className="px-3 py-1 bg-black text-white text-[10px] font-black rounded-full uppercase tracking-tighter">{items.length} Items</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBulkAiGenerate}
                                disabled={aiGenerating || uploading}
                                className="px-5 py-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                {aiGenerating ? `생성 중... (${aiProgress.current}/${aiProgress.total})` : "AI 일괄 설명 생성"}
                            </button>

                            <button
                                onClick={handleBulkSubmit}
                                disabled={uploading || items.every(i => i.status === 'success') || aiGenerating}
                                className="px-8 py-3 bg-black text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 transition-all shadow-xl shadow-black/10"
                            >
                                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "일괄 등록 시작하기"}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white">
                                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">작품 메타데이터</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">대상 작가</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">이미지 파일 매칭</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">진행 상태</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-10 py-5 max-w-sm">
                                            <div className="font-bold text-gray-900 text-sm">{item.title}</div>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-tighter mt-1">
                                                {item.category} | {item.style} | {item.subject} | {item.space}
                                            </div>
                                            <div className="text-[10px] text-blue-500 font-black mt-1">
                                                {item.width}x{item.height}cm ({item.ho}호) / ₩{item.price.toLocaleString()}
                                            </div>
                                            {item.description && (
                                                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg whitespace-pre-wrap">
                                                    {item.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-medium ${users.some(u => u.email === item.artistEmail) ? 'text-gray-700' : 'text-red-500'}`}>
                                                    {item.artistEmail || 'Missing Email'}
                                                </span>
                                                {!users.some(u => u.email === item.artistEmail) && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${item.fileContent ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    <Images className="w-4 h-4" />
                                                </div>
                                                <span className="text-[11px] font-bold text-gray-500 truncate max-w-[120px]">{item.imageFilename}</span>
                                                {item.fileContent ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-tighter bg-orange-50 px-1.5 py-0.5 rounded">Not Found</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {item.status === 'success' ? (
                                                <div className="flex items-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest">
                                                    <CheckCircle2 className="w-4 h-4" /> 등록 완료
                                                </div>
                                            ) : item.status === 'uploading' ? (
                                                <div className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                                                    <Loader2 className="w-4 h-4 animate-spin" /> 처리 중
                                                </div>
                                            ) : item.status === 'error' ? (
                                                <div className="flex items-center gap-2 text-red-600 text-[10px] font-black uppercase tracking-widest">
                                                    <AlertCircle className="w-4 h-4" /> {item.errorMsg || '실패'}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest italic">대기 중</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Instruction Tip */}
            <div className="bg-black/5 rounded-[32px] p-8 flex gap-6 items-start">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                    <Info className="w-6 h-6 text-black" />
                </div>
                <div>
                    <h4 className="font-bold text-black mb-1">대량 업로드 가이드</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        1. 템플릿 파일을 다운로드하세요. **장르, 스타일, 주제, 공간** 항목은 엑셀 내 **드롭다운**에서 선택 가능합니다. <br />
                        2. **가로, 세로, 호수** 등 규격 정보는 숫자로만 입력해 주세요. (예: 53, 45.5, 10) <br />
                        3. &apos;이미지파일명&apos; 열에는 업로드할 파일명을 입력해 주세요. (확장자 `.jpg`, `.png` 등은 생략해도 무방합니다.) <br />
                        4. 엑셀 업로드 후, 우측의 이미지 업로드 영역에서 해당 파일들을 한꺼번에 선택해 주세요. <br />
                        5. 작가 이메일은 시스템에 등록된 파트너의 이메일과 대조하여 자동 매칭됩니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
