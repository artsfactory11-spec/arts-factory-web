"use client";

import React, { useState, useRef } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import imageCompression from 'browser-image-compression';
import {
    User,
    MapPin,
    Globe,
    Instagram,
    Youtube,
    Chrome,
    Mail,
    Phone,
    Camera,
    Save,
    Plus,
    Loader2,
    CheckCircle2,
    FileText,
    Video,
    AlertCircle
} from 'lucide-react';
import { createArtist } from '@/app/actions/admin';

interface AdminArtistRegisterViewProps {
    onSuccess?: () => void;
}

const AdminArtistRegisterView = ({ onSuccess }: AdminArtistRegisterViewProps) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>("https://api.dicebear.com/7.x/avataaars/svg?seed=new-artist");
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        artist_specialty: '',
        artist_bio: '',
        activity_region: '',
        activity_material: '',
        activity_exhibitions: '',
        instagram_url: '',
        youtube_url: '',
        blog_url: '',
        tiktok_url: '',
        avatar_url: '',
        signature_url: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'signature') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 800,
                useWebWorker: true,
                fileType: 'image/webp' as const,
            };
            const compressedFile = await imageCompression(file, options);

            const objectUrl = URL.createObjectURL(compressedFile);
            if (type === 'avatar') setAvatarPreview(objectUrl);
            else setSignaturePreview(objectUrl);

            const storagePath = `profiles/${Date.now()}_${type}.webp`;
            const storageRef = ref(storage, storagePath);
            await uploadBytesResumable(storageRef, compressedFile);
            const downloadURL = await getDownloadURL(storageRef);

            setFormData(prev => ({
                ...prev,
                [type === 'avatar' ? 'avatar_url' : 'signature_url']: downloadURL
            }));
        } catch (error) {
            console.error("Image upload failed:", error);
            setError("이미지 업로드에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.name) {
            setError("이메일과 이름은 필수 항목입니다.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await createArtist(formData);

            if (res.success) {
                setSuccess(true);
                if (onSuccess) {
                    setTimeout(() => onSuccess(), 2000);
                }
            } else {
                setError(res.error || "작가 등록에 실패했습니다.");
            }
        } catch (error) {
            console.error("Failed to register artist:", error);
            setError("서버 통신 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar and Signature */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                            <div className="w-32 h-32 rounded-full bg-gray-50 border-4 border-white overflow-hidden relative shadow-inner">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Artist Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <User className="w-8 h-8 text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <button type="button" className="absolute bottom-1 right-1 p-2 bg-black text-white rounded-full border-2 border-white shadow-lg">
                                <Plus className="w-4 h-4" />
                            </button>
                            <input
                                type="file"
                                ref={avatarInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'avatar')}
                            />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mt-6">{formData.name || '신규 작가'}</h3>
                        <p className="text-gray-500 text-sm mt-1">{formData.artist_specialty || '전문 분야 미입력'}</p>

                        <div className="mt-8 w-full">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-3">작가 시그니처 / 서명</p>
                            <div
                                className="w-full aspect-[3/1] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden group relative"
                                onClick={() => signatureInputRef.current?.click()}
                            >
                                {signaturePreview ? (
                                    <img src={signaturePreview} alt="Signature" className="h-full object-contain p-4" />
                                ) : (
                                    <>
                                        <FileText className="w-5 h-5 text-gray-300 group-hover:text-gray-400 mb-1" />
                                        <span className="text-[11px] text-gray-400">이미지 등록 (WebP)</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={signatureInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'signature')}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-4 px-2 tracking-tight">작가 활동 정보</h4>
                        <div className="space-y-4">
                            <div className="space-y-1.5 px-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">누적 전시 기록</label>
                                <input
                                    type="text"
                                    name="activity_exhibitions"
                                    value={formData.activity_exhibitions}
                                    onChange={handleInputChange}
                                    placeholder="예: 2023 개인전 <빛의 파편>"
                                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-1 focus:ring-black outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5 px-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">활동 지역</label>
                                <input
                                    type="text"
                                    name="activity_region"
                                    value={formData.activity_region}
                                    onChange={handleInputChange}
                                    placeholder="예: 서울, 경기"
                                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-1 focus:ring-black outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5 px-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">주요 매체/재료</label>
                                <input
                                    type="text"
                                    name="activity_material"
                                    value={formData.activity_material}
                                    onChange={handleInputChange}
                                    placeholder="예: Oil on Canvas"
                                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-1 focus:ring-black outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">작가 상세 정보</h3>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 active:scale-95 transition-all shadow-xl shadow-gray-200 disabled:bg-gray-300"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                    success ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                                        <Save className="w-4 h-4" />}
                                {success ? '등록 완료' : '신규 작가 등록하기'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2.5 px-1">
                                <label className="text-sm font-bold text-gray-900 ml-1"> 활동명 (작가명) <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-gray-900 font-medium transition-all outline-none shadow-sm"
                                />
                            </div>
                            <div className="space-y-2.5 px-1">
                                <label className="text-sm font-bold text-gray-900 ml-1">전문 분야</label>
                                <input
                                    type="text"
                                    name="artist_specialty"
                                    value={formData.artist_specialty}
                                    onChange={handleInputChange}
                                    placeholder="예: 현대 미술, 서양화"
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-gray-900 font-medium transition-all outline-none shadow-sm"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2.5 px-1">
                                <label className="text-sm font-bold text-gray-900 ml-1">작가 소개 (Bio)</label>
                                <textarea
                                    name="artist_bio"
                                    rows={4}
                                    value={formData.artist_bio}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-gray-900 font-medium transition-all outline-none resize-none shadow-sm leading-relaxed"
                                />
                            </div>

                            <div className="space-y-2.5 px-1">
                                <label className="text-sm font-bold text-gray-900 ml-1">이메일 주소 (ID) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-gray-900 font-medium transition-all outline-none shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5 px-1">
                                <label className="text-sm font-bold text-gray-900 ml-1">연락처</label>
                                <div className="relative">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={(formData as any).phone || ''}
                                        onChange={handleInputChange}
                                        placeholder="010-0000-0000"
                                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-gray-900 font-medium transition-all outline-none shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-8 tracking-tight">온라인 링크 설정</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 group-focus-within:bg-pink-500 group-focus-within:text-white transition-all">
                                    <Instagram className="w-6 h-6" />
                                </div>
                                <input
                                    type="text"
                                    name="instagram_url"
                                    placeholder="인스타그램 URL"
                                    value={formData.instagram_url}
                                    onChange={handleInputChange}
                                    className="flex-1 px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 font-medium focus:bg-white focus:border-black outline-none transition-all shadow-sm"
                                />
                            </div>

                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 group-focus-within:bg-red-500 group-focus-within:text-white transition-all">
                                    <Youtube className="w-6 h-6" />
                                </div>
                                <input
                                    type="text"
                                    name="youtube_url"
                                    placeholder="유튜브 URL"
                                    value={formData.youtube_url}
                                    onChange={handleInputChange}
                                    className="flex-1 px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 font-medium focus:bg-white focus:border-black outline-none transition-all shadow-sm"
                                />
                            </div>

                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500 group-focus-within:bg-green-500 group-focus-within:text-white transition-all">
                                    <Chrome className="w-6 h-6" />
                                </div>
                                <input
                                    type="text"
                                    name="blog_url"
                                    placeholder="블로그 또는 웹사이트 URL"
                                    value={formData.blog_url}
                                    onChange={handleInputChange}
                                    className="flex-1 px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 font-medium focus:bg-white focus:border-black outline-none transition-all shadow-sm"
                                />
                            </div>

                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center text-black group-focus-within:bg-black group-focus-within:text-white transition-all">
                                    <Video className="w-6 h-6" />
                                </div>
                                <input
                                    type="text"
                                    name="tiktok_url"
                                    placeholder="틱톡(TikTok) URL"
                                    value={formData.tiktok_url}
                                    onChange={handleInputChange}
                                    className="flex-1 px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 font-medium focus:bg-white focus:border-black outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default AdminArtistRegisterView;
