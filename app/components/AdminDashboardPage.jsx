"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// --- IKON ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
const MapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0z" /></svg>;
const BuildingOfficeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>;
const TicketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v9.632c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>;

// --- KOMPONEN TAB ---
const SectorTab = ({ active, label, icon, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all ${
            active 
                ? 'bg-[#1c3d52] text-white shadow-md' 
                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default function AdminDashboardPage({ supabase }) {
    const router = useRouter();
    const [allDestinations, setAllDestinations] = useState([]);
    const [filteredDestinations, setFilteredDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // UI State
    const [activeTab, setActiveTab] = useState('destination');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchDestinations = async () => {
            setLoading(true);
            
            // Fetch profiles
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id, destination_name, admin_province, role, organization_type')
                // Sementara fetch semua role, nanti filter di client
                .in('role', ['destination', 'hotel', 'tour_operator']) 
                .order('destination_name');

            if (error) {
                setError(`Gagal memuat data: ${error.message}`);
                setLoading(false);
                return;
            }

            // Fetch progress untuk indikator visual
            const profilesWithProgress = await Promise.all(
                profiles.map(async (profile) => {
                    const { data: progress } = await supabase.rpc('get_compliance_progress', { p_destination_id: profile.id });
                    return { ...profile, progress: progress || 0 };
                })
            );

            setAllDestinations(profilesWithProgress);
            setLoading(false);
        };
        fetchDestinations();
    }, [supabase]);

    // Logic Filtering
    useEffect(() => {
        let result = allDestinations;

        // 1. Filter Tab
        if (activeTab === 'destination') {
            result = result.filter(d => d.role === 'destination');
        } else if (activeTab === 'hotel') {
            result = result.filter(d => d.role === 'hotel' || d.organization_type?.toLowerCase().includes('hotel'));
        } else if (activeTab === 'tour_operator') {
            result = result.filter(d => d.role === 'tour_operator' || d.organization_type?.toLowerCase().includes('tour'));
        }

        // 2. Filter Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(d => 
                d.destination_name?.toLowerCase().includes(query) || 
                d.admin_province?.toLowerCase().includes(query)
            );
        }

        setFilteredDestinations(result);
    }, [allDestinations, activeTab, searchQuery]);

    if (error) return <div className="text-red-500 p-8 text-center bg-red-50 rounded-lg border border-red-200">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-6">
                <div>
                    <h1 className="text-4xl font-bold text-slate-800">Review Kepatuhan</h1>
                    <p className="mt-2 text-lg text-slate-600">Pilih klien untuk melakukan validasi bukti dan memberikan feedback.</p>
                </div>
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari klien..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1c3d52] bg-white shadow-sm transition-all"
                    />
                </div>
            </div>

            {/* Tab Navigasi */}
            <div className="flex flex-wrap gap-3">
                <SectorTab 
                    active={activeTab === 'destination'} 
                    label="Destinasi" 
                    icon={<MapIcon />} 
                    onClick={() => setActiveTab('destination')} 
                />
                <SectorTab 
                    active={activeTab === 'hotel'} 
                    label="Hotel" 
                    icon={<BuildingOfficeIcon />} 
                    onClick={() => setActiveTab('hotel')} 
                />
                <SectorTab 
                    active={activeTab === 'tour_operator'} 
                    label="Tour Operator" 
                    icon={<TicketIcon />} 
                    onClick={() => setActiveTab('tour_operator')} 
                />
            </div>

            {/* Content List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500">Memuat data...</div>
                ) : filteredDestinations.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                            <SearchIcon />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700">Klien tidak ditemukan</h3>
                        <p className="text-slate-500">Coba ubah kata kunci atau ganti kategori.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {filteredDestinations.map(dest => (
                            <li key={dest.id} className="group">
                                <button 
                                    onClick={() => router.push(`/dashboard/consultant/review/${dest.id}`)}
                                    className="w-full text-left p-6 hover:bg-blue-50/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm ${
                                            dest.progress >= 80 ? 'bg-green-500' : dest.progress >= 50 ? 'bg-yellow-500' : 'bg-[#1c3d52]'
                                        }`}>
                                            {dest.destination_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#1c3d52] transition-colors">{dest.destination_name}</h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-2">
                                                {dest.admin_province || 'Lokasi belum diatur'}
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span className="capitalize">{dest.organization_type || dest.role}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        {/* Progress Bar Mini */}
                                        <div className="hidden md:block w-32">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-semibold text-slate-600">Progress</span>
                                                <span className="font-bold text-slate-800">{Math.round(dest.progress)}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div 
                                                    className="h-full bg-[#1c3d52]" 
                                                    initial={{ width: 0 }} 
                                                    animate={{ width: `${dest.progress}%` }} 
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-semibold group-hover:bg-[#1c3d52] group-hover:text-white group-hover:border-[#1c3d52] transition-all flex items-center gap-2 shadow-sm">
                                            Mulai Review <ChevronRightIcon />
                                        </div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}