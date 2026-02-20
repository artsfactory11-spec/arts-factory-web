'use client';

import React, { useState } from 'react';
import { ChevronLeft, Upload, X, Save, Calendar, AlertCircle } from 'lucide-react';
import { upsertNotice } from '@/app/actions/notice';
import { uploadImageAsWebP } from '@/lib/upload';
import Image from 'next/image';
import { IBaseNotice } from '@/models/Notice';

interface AdminNoticeEditorViewProps {
    initialData?: Partial<IBaseNotice>;
    onBack: () => void;
    onSuccess: () => void;
}

export default function AdminNoticeEditorView({ initialData, onBack, onSuccess }: AdminNoticeEditorViewProps) {
    const [formData, setFormData] = useState({
        _id: initialData?._id || null,
        title: initialData?.title || '',
        content: initialData?.content || '',
        startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        isActive: initialData?.isActive ?? true,
        priority: initialData?.priority || 0,
        images: initialData?.images || []
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (formData.images.length + files.length > 10) {
            alert('최대 10장까지만 업로드할 수 있습니다.');
            return;
        }

        setUploading(true);
        try {
            const uploadPromises = Array.from(files).map(file => uploadImageAsWebP(file, 'notices'));
            const results = await Promise.all(uploadPromises);

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...results.map(r => ({ url: r.downloadURL, path: r.storagePath }))]
            }));
        } catch {
            alert('이미지 업로드에 실패했습니다.');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_: unknown, i: number) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content || !formData.startDate || !formData.endDate) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }

        setLoading(true);
        const res = await upsertNotice({
            _id: formData._id as string || undefined,
            title: formData.title,
            content: formData.content,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
            isActive: formData.isActive,
            priority: formData.priority,
            images: formData.images,
        });
        if (res.success) {
            onSuccess();
        } else {
            alert(res.error || '저장에 실패했습니다.');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors group"
                >
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Back to List</span>
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading || uploading}
                    className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-accent transition-all shadow-xl shadow-black/10 disabled:bg-gray-200"
                >
                    {loading ? 'Saving...' : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Notice
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Form Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Notice Title</label>
                            <input
                                type="text"
                                placeholder="Enter notice title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-base font-bold focus:ring-2 focus:ring-black/5 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Content Detail</label>
                            <textarea
                                placeholder="Enter notice description..."
                                rows={10}
                                value={formData.content}
                                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-base focus:ring-2 focus:ring-black/5 transition-all outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* Image Multi-upload */}
                    <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-8">
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-black">Notice Images ({formData.images.length}/10)</h3>
                                <label className="cursor-pointer px-4 py-2 bg-gray-50 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black hover:text-white transition-all">
                                    <Upload className="w-3 h-3 inline-block mr-2" />
                                    Add Images
                                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                            </div>

                            {formData.images.length > 0 ? (
                                <div className="grid grid-cols-5 gap-4">
                                    {formData.images.map((img: IBaseNotice['images'][0], idx: number) => (
                                        <div key={idx} className="aspect-square rounded-2xl bg-gray-50 relative group overflow-hidden border border-gray-100">
                                            <Image src={img.url} alt={`Preview ${idx}`} fill className="object-cover" />
                                            <button
                                                onClick={() => removeImage(idx)}
                                                title="이미지 제거"
                                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            {idx === 0 && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] font-black uppercase py-1 text-center">Thumbnail</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="aspect-[4/1] bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300">
                                    <Upload className="w-8 h-8 mb-2 opacity-20" />
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-50">Upload Pamphlets or Photos</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-gray-900 rounded-[40px] p-8 text-white space-y-8 shadow-2xl">
                        <div className="flex items-center gap-3 text-accent mb-2">
                            <Calendar className="w-5 h-5" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-white">Exposure Settings</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Start Date</label>
                                <input
                                    type="date"
                                    title="시작 날짜"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold focus:ring-1 focus:ring-accent transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">End Date</label>
                                <input
                                    type="date"
                                    title="종료 날짜"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold focus:ring-1 focus:ring-accent transition-all outline-none"
                                />
                            </div>
                            <div className="pt-4 border-t border-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Exposure Priority</span>
                                    <input
                                        type="number"
                                        title="노출 우선순위"
                                        value={formData.priority}
                                        onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                                        className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-right text-xs font-black outline-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Notice Status</span>
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                        title={formData.isActive ? '비활성화하기' : '활성화하기'}
                                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${formData.isActive ? 'bg-accent' : 'bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${formData.isActive ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50/50 rounded-[30px] p-6 border border-blue-100 flex gap-4">
                        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                        <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                            공지사항은 설정된 기간 동안만 홈페이지 모달 형식으로 자동 노출됩니다. 이미지가 없는 경우 텍스트 요약본이 노출됩니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
