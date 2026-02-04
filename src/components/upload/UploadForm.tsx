'use client';

import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { createArtwork } from '@/app/actions/artwork';
import { Upload, Image as ImageIcon, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function UploadForm({ artistId }: { artistId: string }) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '회화',
        season: '사계절',
        space: '거실',
        size: '',
        year: '',
        material: '',
        price: '',
        rental_price: '',
    });

    // 메모리 누수 방지를 위한 프리뷰 URL 해제
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setIsPreviewLoading(true);
            setPreview(null); // 새로운 파일 선택 시 초기화

            // 기존 프리뷰 URL 해제
            if (preview) URL.revokeObjectURL(preview);

            try {
                // 특정 파일 형식(TIFF 등)은 브라우저에서 직접 압축이 실패할 수 있음
                // 1. 먼저 최적화를 시도하여 미리보기를 생성
                const previewOptions = {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 800,
                    useWebWorker: true,
                };

                const previewBlob = await imageCompression(selectedFile, previewOptions);
                const objectUrl = URL.createObjectURL(previewBlob);
                setPreview(objectUrl);
            } catch (error) {
                // 2. 압축 실패 시(TIFF 등) 원본 주소로 시도하여 브라우저 자체 렌더링에 의존
                console.warn("Preview compression failed, falling back to raw file URL for:", selectedFile.name);
                const rawObjectUrl = URL.createObjectURL(selectedFile);
                setPreview(rawObjectUrl);
            } finally {
                setIsPreviewLoading(false);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // 판매가 및 렌탈료 포맷팅 처리
        if (name === 'price' || name === 'rental_price') {
            // 숫자만 추출
            const numericValue = value.replace(/[^0-9]/g, '');
            // 천단위 콤마 추가
            const formattedValue = numericValue ? Number(numericValue).toLocaleString() : '';
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setStatus('uploading');

        try {
            // 1. 클라이언트 사이드 이미지 압축 및 WebP 변환
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: 'image/webp' as const, // WebP 형식으로 변환
            };
            const compressedFile = await imageCompression(file, options);

            // 2. Firebase Storage 업로드 (.webp 확장자 강제)
            const fileName = file.name.split('.')[0];
            const storagePath = `artworks/${Date.now()}_${fileName}.webp`;
            const storageRef = ref(storage, storagePath);
            const uploadTask = uploadBytesResumable(storageRef, compressedFile);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(p);
                },
                (error) => {
                    console.error("Firebase upload error:", error);
                    setStatus('error');
                    setUploading(false);
                },
                async () => {
                    // 3. 다운로드 URL 가져오기
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    // 4. MongoDB에 저장 (Server Action)
                    const result = await createArtwork({
                        ...formData,
                        artist_id: artistId, // 실제 아티스트 ID 사용
                        firebase_image_url: downloadURL,
                        firebase_storage_path: storagePath,
                        price: Number(String(formData.price || '0').split(',').join('')),
                        rental_price: Number(String(formData.rental_price || '0').split(',').join('')),
                    });


                    if (result.success) {
                        setStatus('success');
                        setFile(null);
                        setPreview(null);
                        setFormData({
                            title: '',
                            description: '',
                            category: '회화',
                            season: '사계절',
                            space: '거실',
                            size: '',
                            year: '',
                            material: '',
                            price: '',
                            rental_price: '',
                        });
                    } else {
                        setStatus('error');
                    }
                    setUploading(false);
                }
            );
        } catch (error) {
            console.error("Submission error:", error);
            setStatus('error');
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100 mt-10">
            <h2 className="text-3xl font-bold mb-8 text-black tracking-tight border-b pb-4">새 작품 등록</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 파일 업로드 영역 - 미리보기 분할 레이아웃 */}
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 min-h-[220px] transition-all bg-gray-50/80 group flex items-center justify-center">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        accept="image/*"
                        disabled={uploading}
                    />

                    {file ? (
                        <div className="flex flex-col md:flex-row items-center justify-between w-full h-full gap-8 p-2">
                            {/* 좌측: 파일 정보 (명칭 등) */}
                            <div className="flex-1 text-left space-y-3 z-10">
                                <div className="flex items-center gap-2 text-black mb-1">
                                    <div className="p-2 bg-black rounded-lg">
                                        <ImageIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-bold text-lg tracking-tight">선택된 작품 정보</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-gray-900 break-all leading-tight">{file.name}</p>
                                    <p className="text-[11px] text-blue-600 font-medium">자동 최적화 (WebP) 시스템 적용 중</p>
                                </div>
                                <div className="pt-2">
                                    <button className="text-[10px] px-3 py-1.5 border border-black text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors duration-300">
                                        파일 변경하기
                                    </button>
                                </div>
                            </div>

                            {/* 우측: 작품 미리보기 확인 */}
                            <div className="relative w-full md:w-48 aspect-square rounded-lg overflow-hidden border-2 border-white shadow-xl ring-1 ring-black/5 flex-shrink-0 bg-white flex items-center justify-center">
                                {isPreviewLoading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                                        <span className="text-[10px] text-gray-400 font-medium tracking-tight">이미지 최적화 중...</span>
                                    </div>
                                ) : preview ? (
                                    <>
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={() => setPreview(null)}
                                        />
                                        <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                                        <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm text-[8px] text-white px-1.5 py-0.5 rounded italic">
                                            Preview
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 p-4 text-center bg-gray-50/50 w-full h-full justify-center">
                                        <div className="p-3 bg-gray-100 rounded-full">
                                            <ImageIcon className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-gray-500 font-bold leading-tight">미리보기 미지원 포맷</p>
                                            <p className="text-[9px] text-gray-400 leading-tight">TIFF 등 전문 포맷은<br />등록 후 갤러리에서 확인 가능합니다</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Upload className="w-14 h-14 mb-3 text-gray-400 group-hover:text-black transition-colors" />
                            <p className="text-lg font-bold text-gray-900 tracking-tight">이미지 업로드</p>
                            <p className="text-sm text-gray-400 mt-1">이곳을 클릭하여 작품 파일을 선택하세요</p>
                            <p className="text-xs text-gray-300 mt-3 font-light italic">장기 보존과 로딩 속도를 위해 자동으로 WebP 변환이 수행됩니다</p>
                        </div>
                    )}
                </div>

                {/* 진행 바 */}
                {uploading && (
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner -mt-4">
                        <div
                            className="bg-black h-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-gray-900 ml-1">작품명</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full p-3.5 border-2 border-gray-200 rounded-lg focus:border-black text-black font-medium placeholder:text-gray-300 outline-none transition-all bg-white"
                            placeholder="작품 제목을 입력하세요"
                        />
                    </div>

                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-gray-900 ml-1">카테고리</label>
                        <div className="relative">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full p-3.5 border-2 border-gray-200 rounded-lg focus:border-black text-black font-medium outline-none transition-all bg-white appearance-none cursor-pointer pr-10"
                            >
                                <option>회화</option>
                                <option>사진</option>
                                <option>조각</option>
                                <option>디지털 아트</option>
                                <option>기타</option>
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-gray-900 ml-1">추천 계절</label>
                        <div className="relative">
                            <select
                                name="season"
                                value={formData.season}
                                onChange={handleInputChange}
                                className="w-full p-3.5 border-2 border-gray-200 rounded-lg focus:border-black text-black font-medium outline-none transition-all bg-white appearance-none cursor-pointer pr-10"
                            >
                                <option>사계절</option>
                                <option>봄</option>
                                <option>여름</option>
                                <option>가을</option>
                                <option>겨울</option>
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-gray-900 ml-1">추천 공간</label>
                        <div className="relative">
                            <select
                                name="space"
                                value={formData.space}
                                onChange={handleInputChange}
                                className="w-full p-3.5 border-2 border-gray-200 rounded-lg focus:border-black text-black font-medium outline-none transition-all bg-white appearance-none cursor-pointer pr-10"
                            >
                                <option>거실</option>
                                <option>침실</option>
                                <option>서재/오피스</option>
                                <option>주방</option>
                                <option>현관/복도</option>
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-gray-900 ml-1">호수/크기</label>
                        <input
                            type="text"
                            name="size"
                            value={formData.size}
                            onChange={handleInputChange}
                            className="w-full p-3.5 border-2 border-gray-200 rounded-lg focus:border-black text-black font-medium placeholder:text-gray-300 outline-none transition-all"
                            placeholder="예: 10호"
                        />
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-gray-900 ml-1">제작연도</label>
                        <input
                            type="text"
                            name="year"
                            value={formData.year}
                            onChange={handleInputChange}
                            className="w-full p-3.5 border-2 border-gray-200 rounded-lg focus:border-black text-black font-medium placeholder:text-gray-300 outline-none transition-all"
                            placeholder="예: 2023"
                        />
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-gray-900 ml-1">재료</label>
                        <input
                            type="text"
                            name="material"
                            value={formData.material}
                            onChange={handleInputChange}
                            className="w-full p-3.5 border-2 border-gray-200 rounded-lg focus:border-black text-black font-medium placeholder:text-gray-300 outline-none transition-all"
                            placeholder="예: 캔버스에 유채"
                        />
                    </div>
                </div>

                <div className="space-y-2.5">
                    <label className="text-sm font-bold text-gray-900 ml-1">작품 설명</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={5}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-black text-black font-medium placeholder:text-gray-300 outline-none transition-all resize-none"
                        placeholder="작품에 대한 풍부한 이야기를 들려주세요 (내용이 많을수록 노출에 유리합니다)"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-gray-900 ml-1">판매가 (₩)</label>
                        <input
                            type="text"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className="w-full p-3.5 border-2 border-gray-200 rounded-lg focus:border-black text-black font-semibold outline-none transition-all bg-white"
                            placeholder="0"
                        />
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-gray-900 ml-1">월 렌탈료 (₩)</label>
                        <input
                            type="text"
                            name="rental_price"
                            value={formData.rental_price}
                            onChange={handleInputChange}
                            className="w-full p-3.5 border-2 border-gray-200 rounded-lg focus:border-black text-black font-semibold outline-none transition-all bg-white"
                            placeholder="0"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={uploading || !file}
                    className="w-full py-5 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 active:scale-[0.98] transition-all disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-black/20"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            공간에 예술을 채우는 중...
                        </>
                    ) : status === 'success' ? (
                        <>
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                            등록이 완료되었습니다!
                        </>
                    ) : (
                        <>
                            <Upload className="w-5 h-5" />
                            작품 등록하기
                        </>
                    )}
                </button>

                {status === 'error' && (
                    <p className="text-red-500 text-sm text-center font-medium animate-bounce">
                        업로드 중 오류가 발생했습니다. 네트워크를 확인하고 다시 시도해 주세요.
                    </p>
                )}
            </form>
        </div>
    );
}
