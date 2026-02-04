"use client";

import React, { useState, useRef } from 'react';
import {
    Save,
    X,
    Image as ImageIcon,
    Loader2,
    CheckCircle2,
    ChevronLeft,
    Upload
} from 'lucide-react';
import { uploadImageAsWebP } from '@/lib/upload';
import { createMagazine, updateMagazine } from '@/app/actions/magazine';

interface AdminMagazineEditorViewProps {
    initialData?: any;
    onBack: () => void;
    onSuccess: () => void;
}

export default function AdminMagazineEditorView({ initialData, onBack, onSuccess }: AdminMagazineEditorViewProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialData?.thumbnail_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        content: initialData?.content || '',
        category: initialData?.category || 'Story',
        thumbnail_url: initialData?.thumbnail_url || '',
        is_published: initialData?.is_published ?? true,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const { downloadURL } = await uploadImageAsWebP(file, 'magazine', {
                maxSizeMB: 0.8,
                maxWidthOrHeight: 1200
            });

            setThumbnailPreview(downloadURL);
            setFormData(prev => ({ ...prev, thumbnail_url: downloadURL }));
        } catch (error) {
            console.error("Image upload failed:", error);
            alert("이미지 업로드에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content || !formData.thumbnail_url) {
            alert("제목, 내용, 썸네일은 필수 항목입니다.");
            return;
        }

        setLoading(true);
        try {
            const res = initialData
                ? await updateMagazine(initialData._id, formData)
                : await createMagazine(formData);

            if (res.success) {
                setSuccess(true);
                setTimeout(onSuccess, 1500);
            } else {
                alert(res.error || "매거진 등록에 실패했습니다.");
            }
        } catch (error) {
            console.error("Failed to save magazine:", error);
            alert("서버 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-bold text-sm"
                >
                    <ChevronLeft className="w-5 h-5" /> 목록으로 돌아가기
                </button>
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl text-sm font-bold hover:bg-gray-800 active:scale-95 transition-all shadow-xl shadow-black/10 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                            success ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                                <Save className="w-4 h-4" />}
                        {success ? '저장 완료' : initialData ? '기사 수정하기' : '기사 등록하기'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Thumbnail Upload Zone */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-[21/9] bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-black/10 transition-all overflow-hidden relative group"
                >
                    {thumbnailPreview ? (
                        <>
                            <img src={thumbnailPreview} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <p className="text-white font-bold flex items-center gap-2">
                                    <Upload className="w-5 h-5" /> 이미지 교체하기
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                                <ImageIcon className="w-8 h-8 text-gray-300" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-gray-900">대표 썸네일 이미지 등록</p>
                                <p className="text-xs text-gray-400">권장 사이즈: 1200 x 515 (WebP 지원)</p>
                            </div>
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                    />
                </div>

                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2.5">
                            <label className="text-sm font-bold text-gray-900 ml-1">카테고리 설정</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-gray-900 font-medium transition-all outline-none shadow-sm appearance-none"
                            >
                                <option value="Story">Story</option>
                                <option value="Notice">Notice</option>
                                <option value="Interview">Interview</option>
                                <option value="Exhibition">Exhibition</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-end pt-8">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="is_published"
                                    checked={formData.is_published}
                                    onChange={handleInputChange}
                                    className="hidden"
                                />
                                <div className={`w-12 h-6 rounded-full transition-all relative ${formData.is_published ? 'bg-black' : 'bg-gray-200'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_published ? 'left-7' : 'left-1'}`} />
                                </div>
                                <span className={`text-sm font-bold ${formData.is_published ? 'text-black' : 'text-gray-400'}`}>
                                    {formData.is_published ? '기사 공개' : '비공개 저장'}
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-gray-900 ml-1">기사 제목</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="전달하고 싶은 소식의 제목을 입력하세요."
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-gray-900 font-bold text-xl transition-all outline-none shadow-sm"
                        />
                    </div>

                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-gray-900 ml-1">기사 본문 내용</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleInputChange}
                            rows={15}
                            placeholder="여기에 소식을 작성하세요. (HTML 지원)"
                            className="w-full px-6 py-6 bg-gray-50 border-2 border-transparent rounded-3xl focus:bg-white focus:border-black text-gray-900 font-medium transition-all outline-none shadow-sm resize-none leading-relaxed"
                        />
                        <p className="text-[10px] text-gray-400 ml-2 italic">* 추후 에디터(WYSIWYG) 라이브러리를 통해 고도화될 예정입니다.</p>
                    </div>
                </div>
            </form>
        </div>
    );
}
