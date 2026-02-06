import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import Artwork from "@/models/Artwork";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

async function getMyData() {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return null;

    const user = await User.findOne({ email: session.user.email })
        .populate({
            path: 'wishlist',
            populate: { path: 'artist_id', select: 'name' }
        });

    if (!user) return null;

    const orders = await Order.find({ user_id: user._id })
        .populate('items.artwork_id')
        .sort({ createdAt: -1 });

    const subscriptions = await Subscription.find({ user_id: user._id })
        .populate('artwork_id')
        .sort({ createdAt: -1 });

    return { user, orders, subscriptions };
}

export default async function MyPage() {
    const data = await getMyData();

    if (!data) {
        redirect('/login'); // Redirect to general login page
    }

    const { user, orders, subscriptions } = data;

    return (
        <main className="min-h-screen bg-white pt-32 pb-20 px-6 lg:px-12">
            <div className="max-w-7xl mx-auto space-y-20">
                {/* Header */}
                <div className="border-b border-black pb-8">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">My Account</span>
                    <h1 className="text-5xl font-serif italic text-black">{user.name}님, 안녕하세요.</h1>
                    <p className="mt-4 text-gray-500">{user.email}</p>
                </div>

                {/* Subscriptions */}
                <section>
                    <h2 className="text-2xl font-serif italic mb-8 flex items-center gap-4">
                        나의 구독 (렌탈)
                        <span className="text-sm font-sans font-bold bg-accent text-white px-3 py-1 rounded-full not-italic">
                            {subscriptions.length}
                        </span>
                    </h2>
                    {subscriptions.length === 0 ? (
                        <div className="bg-gray-50 rounded-2xl p-12 text-center text-gray-400">
                            현재 이용 중인 렌탈 서비스가 없습니다.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {subscriptions.map((sub: any) => (
                                <div key={sub._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                                            }`}>
                                            {sub.status.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-400">다음 결제일: {new Date(sub.next_payment_due).toLocaleDateString()}</span>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-serif text-xl italic mb-2">{sub.artwork_id?.title}</h3>
                                        <p className="text-sm text-gray-500 mb-6 font-medium">월 {sub.monthly_fee.toLocaleString()}원</p>
                                        <div className="space-y-2 text-xs text-gray-400">
                                            <div className="flex justify-between">
                                                <span>시작일</span>
                                                <span>{new Date(sub.start_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>종료일</span>
                                                <span>{new Date(sub.end_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Orders */}
                <section>
                    <h2 className="text-2xl font-serif italic mb-8">주문 내역</h2>
                    <div className="space-y-6">
                        {orders.length === 0 ? (
                            <div className="bg-gray-50 rounded-2xl p-12 text-center text-gray-400">
                                주문 내역이 없습니다.
                            </div>
                        ) : (
                            orders.map((order: any) => (
                                <div key={order._id} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-mono text-gray-400">#{order._id.toString().substring(0, 8)}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-2 py-1 rounded">
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="font-bold text-lg">
                                            {order.items[0]?.artwork_id?.title || 'Unknown Artwork'}
                                            {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
                                        </p>
                                        <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-12">
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Total</span>
                                            <span className="font-serif text-xl">{order.total_amount.toLocaleString()} KRW</span>
                                        </div>
                                        {order.status === 'pending_deposit' && (
                                            <div className="bg-blue-50 px-4 py-2 rounded-lg text-xs text-blue-700 font-bold">
                                                입금 확인 중
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Wishlist */}
                <section>
                    <h2 className="text-2xl font-serif italic mb-8">위시리스트</h2>
                    {user.wishlist.length === 0 ? (
                        <div className="bg-gray-50 rounded-2xl p-12 text-center text-gray-400">
                            위시리스트가 비어있습니다.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {user.wishlist.map((art: any) => (
                                <Link href={`/artwork/${art._id}`} key={art._id} className="group block">
                                    <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 mb-4">
                                        <img
                                            src={art.firebase_image_url}
                                            alt={art.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <h3 className="font-serif italic text-lg">{art.title}</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{art.artist_id?.name}</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Partner Application */}
                {user.role === 'user' && user.status === 'none' && (
                    <section className="bg-gray-900 rounded-[40px] p-12 lg:p-16 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                            <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[80%] rounded-full bg-accent blur-[120px]" />
                        </div>
                        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                            <div>
                                <span className="text-accent font-black tracking-[0.4em] text-xs uppercase block mb-4">For Artists</span>
                                <h2 className="text-4xl font-serif italic mb-4">작가로 활동하고 싶으신가요?</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    아트팩토리의 파트너가 되어 당신의 작품을 세상에 알리세요.<br />
                                    전시, 판매, 렌탈 등 다양한 기회가 기다리고 있습니다.
                                </p>
                            </div>
                            <Link
                                href="/partner/join"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-sm tracking-widest uppercase hover:bg-accent hover:text-white transition-all duration-300"
                            >
                                작가(파트너) 신청하기
                            </Link>
                        </div>
                    </section>
                )}

                {user.status === 'pending' && (
                    <section className="bg-gray-50 rounded-[40px] p-12 text-center border border-gray-100">
                        <h2 className="text-2xl font-serif italic mb-4 text-gray-400">심사 진행 중</h2>
                        <p className="text-gray-500">
                            현재 파트너 신청이 접수되어 심사가 진행 중입니다.<br />
                            결과는 이메일로 개별 통보됩니다.
                        </p>
                    </section>
                )}
            </div>
        </main>
    );
}
