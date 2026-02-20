'use client';

import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '@/app/actions/settings';
import { motion } from 'framer-motion';
import { Save, Building2, Phone, Landmark, Share2 } from 'lucide-react';
import Link from 'next/link';

interface ISettings {
    siteName: string;
    companyName: string;
    representative: string;
    businessNumber: string;
    mailOrderNumber: string;
    address: string;
    phone: string;
    fax: string;
    email: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    operationHours: string;
    snsLinks: {
        instagram: string;
        blog: string;
        youtube: string;
        kakaotalk: string;
    };
}

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<ISettings | null>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function loadSettings() {
            const res = await getSettings();
            if (res.success && res.settings) {
                setSettings(res.settings);
            }
            setLoading(false);
        }
        loadSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!settings) return;
        const { name, value } = e.target;
        if (name.startsWith('snsLinks.')) {
            const snsKey = name.split('.')[1];
            setSettings({
                ...settings,
                snsLinks: { ...settings.snsLinks, [snsKey]: value }
            } as ISettings);
        } else {
            setSettings({ ...settings, [name]: value } as ISettings);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        const res = await updateSettings(settings);
        if (res.success) {
            setMessage('설정이 성공적으로 저장되었습니다.');
            setSettings(res.settings);
        } else {
            setMessage('실패: ' + res.error);
        }
        setSaving(false);
    };

    if (loading || !settings) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <span className="text-xs font-black tracking-widest text-gray-300 uppercase animate-pulse">Loading Configuration...</span>
        </div>
    );

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white border-b border-gray-100 pt-32 pb-12 px-6 lg:px-12">
                <div className="max-w-4xl mx-auto flex justify-between items-end">
                    <div>
                        <Link href="/admin" className="text-[10px] font-black tracking-widest text-accent uppercase mb-4 block hover:opacity-60 transition-opacity">
                            ← Dashboard
                        </Link>
                        <h1 className="text-5xl font-serif font-light tracking-tighter text-black">Platform Settings</h1>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                    >
                        {saving ? <span className="animate-spin text-sm">○</span> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </header>

            <section className="px-6 lg:px-12 py-12">
                <div className="max-w-4xl mx-auto">
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 mb-8 text-xs font-bold tracking-tight rounded-xl ${message.startsWith('실패') ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}
                        >
                            {message}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* 1. Basic Platform Info */}
                        <div className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm space-y-8">
                            <div className="flex items-center gap-3 mb-4">
                                <Building2 className="w-5 h-5 text-accent" />
                                <h3 className="text-sm font-black tracking-widest uppercase">Business Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput label="Company Name (상호)" name="companyName" value={settings.companyName} onChange={handleChange} />
                                <FormInput label="CEO Name (대표자명)" name="representative" value={settings.representative} onChange={handleChange} />
                                <FormInput label="Business License (사업자번호)" name="businessNumber" value={settings.businessNumber} onChange={handleChange} />
                                <FormInput label="Mail Order Number (통신판매)" name="mailOrderNumber" value={settings.mailOrderNumber} onChange={handleChange} />
                            </div>
                            <FormInput label="Office Address (주소)" name="address" value={settings.address} onChange={handleChange} />
                        </div>

                        {/* 2. Contact & Customer Support */}
                        <div className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm space-y-8">
                            <div className="flex items-center gap-3 mb-4">
                                <Phone className="w-5 h-5 text-accent" />
                                <h3 className="text-sm font-black tracking-widest uppercase">Communication</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput label="Phone (고객센터)" name="phone" value={settings.phone} onChange={handleChange} />
                                <FormInput label="Email Address" name="email" value={settings.email} onChange={handleChange} />
                                <FormInput label="Fax Number" name="fax" value={settings.fax} onChange={handleChange} />
                            </div>
                            <div className="group relative">
                                <label
                                    htmlFor="operationHours"
                                    className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 block"
                                >
                                    Operation Hours (운영 시간)
                                </label>
                                <textarea
                                    id="operationHours"
                                    name="operationHours"
                                    value={settings.operationHours}
                                    onChange={handleChange}
                                    placeholder="운영 시간을 입력하세요."
                                    rows={3}
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* 3. Financial Info */}
                        <div className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm space-y-8">
                            <div className="flex items-center gap-3 mb-4">
                                <Landmark className="w-5 h-5 text-accent" />
                                <h3 className="text-sm font-black tracking-widest uppercase">Payment & Banking</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <FormInput label="Bank Name (은행명)" name="bankName" value={settings.bankName} onChange={handleChange} />
                                <FormInput label="Account Number (계좌번호)" name="accountNumber" value={settings.accountNumber} onChange={handleChange} />
                                <FormInput label="Account Holder (예금주)" name="accountHolder" value={settings.accountHolder} onChange={handleChange} />
                            </div>
                        </div>

                        {/* 4. Social Links */}
                        <div className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm space-y-8">
                            <div className="flex items-center gap-3 mb-4">
                                <Share2 className="w-5 h-5 text-accent" />
                                <h3 className="text-sm font-black tracking-widest uppercase">Social Media</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput label="Instagram URL" name="snsLinks.instagram" value={settings.snsLinks.instagram} onChange={handleChange} />
                                <FormInput label="Blog URL" name="snsLinks.blog" value={settings.snsLinks.blog} onChange={handleChange} />
                                <FormInput label="YouTube URL" name="snsLinks.youtube" value={settings.snsLinks.youtube} onChange={handleChange} />
                                <FormInput label="KakaoTalk URL" name="snsLinks.kakaotalk" value={settings.snsLinks.kakaotalk} onChange={handleChange} />
                            </div>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}

interface FormInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}

function FormInput({ label, name, value, onChange, type = "text" }: FormInputProps) {
    const id = `input-${name}`;
    return (
        <div className="group relative">
            <label
                htmlFor={id}
                className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 block transition-colors group-focus-within:text-black"
            >
                {label}
            </label>
            <input
                id={id}
                type={type}
                name={name}
                value={value || ''}
                onChange={onChange}
                placeholder={label}
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all"
            />
        </div>
    );
}
