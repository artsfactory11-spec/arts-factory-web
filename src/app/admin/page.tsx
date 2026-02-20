export const dynamic = 'force-dynamic';

import dbConnect from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import User from "@/models/User";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getAdminStats } from "../actions/admin";

export default async function AdminPage() {
    const conn = await dbConnect();

    if (!conn) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white p-10 rounded-[40px] shadow-xl border border-red-50 max-w-lg text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Connection Required</h1>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                        MongoDB Atlas 클러스터에 연결할 수 없습니다. <br />
                        현재 접속하신 IP가 **Atlas IP Whitelist**에 등록되어 있는지 확인해 주세요.
                    </p>
                    <a
                        href="https://cloud.mongodb.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-8 py-4 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
                    >
                        Go to Atlas Console
                    </a>
                </div>
            </main>
        );
    }

    // 데이터 병렬 조회
    const [artworkRes, userRes, statsRes] = await Promise.all([
        Artwork.find({}).sort({ createdAt: -1 }).populate('artist_id', 'name'),
        User.find({ role: { $in: ['partner', 'user'] } }).sort({ createdAt: -1 }),
        getAdminStats()
    ]);

    const formattedArtworks = JSON.parse(JSON.stringify(artworkRes));
    const initialUsers = JSON.parse(JSON.stringify(userRes));
    const stats = statsRes.success ? statsRes.stats : {
        totalArtworks: 0,
        pendingArtworks: 0,
        totalArtists: 0,
        monthlyRevenue: 0
    };

    return (
        <AdminDashboard
            initialArtworks={formattedArtworks}
            initialUsers={initialUsers}
            stats={stats}
        />
    );
}
