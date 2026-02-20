import { getWishlist } from "@/app/actions/wishlist";
import WishlistContainer from "@/components/gallery/WishlistContainer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Wishlist | Arts Factory",
    description: "Arts Factory에서 찜한 작품들을 확인하고 나만한 컬렉션을 구성해 보세요.",
};

export default async function WishlistPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/login?callbackUrl=/gallery/wishlist");
    }

    const res = await getWishlist();
    const wishlist = res.success ? res.wishlist : [];

    return (
        <main className="min-h-screen bg-white pt-32 pb-32 px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
                <header className="mb-20">
                    <span className="text-accent font-black tracking-[0.4em] text-[10px] uppercase block mb-4">Your Selection</span>
                    <h1 className="text-6xl font-serif italic text-black">Wishlist</h1>
                    <div className="mt-8 h-px w-full bg-gray-100" />
                </header>

                <WishlistContainer initialWishlist={wishlist} />
            </div>
        </main>
    );
}
