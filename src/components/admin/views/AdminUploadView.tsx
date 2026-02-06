"use client";

import React, { useState, useEffect } from 'react';
import { uploadImageAsWebP } from '@/lib/upload';
import imageCompression from 'browser-image-compression';
import { createArtwork, updateArtwork } from '@/app/actions/artwork';
import { generateArtworkDescription } from '@/app/actions/ai';
import { Trash2, Image as ImageIcon, Plus, Info, ChevronDown, CheckCircle2, AlertCircle, Loader2, Sparkles, Upload, User, ArrowLeft } from 'lucide-react';

interface AdminUploadViewProps {
    users: any[];
    initialData?: any;
    onBack?: () => void;
    onSuccess?: () => void;
}

export default function AdminUploadView({ users, initialData, onBack, onSuccess }: AdminUploadViewProps) {
    const isEdit = !!initialData;
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(initialData?.firebase_image_url || null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        category: initialData?.category || '회화',
        season: initialData?.season || '사계절',
        space: initialData?.space || '거실',
        size: initialData?.size || '',
        year: initialData?.year || '',
        material: initialData?.material || '',
        price: initialData?.price ? Number(initialData.price).toLocaleString() : '',
        rental_price: initialData?.rental_price ? Number(initialData.rental_price).toLocaleString() : '',
        vr_url: initialData?.vr_url || '',
        artist_id: initialData?.artist_id?._id || initialData?.artist_id || '',
    });

    const [aiLoading, setAiLoading] = useState(false);

    const handleGenerateDescription = async () => {
        if (!formData.title || !formData.category || !formData.material) {
            alert("AI 설명을 생성하기 위해 제목, 카테고리, 재료/기법을 입력해주세요.");
            return;
        }

        setAiLoading(true);
        try {
            let imageBase64: string | undefined = undefined;

            // 이미지 압축 설정 (AI 분석용, 최대 1MB, 1024px)
            const aiImageOptions = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
            };

            // 1. 현재 선택된 파일이 있으면 변환
            if (file) {
                const compressedFile = await imageCompression(file, aiImageOptions);
                const reader = new FileReader();
                imageBase64 = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(compressedFile);
                });
            }
            // 2. 파일은 없지만 기존 프리뷰(URL)가 있는 경우 (수정 모드)
            else if (!file && preview && preview.startsWith('http')) {
                try {
                    const response = await fetch(preview);
                    const blob = await response.blob();
                    const fileFromBlob = new File([blob], "image.jpg", { type: blob.type });
                    const compressedFile = await imageCompression(fileFromBlob, aiImageOptions);

                    const reader = new FileReader();
                    imageBase64 = await new Promise<string>((resolve, reject) => {
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(compressedFile);
                    });
                } catch (e) {
                    console.warn("기존 이미지 로드 실패, 텍스트 기반으로 생성합니다:", e);
                }
            }

            const res = await generateArtworkDescription({
                title: formData.title,
                category: formData.category,
                material: formData.material,
                keywords: formData.season + ", " + formData.space,
                imageBase64: imageBase64
            });

            if (res.success && res.description) {
                setFormData(prev => ({ ...prev, description: res.description }));
            } else {
                alert("설명 생성 실패: " + res.error);
            }
        } catch (error) {
            console.error(error);
            alert("AI 설명 생성 중 오류가 발생했습니다.");
        } finally {
            setAiLoading(false);
        }
    };

    // 메모리 누수 방지
    useEffect(() => {
        return () => {
            if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setIsPreviewLoading(true);
            setPreview(null);
            if (preview) URL.revokeObjectURL(preview);

            try {
                const previewOptions = {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 800,
                    useWebWorker: true,
                };
                const previewBlob = await imageCompression(selectedFile, previewOptions);
                const objectUrl = URL.createObjectURL(previewBlob);
                setPreview(objectUrl);
            } catch (error) {
                const rawObjectUrl = URL.createObjectURL(selectedFile);
                setPreview(rawObjectUrl);
            } finally {
                setIsPreviewLoading(false);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'price' || name === 'rental_price') {
            const numericValue = value.replace(/[^0-9]/g, '');
            const formattedValue = numericValue ? Number(numericValue).toLocaleString() : '';
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.artist_id) return;
        if (!isEdit && !file) return;

        setUploading(true);
        setStatus('uploading');

        try {
            let downloadURL = initialData?.firebase_image_url;
            let storagePath = initialData?.firebase_storage_path;

            if (file) {
                const uploadRes = await uploadImageAsWebP(file, 'artworks', {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    onProgress: (p: number) => setProgress(p)
                });
                downloadURL = uploadRes.downloadURL;
                storagePath = uploadRes.storagePath;
            }

            const payload = {
                ...formData,
                firebase_image_url: downloadURL,
                firebase_storage_path: storagePath,
                price: Number(String(formData.price || '0').split(',').join('')),
                rental_price: Number(String(formData.rental_price || '0').split(',').join('')),
            };

            const result = isEdit
                ? await updateArtwork(initialData._id, payload)
                : await createArtwork({ ...payload, status: 'approved' });

            if (result.success) {
                setStatus('success');
                if (!isEdit) {
                    setFile(null);
                    setPreview(null);
                    setFormData({
                        ...formData,
                        title: '',
                        description: '',
                        size: '',
                        year: '',
                        material: '',
                        price: '',
                        rental_price: '',
                        vr_url: '',
                    });
                }
                setTimeout(() => {
                    setStatus('idle');
                    if (onSuccess) onSuccess();
                }, 1500);
            } else {
                setStatus('error');
            }
            setUploading(false);
        } catch (error) {
            console.error("Upload error:", error);
            setStatus('error');
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-10 bg-white rounded-[40px] shadow-sm border border-gray-50 mt-4 animate-in fade-in duration-700">
            <div className="mb-12 relative">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="absolute -top-4 -left-4 p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}
                <h2 className="text-3xl font-black text-black tracking-tighter uppercase mb-2">
                    {isEdit ? "작품 정보 수정" : "작품 대리 등록"}
                </h2>
                <div className="h-1 w-12 bg-black rounded-full" />
                <p className="text-gray-400 mt-4 text-sm font-medium">
                    {isEdit ? "선택한 작품의 상세 정보를 수정합니다." : "관리자가 작가를 대신하여 새로운 작품을 시스템에 등록합니다."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. 작가 선택 (관리자 전용) */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <User className="w-3 h-3" /> 등록 작가 선택
                    </label>
                    <div className="relative group">
                        <select
                            name="artist_id"
                            value={formData.artist_id}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-14 pr-12 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] text-sm font-bold text-black focus:bg-white focus:border-black transition-all appearance-none cursor-pointer outline-none shadow-sm"
                        >
                            <option value="">등록할 작가를 선택해 주세요</option>
                            {users.map(u => (
                                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-focus-within:text-black transition-colors" />
                    </div>
                </div>

                {/* 2. 작품 이미지 업로드 */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">작품 이미지 업로드</label>
                    <div className="relative border-2 border-dashed border-gray-200 rounded-[32px] p-8 min-h-[280px] transition-all bg-gray-50/50 group flex items-center justify-center hover:bg-gray-50 hover:border-black">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            accept="image/*"
                            disabled={uploading}
                        />

                        {preview ? (
                            <div className="flex flex-col md:flex-row items-center justify-between w-full h-full gap-8">
                                <div className="flex-1 text-left space-y-4 z-10">
                                    <div className="flex items-center gap-2 text-black mb-1">
                                        <div className="p-2 bg-black rounded-xl shadow-lg">
                                            <ImageIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="font-bold text-lg tracking-tight">
                                            {file ? "새 이미지 선택됨" : "기존 이미지 유지 중"}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-900 break-all leading-tight text-sm">
                                            {file ? file.name : "현재 등록된 작품 이미지"}
                                        </p>
                                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">
                                            {file ? "WebP 최적화 프로토콜 활성화" : "Cloud Storage 동기화 상태"}
                                        </p>
                                    </div>
                                    <button type="button" className="text-[10px] px-5 py-2.5 bg-white border border-gray-200 text-gray-900 font-bold uppercase tracking-widest rounded-full hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm">
                                        이미지 변경하기
                                    </button>
                                </div>

                                <div className="relative w-full md:w-40 aspect-square rounded-[24px] overflow-hidden border-4 border-white shadow-2xl ring-1 ring-black/5 flex-shrink-0 bg-white flex items-center justify-center">
                                    {isPreviewLoading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-8 h-8 animate-spin text-gray-200" />
                                        </div>
                                    ) : preview ? (
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={() => setPreview(null)}
                                        />
                                    ) : (
                                        <ImageIcon className="w-10 h-10 text-gray-100" />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-xl transition-all duration-500">
                                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-black transition-colors" />
                                </div>
                                <p className="text-xl font-bold text-gray-900 tracking-tight">작품 이미지 업로드</p>
                                <p className="text-xs text-gray-400 mt-2 font-medium">클릭하거나 파일을 이곳에 드래그하세요</p>
                                <p className="text-[9px] text-gray-300 mt-4 font-bold uppercase tracking-[0.2em]">WebP High Performance Protocol</p>
                            </div>
                        )}
                    </div>
                </div>

                {uploading && (
                    <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden -mt-4">
                        <div
                            className="bg-black h-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {/* 3. 작품 상세 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">작품 제목</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-black font-bold placeholder:text-gray-300 outline-none transition-all shadow-sm"
                            placeholder="작품 제목을 입력하세요"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">카테고리</label>
                        <div className="relative group">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-black font-bold outline-none transition-all appearance-none cursor-pointer shadow-sm"
                            >
                                <option>회화</option>
                                <option>사진</option>
                                <option>조각</option>
                                <option>디지털 아트</option>
                                <option>기타</option>
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-focus-within:text-black transition-colors" />
                        </div>
                    </div>
                </div>

                {/* 계절 및 공간 추가 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">추천 계절</label>
                        <div className="relative group">
                            <select
                                name="season"
                                value={formData.season}
                                onChange={handleInputChange}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-black font-bold outline-none transition-all appearance-none cursor-pointer shadow-sm"
                            >
                                <option>사계절</option><option>봄</option><option>여름</option><option>가을</option><option>겨울</option>
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-focus-within:text-black transition-colors" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">추천 공간</label>
                        <div className="relative group">
                            <select
                                name="space"
                                value={formData.space}
                                onChange={handleInputChange}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-black font-bold outline-none transition-all appearance-none cursor-pointer shadow-sm"
                            >
                                <option>거실</option><option>침실</option><option>서재/오피스</option><option>주방</option><option>현관/복도</option>
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-focus-within:text-black transition-colors" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">사이즈 (호)</label>
                        <input type="text" name="size" value={formData.size} onChange={handleInputChange} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-black font-bold placeholder:text-gray-300 outline-none transition-all shadow-sm" placeholder="예: 10호" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">제작 연도</label>
                        <input type="text" name="year" value={formData.year} onChange={handleInputChange} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-black font-bold placeholder:text-gray-300 outline-none transition-all shadow-sm" placeholder="예: 2023" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">재질 / 기법</label>
                        <input type="text" name="material" value={formData.material} onChange={handleInputChange} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-black font-bold placeholder:text-gray-300 outline-none transition-all shadow-sm" placeholder="예: 유채" />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">작품 설명</label>
                        <button
                            type="button"
                            onClick={handleGenerateDescription}
                            disabled={aiLoading}
                            className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            AI 자동 생성 (Gemini)
                        </button>
                    </div>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={6}
                        className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-black text-black font-medium placeholder:text-gray-300 outline-none transition-all resize-none shadow-sm leading-relaxed"
                        placeholder="작품에 대한 풍부한 설명을 직접 입력하거나, 위 버튼을 눌러 AI에게 작성을 요청해보세요."
                    />
                </div>

                {/* VR Gallery Link */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">VR 갤러리 URL (선택사항)</label>
                    <input
                        type="url"
                        name="vr_url"
                        value={formData.vr_url}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-black font-bold placeholder:text-gray-300 outline-none transition-all shadow-sm font-sans"
                        placeholder="https://vr-gallery.link/..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">판매 가격 (₩)</label>
                        <input type="text" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-black font-black outline-none transition-all shadow-sm" placeholder="0" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">월 렌탈료 (₩)</label>
                        <input type="text" name="rental_price" value={formData.rental_price} onChange={handleInputChange} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-blue-600 font-black outline-none transition-all shadow-sm" placeholder="0" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={uploading || (!isEdit && !file) || !formData.artist_id}
                    className="w-full py-6 bg-black text-white rounded-[28px] font-black text-lg hover:bg-gray-800 active:scale-[0.98] transition-all disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center gap-3 shadow-2xl shadow-black/10 mt-6 overflow-hidden relative group"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="uppercase tracking-widest">저장 중...</span>
                        </>
                    ) : status === 'success' ? (
                        <>
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                            <span className="uppercase tracking-widest text-green-400">등록 완료</span>
                        </>
                    ) : (
                        <>
                            <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                            <span className="uppercase tracking-[0.2em]">{isEdit ? "수정사항 저장하기" : "작품 등록하기"}</span>
                        </>
                    )}
                </button>

                {status === 'error' && (
                    <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest animate-pulse">
                        오류가 발생했습니다. 연결 상태를 확인하고 다시 시도해 주세요.
                    </p>
                )}
            </form>
        </div>
    );
}
