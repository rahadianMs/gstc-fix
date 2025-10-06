"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DocumentChartBarIcon, QuestionMarkCircleIcon, BellIcon, BoltIcon, TransportIcon, TrashCanIcon, ShieldCheckIcon } from './Icons';

// Komponen Kartu Rincian kecil (Tidak berubah)
const DetailCard = ({ icon, value, label, colorClass }) => (
    <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass.bg}`}>
            <div className={colorClass.text}>{icon}</div>
        </div>
        <div>
            <p className="text-xl font-bold text-slate-800">{value.toFixed(2)}</p>
            <p className="text-sm text-slate-500 -mt-1">{label}</p>
        </div>
    </div>
);


// Komponen Utama Halaman Beranda
export default function BerandaPage({ user, supabase, setActiveDashboardPage, dataVersion }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileAndSummary = async () => {
            if (!user) return;
            setLoading(true);

            // Ambil nama destinasi dari tabel profiles
            const { data: profileData } = await supabase
                .from('profiles')
                .select('destination_name')
                .eq('id', user.id)
                .single();
            
            if (profileData) {
                setProfile(profileData);
            }
            
            // Di sini kita bisa menambahkan kembali logika untuk summary jika dibutuhkan nanti
            setLoading(false);
        };
    
        fetchProfileAndSummary();
    }, [user, supabase, dataVersion]);

    const staticBgImage = "https://cdn.prod.website-files.com/66fab24d6dde4d79b3b50865/678258d8a57c03a93b723b53_NUSA%20DUA.webp";

    return (
        <div className="space-y-8">
            {/* Header Sambutan */}
            <div 
                className="relative p-8 rounded-2xl text-white bg-cover bg-center min-h-[180px] flex flex-col justify-between"
                style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.1)), url('${staticBgImage}')` }}
            >
                 <button 
                    onClick={() => setActiveDashboardPage('what-to-do')}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
                >
                    <BellIcon />
                    {/* Logika notifikasi bisa ditambahkan di sini */}
                </button>
                <div className="relative z-0">
                    <h1 className="text-4xl font-extrabold drop-shadow-md">Selamat Datang, {profile?.destination_name || 'Rekan'}!</h1>
                    <p className="mt-1 text-lg opacity-90 drop-shadow">Ini adalah pusat kendali Anda untuk menuju pariwisata berkelanjutan.</p>
                </div>
            </div>

            {/* Konten Utama */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* KARTU VISUALISASI PROGRES (Placeholder) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="font-bold text-lg">Progres Kepatuhan Standar</h3>
                        <div className="mt-4 p-8 bg-slate-100 rounded-lg text-center text-slate-500">
                           <p>Visualisasi progres poin dan status per pilar akan ditampilkan di sini.</p>
                        </div>
                    </div>
                </div>

                {/* Kolom Aksi */}
                <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-between">
                     <div>
                        <h3 className="text-xl font-bold text-slate-800">Mulai Penuhi Standar</h3>
                        <p className="text-slate-500 mt-2">Pilih salah satu pilar untuk mulai mengunggah bukti kepatuhan Anda.</p>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={() => setActiveDashboardPage('standard-compliance')}
                            className="w-full py-3 text-base font-semibold text-white bg-[#22543d] rounded-lg transition-colors hover:bg-[#1c4532] flex items-center justify-center gap-2"
                        >
                            <ShieldCheckIcon />
                            Lihat Standar Kepatuhan
                        </button>
                        <button onClick={() => setActiveDashboardPage('panduan')} className="w-full mt-3 text-sm font-medium text-slate-500 hover:text-[#22543d] flex items-center justify-center gap-2 transition-colors">
                            <QuestionMarkCircleIcon />
                            Baca Panduan Penggunaan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}