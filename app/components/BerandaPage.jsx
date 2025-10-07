"use client";

import { useState, useEffect } from 'react';
import { ShieldCheckIcon, QuestionMarkCircleIcon, BellIcon } from './Icons';
import ComplianceProgress from './ComplianceProgress'; // <-- Impor komponen baru

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
                    {loading ? (
                        <div className="h-10 bg-white/20 rounded-md animate-pulse w-3/4 mb-2"></div>
                    ) : (
                        <h1 className="text-4xl font-extrabold drop-shadow-md">Selamat Datang, {profile?.destination_name || 'Rekan'}!</h1>
                    )}
                    <p className="mt-1 text-lg opacity-90 drop-shadow">Ini adalah pusat kendali Anda untuk menuju pariwisata berkelanjutan.</p>
                </div>
            </div>
            
            {/* --- PERUBAHAN UTAMA DI SINI --- */}
            <ComplianceProgress supabase={supabase} user={user} />

            {/* Bagian Bantuan/Aksi Cepat (bisa dipertahankan jika perlu) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3 bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                     <div>
                        <h3 className="text-xl font-bold text-slate-800">Mulai Penuhi Standar</h3>
                        <p className="text-slate-500 mt-1">Pilih pilar untuk mulai mengunggah bukti kepatuhan Anda.</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-4">
                        <button onClick={() => setActiveDashboardPage('panduan')} className="text-sm font-medium text-slate-500 hover:text-emerald-700">
                            Baca Panduan
                        </button>
                        <button
                            onClick={() => setActiveDashboardPage('standard-compliance')}
                            className="w-full md:w-auto px-6 py-3 text-base font-semibold text-white rounded-lg transition-colors flex items-center gap-2"
                            style={{backgroundColor: '#3f545f'}}
                        >
                            <ShieldCheckIcon />
                            Lihat Standar Kepatuhan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}