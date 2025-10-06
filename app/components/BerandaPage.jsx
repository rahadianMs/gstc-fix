"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DocumentChartBarIcon, QuestionMarkCircleIcon, BellIcon, BoltIcon, TransportIcon, TrashCanIcon } from './Icons';

// Komponen Kartu Rincian kecil
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
    const businessName = user?.user_metadata?.business_name || 'Rekan';
    const businessType = user?.user_metadata?.business_type;

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummaryData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('carbon_entries')
                    .select('electricity_co2e, transport_co2e, waste_co2e')
                    .eq('user_id', user.id);

                if (error) throw error;

                if (data) {
                    const totals = data.reduce((acc, entry) => {
                        acc.electricity += entry.electricity_co2e || 0;
                        acc.transport += entry.transport_co2e || 0;
                        acc.waste += entry.waste_co2e || 0;
                        return acc;
                    }, { electricity: 0, transport: 0, waste: 0 });
                    
                    setSummary({
                        total_electricity: totals.electricity,
                        total_transport: totals.transport,
                        total_waste: totals.waste,
                        total_all: totals.electricity + totals.transport + totals.waste,
                        report_count: data.length,
                    });
                }
            } catch (err) {
                console.error('Error fetching summary for Beranda:', err);
                setSummary(null);
            } finally {
                setLoading(false);
            }
        };
    
        fetchSummaryData();
    }, [user, supabase, dataVersion]);

    const backgroundImages = {
        "Akomodasi": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?fm=jpg&q=60&w=3000&ixlib-rb-4-1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmFsaSUyMGhvdGVsfGVufDB8fDB8fHww",
        "Operator Jasa Perjalanan": "https://images.unsplash.com/photo-1616895727759-dd84a2690433?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "Pengelola Atraksi Wisata": "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=1171&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    };
    
    const defaultBgImage = "https://images.unsplash.com/photo-1505993594149-02d210a4f61b?q=80&w=2070&auto=format&fit=crop&ixlib.rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    const userBgImage = backgroundImages[businessType] || defaultBgImage;

    return (
        <div className="space-y-8">
            {/* Header Sambutan */}
            <div 
                className="relative p-8 rounded-2xl text-white bg-cover bg-center min-h-[180px] flex flex-col justify-between"
                style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.1)), url('${userBgImage}')` }}
            >
                 <button 
                    onClick={() => setActiveDashboardPage('notifikasi')}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
                >
                    <BellIcon />
                    <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                </button>
                <div className="relative z-0">
                    <h1 className="text-4xl font-extrabold drop-shadow-md">Selamat Datang, {businessName}!</h1>
                    <p className="mt-1 text-lg opacity-90 drop-shadow">Ini adalah pusat kendali Anda untuk pariwisata berkelanjutan.</p>
                </div>
            </div>

            {/* Konten Utama */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Kartu Total Emisi */}
                    {loading ? (
                        <div className="animate-pulse h-28 bg-slate-200 rounded-xl"></div>
                    ) : (
                        <div className="bg-[#22543d] text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
                            <div>
                                <p className="text-white/80">Total Emisi Keseluruhan</p>
                                <p className="text-3xl font-extrabold">{(summary?.total_all || 0).toFixed(2)} <span className="text-xl font-medium">kg CO₂e</span></p>
                                <p className="text-sm text-white/70 mt-1">Dari {summary?.report_count || 0} laporan yang telah dibuat.</p>
                            </div>
                            {/* --- PERUBAHAN: Ikon diubah menjadi gambar putih --- */}
                            <img 
                                src="https://png.pngtree.com/png-vector/20230311/ourmid/pngtree-carbon-dioxide-vector-icon-design-illustration-png-image_6641052.png" 
                                alt="CO2 Icon" 
                                className="w-16 h-16 object-contain filter brightness-0 invert opacity-70"
                            />
                        </div>
                    )}
                    
                    {/* Kartu Rincian */}
                    {loading ? (
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                            <div className="h-24 bg-slate-200 rounded-xl"></div>
                            <div className="h-24 bg-slate-200 rounded-xl"></div>
                            <div className="h-24 bg-slate-200 rounded-xl"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <DetailCard icon={<BoltIcon className="w-5 h-5"/>} value={summary?.total_electricity || 0} label="dari Listrik" colorClass={{bg: 'bg-amber-100', text: 'text-amber-600'}} />
                            <DetailCard icon={<TransportIcon className="w-6 h-6"/>} value={summary?.total_transport || 0} label="dari Transportasi" colorClass={{bg: 'bg-blue-100', text: 'text-blue-600'}} />
                            <DetailCard icon={<TrashCanIcon className="w-5 h-5"/>} value={summary?.total_waste || 0} label="dari Limbah" colorClass={{bg: 'bg-red-100', text: 'text-red-600'}} />
                        </div>
                    )}
                </div>

                {/* Kolom Aksi */}
                <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-between">
                     <div>
                        <h3 className="text-xl font-bold text-slate-800">Siap Melaporkan Emisi?</h3>
                        <p className="text-slate-500 mt-2">Mulai langkah Anda dengan melaporkan data emisi untuk periode ini.</p>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={() => setActiveDashboardPage('laporan-emisi')}
                            className="w-full py-3 text-base font-semibold text-white bg-[#22543d] rounded-lg transition-colors hover:bg-[#1c4532] flex items-center justify-center gap-2"
                        >
                            <DocumentChartBarIcon />
                            Lapor Emisi Sekarang
                        </button>
                        <button onClick={() => setActiveDashboardPage('panduan')} className="w-full mt-3 text-sm font-medium text-slate-500 hover:text-[#22543d] flex items-center justify-center gap-2 transition-colors">
                            <QuestionMarkCircleIcon />
                            Baca Panduan Penggunaan
                        </button>
                    </div>
                </div>
            </div>

            {/* --- BAGIAN VIDEO (DIPERBARUI) --- */}
            <div className="max-w-3xl mx-auto">
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800">Mengapa harus Pariwisata Berkelanjutan?</h3>
                    <div className="bg-white p-2 rounded-xl border shadow-sm aspect-video w-full overflow-hidden">
                         <iframe 
                            className="w-full h-full rounded-lg"
                            src="https://www.youtube.com/embed/7X1u7OdwYyE?si=vIh8eZfk_jYc8YnZ&autoplay=1&mute=1" 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerPolicy="strict-origin-when-cross-origin" 
                            allowFullScreen>
                        </iframe>
                    </div>
                </div>
            </div>
        </div>
    );
}