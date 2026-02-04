import PartnerDashboard from "@/components/partner/PartnerDashboard";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getPartnerStats } from "../actions/artwork";

export default async function PartnerPage() {
    const session = await getServerSession();

    if (!session || (session.user as any).role !== 'partner') {
        redirect('/partner/login');
    }

    const statsRes = await getPartnerStats((session.user as any).id);
    const stats = (statsRes.success && statsRes.stats)
        ? statsRes.stats
        : { total: 0, approved: 0, pending: 0, rejected: 0 };


    return <PartnerDashboard partnerName={session.user?.name || 'Artist'} partnerId={(session.user as any).id} stats={stats} />;
}


