'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Auto-redirect if already logged in as admin
        if (session?.user && (session.user as any).role === 'admin') {
            router.replace('/admin');
        }
    }, [session, router]);

    useEffect(() => {
        const urlError = searchParams.get('error');
        if (urlError === 'AccessDenied') {
            setError('Access Denied: Admin privileges required.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                // Ignore "AccessDenied" if we actually have a session (race condition)
                setError(res.error);
            } else {
                router.push('/admin');
                router.refresh();
            }
        } catch (err) {
            setError('System Error: Authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl"
            >
                <div className="text-center mb-12">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-6 text-white text-xl font-black">
                        AF
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter text-white mb-2 uppercase">Admin Console</h1>
                    <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">
                        Restricted Access Only
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="p-4 bg-red-500/10 text-red-500 text-xs font-bold rounded-lg border border-red-500/20 text-center uppercase tracking-wider">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="group relative">
                            <label className="text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-2 block group-focus-within:text-white transition-colors">
                                Administrator ID
                            </label>
                            <input
                                required
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-b border-zinc-700 py-3 text-lg font-mono text-white focus:outline-none focus:border-white transition-all placeholder:text-zinc-800"
                                placeholder="root.access"
                            />
                        </div>

                        <div className="group relative">
                            <label className="text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-2 block group-focus-within:text-white transition-colors">
                                Secure Key
                            </label>
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent border-b border-zinc-700 py-3 text-lg font-mono text-white focus:outline-none focus:border-white transition-all placeholder:text-zinc-800"
                                placeholder="••••••••••••"
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-5 bg-white text-black text-[10px] font-black tracking-[0.2em] uppercase rounded-full hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verifying Credentials...' : 'Access Dashboard'}
                        </button>
                    </div>

                    <div className="text-center pt-8 border-t border-zinc-800/50">
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                            Authorized Personnel Only
                        </p>
                    </div>
                </form>
            </motion.div>
        </main>
    );
}
