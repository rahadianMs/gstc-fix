"use client";

import { useState, useEffect } from 'react';
import { ShieldCheckIcon, QuestionMarkCircleIcon, BellIcon } from './Icons';

// Komponen Utama Halaman Beranda
export default function BerandaPage({ user, supabase, setActiveDashboardPage, dataVersion }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            setLoading(true);
            const { data: profileData } = await supabase
                .from('profiles')
                .select('destination_name')
                .eq('id', user.id)
                .single();
            if (profileData) setProfile(profileData);
            setLoading(false);
        };
        fetchProfile();
    }, [user, supabase, dataVersion]);

    const staticBgImage = "https://cdn.prod.website-files.com/66fab24d6dde4d79b3b50865/678258d8a57c03a93b723b53_NUSA%20DUA.webp";

    return (
        <div className="space-y-8">
            <div 
                className="relative p-8 rounded-2xl text-white bg-cover bg-center min-h-[200px] flex flex-col justify-end"
                style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1)), url('${staticBgImage}')` }}
            >
                 <button 
                    onClick={() => setActiveDashboardPage('what-to-do')}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
                >
                    <BellIcon />
                </button>
                <div className="relative z-0">
                    <h1 className="text-4xl font-extrabold drop-shadow-md">Selamat Datang, {profile?.destination_name || 'Rekan'}!</h1>
                    <p className="mt-1 text-lg opacity-90 drop-shadow">Ini adalah pusat kendali Anda untuk menuju pariwisata berkelanjutan.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-brand-surface p-6 rounded-xl shadow-sm border">
                        <h3 className="font-bold text-lg text-brand-primary">Progres Kepatuhan Standar</h3>
                        <div className="mt-4 p-8 bg-brand-background rounded-lg text-center text-slate-500">
                           <p>Visualisasi progres poin dan status per pilar akan ditampilkan di sini.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-brand-surface p-6 rounded-xl border shadow-sm flex flex-col justify-between">
                     <div>
                        <h3 className="text-xl font-bold text-slate-800">Mulai Penuhi Standar</h3>
                        <p className="text-slate-500 mt-2">Pilih salah satu pilar untuk mulai mengunggah bukti kepatuhan Anda.</p>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={() => setActiveDashboardPage('standard-compliance')}
                            className="w-full py-3 text-base font-semibold text-white bg-brand-primary rounded-lg transition-colors hover:bg-brand-secondary"
                        >
                            <ShieldCheckIcon />
                            Lihat Standar Kepatuhan
                        </button>
                        <button onClick={() => setActiveDashboardPage('panduan')} className="w-full mt-3 text-sm font-medium text-slate-500 hover:text-brand-primary">
                            Baca Panduan Penggunaan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}