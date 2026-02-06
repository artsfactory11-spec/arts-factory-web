"use client";

import React, { useState, useRef, useEffect } from 'react';
import { uploadImageAsWebP } from '@/lib/upload';
import {
    User,
    MapPin,
    Globe,
    Mail,
    Phone,
    Camera,
    Save,
    Plus,
    Loader2,
    CheckCircle2,
    FileText
} from 'lucide-react';
import { updateArtistProfile, getArtistProfileById } from '@/app/actions/user';

const ProfileView = ({ artistId }: { artistId: string }) => {
    const [loading, setLoading] = useState(true);

    const [success, setSuccess] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string>("");
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState({
        name: '',
        specialty: '',
        bio: '',
        email: '',
        phone: '',
        instagram: '',
        youtube: '',
        blog: '',
        tiktok: '',
        activity: {
            exhibitions: '',
            region: '',
            material: ''
        }
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const res = await getArtistProfileById(artistId);
            if (res.success && res.artist) {
                const a = res.artist;
                setProfile({
                    name: a.name || '',
                    specialty: a.artist_specialty || '',
                    bio: a.artist_bio || '',
                    email: a.email || '',
                    phone: a.phone || '',
                    instagram: a.instagram_url || '',
                    youtube: a.youtube_url || '',
                    blog: a.blog_url || '',
                    tiktok: a.tiktok_url || '',
                    activity: {
                        exhibitions: a.activity_exhibitions || '',
                        region: a.activity_region || '',
                        material: a.activity_material || ''
                    }
                });
                setAvatarPreview(a.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix");
                setSignaturePreview(a.signature_url || null);
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('activity.')) {
            const field = name.split('.')[1];
            setProfile(prev => ({
                ...prev,
                activity: { ...prev.activity, [field]: value }
            }));
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'signature') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const { downloadURL } = await uploadImageAsWebP(file, 'profiles', {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 800
            });

            if (type === 'avatar') setAvatarPreview(downloadURL);
            else setSignaturePreview(downloadURL);

            // 즉시 DB 업데이트
            await updateArtistProfile(artistId, {
                [type === 'avatar' ? 'avatar_url' : 'signature_url']: downloadURL
            });
        } catch (error) {
            console.error("Image upload failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await updateArtistProfile(artistId, {
                name: profile.name,
                artist_specialty: profile.specialty,
                artist_bio: profile.bio,
                activity_region: profile.activity.region,
                activity_material: profile.activity.material,
                activity_exhibitions: profile.activity.exhibitions,
                instagram_url: profile.instagram,
                youtube_url: profile.youtube,
                blog_url: profile.blog,
                tiktok_url: profile.tiktok
            });

            if (res.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Failed to save profile:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar and Quick Stats */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                            <div className="w-32 h-32 rounded-full bg-gray-50 border-4 border-white overflow-hidden relative shadow-inner">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Artist Avatar"
                                        className="w-full h-full object-cover animate-in fade-in duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 text-gray-200 animate-spin" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <button className="absolute bottom-1 right-1 p-2 bg-black text-white rounded-full border-2 border-white shadow-lg">
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

                        <h3 className="text-xl font-bold text-gray-900 mt-6">{profile.name} 작가</h3>
                        <p className="text-gray-500 text-sm mt-1">{profile.specialty}</p>

                        {/* Signature Upload Area */}
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
                        <h4 className="font-bold text-gray-900 mb-4 px-2 tracking-tight">작가 활동 요약</h4>
                        <div className="space-y-4">
                            <div className="space-y-1.5 px-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">누적 전시 기록</label>
                                <input
                                    type="text"
                                    name="activity.exhibitions"
                                    value={profile.activity.exhibitions}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-1 focus:ring-black outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5 px-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">활동 지역</label>
                                <input
                                    type="text"
                                    name="activity.region"
                                    value={profile.activity.region}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-1 focus:ring-black outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5 px-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">주요 매체/재료</label>
                                <input
                                    type="text"
                                    name="activity.material"
                                    value={profile.activity.material}
                                    onChange={handleInputChange}
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
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">프로필 상세 정보</h3>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 active:scale-95 transition-all shadow-xl shadow-gray-200 disabled:bg-gray-300"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                    success ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                                        <Save className="w-4 h-4" />}
                                {success ? '저장됨' : '변경사항 저장'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-gray-900 ml-1"> 활동명 (작가명)</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-gray-900 font-medium transition-all outline-none shadow-sm"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-gray-900 ml-1">전문 분야</label>
                                <input
                                    type="text"
                                    name="specialty"
                                    value={profile.specialty}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-gray-900 font-medium transition-all outline-none shadow-sm"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2.5">
                                <label className="text-sm font-bold text-gray-900 ml-1">작가 소개 (Bio)</label>
                                <textarea
                                    name="bio"
                                    rows={4}
                                    value={profile.bio}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-gray-900 font-medium transition-all outline-none resize-none shadow-sm leading-relaxed"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-gray-900 ml-1">이메일 주소</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-gray-900 font-medium transition-all outline-none shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-gray-900 ml-1">연락처</label>
                                <div className="relative">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black text-gray-900 font-medium transition-all outline-none shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default ProfileView;
