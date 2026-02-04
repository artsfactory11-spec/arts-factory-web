"use client";

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
    FileUp,
    Images,
    AlertCircle,
    CheckCircle2,
    Loader2,
    X,
    Info,
    Download
} from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref } from "firebase/storage";
import { uploadImageAsWebP } from '@/lib/upload';
import { createArtwork } from '@/app/actions/artwork';

interface BulkUploadViewProps {
    users: any[];
}

interface BulkItem {
    id: string;
    title: string;
    artistEmail: string;
    category: string;
    price: number;
    rental_price: number;
    size?: string;
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
    const [overallStatus, setOverallStatus] = useState<'idle' | 'processing' | 'done'>('idle');

    // 엑셀 템플릿 다운로드 시뮬레이션
    const downloadTemplate = () => {
        const templateData = [
            {
                '작품명': '예시 작품 1',
                '작가이메일': 'artist@example.com',
                '카테고리': '회화',
                '판매가': 1000000,
                '렌탈료': 100000,
                '호수': '10호',
                '제작연도': '2023',
                '재료': '캔버스에 유채',
                '이미지파일명': 'image1.jpg',
                '작품설명': '작품에 대한 설명입니다.'
            }
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "ArtsFactory_Bulk_Template.xlsx");
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
            const data = XLSX.utils.sheet_to_json(ws) as any[];

            const mappedItems: BulkItem[] = data.map((row, idx) => ({
                id: `bulk-${idx}-${Date.now()}`,
                title: row['작품명'] || '',
                artistEmail: row['작가이메일'] || '',
                category: row['카테고리'] || '회화',
                price: Number(row['판매가']) || 0,
                rental_price: Number(row['렌탈료']) || 0,
                size: String(row['호수'] || ''),
                year: String(row['제작연도'] || ''),
                material: String(row['재료'] || ''),
                description: String(row['작품설명'] || ''),
                imageFilename: row['이미지파일명'] || '',
                status: 'pending'
            }));

            setItems(mappedItems);
            setOverallStatus('idle');
        };
        reader.readAsBinaryString(file);
    };

    // 이미지 파일 다중 업로드 및 매칭
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || items.length === 0) return;

        const fileMap = new Map<string, File>();
        Array.from(files).forEach(f => fileMap.set(f.name, f));

        setItems(prev => prev.map(item => {
            if (fileMap.has(item.imageFilename)) {
                return { ...item, fileContent: fileMap.get(item.imageFilename) };
            }
            return item;
        }));
    };

    // 일괄 등록 실행
    const handleBulkSubmit = async () => {
        const validItems = items.filter(item => item.fileContent && item.artistEmail);
        if (validItems.length === 0) return;

        setUploading(true);
        setOverallStatus('processing');

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
                    price: item.price,
                    rental_price: item.rental_price,
                    size: item.size,
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
            } catch (err) {
                setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', errorMsg: '업로드 오류' } : i));
            }
        }

        setUploading(false);
        setOverallStatus('done');
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
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
                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 bg-black h-full" />
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-black border border-gray-100">1</div>
                        <h3 className="text-lg font-bold">엑셀 메타데이터 업로드</h3>
                    </div>
                    <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-100 rounded-3xl hover:border-black transition-all cursor-pointer group-hover:bg-gray-50/50">
                        <FileUp className="w-10 h-10 text-gray-300 mb-2" />
                        <span className="text-sm font-bold text-gray-500">Excel 파일 선택 (.xlsx)</span>
                        <input type="file" onChange={handleExcelUpload} accept=".xlsx, .xls" className="hidden" />
                    </label>
                </div>

                {/* Step 2: Images */}
                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 bg-blue-500 h-full" />
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-black border border-gray-100">2</div>
                        <h3 className="text-lg font-bold">이미지 파일 벌크 업로드</h3>
                    </div>
                    <label className={`flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-100 rounded-3xl transition-all ${items.length > 0 ? 'hover:border-blue-500 cursor-pointer' : 'opacity-50 cursor-not-allowed'} group-hover:bg-gray-50/50`}>
                        <Images className="w-10 h-10 text-gray-300 mb-2" />
                        <span className="text-sm font-bold text-gray-500">이미지 폴더 내 전체 선택</span>
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
                        <button
                            onClick={handleBulkSubmit}
                            disabled={uploading || items.every(i => i.status === 'success')}
                            className="px-8 py-3 bg-black text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 transition-all shadow-xl shadow-black/10"
                        >
                            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "일괄 등록 시작하기"}
                        </button>
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
                                        <td className="px-10 py-5">
                                            <div className="font-bold text-gray-900 text-sm">{item.title}</div>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-tighter mt-1">{item.category} / ₩{item.price.toLocaleString()}</div>
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
                        1. 템플릿 엑셀 파일을 다운로드하여 작품 정보를 입력하세요. <br />
                        2. '이미지파일명' 열에는 실제 업로드할 파일의 이름(확장자 포함)을 정확히 입력해야 합니다. <br />
                        3. 엑셀을 먼저 업로드한 뒤, 이미지 파일들을 한꺼번에 선택하여 매칭시키세요. <br />
                        4. 작가 이메일은 시스템에 등록된 파트너의 이메일과 일치해야 합니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
