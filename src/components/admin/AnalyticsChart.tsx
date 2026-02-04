'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const dummyData = [
    { name: 'Mon', inquiries: 4, artworks: 2 },
    { name: 'Tue', inquiries: 7, artworks: 5 },
    { name: 'Wed', inquiries: 5, artworks: 8 },
    { name: 'Thu', inquiries: 9, artworks: 3 },
    { name: 'Fri', inquiries: 12, artworks: 6 },
    { name: 'Sat', inquiries: 8, artworks: 10 },
    { name: 'Sun', inquiries: 10, artworks: 4 },
];

export default function AnalyticsChart() {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {/* Inquiry Trend Chart */}
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-sm font-black uppercase tracking-widest text-black">Inquiry Trends</h3>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Weekly Inquiries Received</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-black" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Last 7 Days</span>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dummyData}>
                            <defs>
                                <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#000" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#ccc' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#ccc' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="inquiries" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorInquiries)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Artwork Registration Chart */}
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-sm font-black uppercase tracking-widest text-black">Activity Overview</h3>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Artworks vs Inquiries</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-accent" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Artworks</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-black" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Inquiries</span>
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dummyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#ccc' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#ccc' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Line type="monotone" dataKey="artworks" stroke="#FF5A5F" strokeWidth={4} dot={{ r: 4, fill: '#FF5A5F', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="inquiries" stroke="#000" strokeWidth={4} dot={{ r: 4, fill: '#000', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
