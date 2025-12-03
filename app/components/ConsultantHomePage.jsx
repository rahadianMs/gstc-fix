"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConsultantNotificationCenter from './ConsultantNotificationCenter';
import { motion, AnimatePresence } from 'framer-motion';
import { exportToExcel } from '../lib/exportToExcel';

// --- IKON-IKON ---
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
const BuildingOfficeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>;
const MapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0z" /></svg>;
const TicketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v9.632c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>;

// --- KOMPONEN TAB SECTOR ---
const SectorTab = ({ active, label, icon, onClick, count }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 text-sm font-medium transition-all border-b-2 ${
            active 
                ? 'border-[#1c3d52] text-[#1c3d52] bg-blue-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
        }`}
    >
        {icon}
        <span>{label}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs ${active ? 'bg-[#1c3d52] text-white' : 'bg-slate-200 text-slate-600'}`}>
            {count}
        </span>
    </button>
);

// --- KOMPONEN STATS CARD ---
const StatCard = ({ title, count, icon, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <h4 className="text-2xl font-bold text-slate-800">{count}</h4>
        </div>
    </div>
);

export default function ConsultantHomePage({ supabase, user }) {
    const router = useRouter();
    const [allData, setAllData] = useState([]); // Menyimpan semua data mentah
    const [filteredData, setFilteredData] = useState([]); // Data yang ditampilkan (setelah filter)
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);
    
    // State UI
    const [activeTab, setActiveTab] = useState('destination'); // 'destination', 'hotel', 'tour_operator'
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            // Mengambil semua user dengan role apapun (nanti difilter di client)
            // Asumsi: Nanti Anda akan punya role 'hotel' dan 'tour_operator' di database
            // Untuk saat ini kita ambil 'destination' dulu, logic filter sudah disiapkan
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id, destination_name, admin_province, role, organization_type')
                .in('role', ['destination', 'hotel', 'tour_operator']) 
                .order('destination_name');

            if (error) {
                console.error("Error fetching profiles:", error);
                setLoading(false);
                return;
            }

            // Ambil progress untuk setiap profile
            const profilesWithProgress = await Promise.all(
                profiles.map(async (profile) => {
                    const { data: progress } = await supabase.rpc('get_compliance_progress', { p_destination_id: profile.id });
                    return { ...profile, progress: progress || 0 };
                })
            );

            setAllData(profilesWithProgress);
            setLoading(false);
        };
        fetchData();
    }, [supabase]);

    // Efek untuk memfilter data berdasarkan Tab Aktif & Search Query
    useEffect(() => {
        let result = allData;

        // 1. Filter by Tab (Role/Type)
        if (activeTab === 'destination') {
            result = result.filter(item => item.role === 'destination');
        } else if (activeTab === 'hotel') {
            result = result.filter(item => item.role === 'hotel' || item.organization_type?.toLowerCase().includes('hotel'));
        } else if (activeTab === 'tour_operator') {
            result = result.filter(item => item.role === 'tour_operator' || item.organization_type?.toLowerCase().includes('tour'));
        }

        // 2. Filter by Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item => 
                item.destination_name?.toLowerCase().includes(query) || 
                item.admin_province?.toLowerCase().includes(query)
            );
        }

        setFilteredData(result);
    }, [allData, activeTab, searchQuery]);

    const handleDownloadReport = async (destination) => {
        setDownloadingId(destination.id);
        const { data, error } = await supabase.rpc('get_destination_report', { p_destination_id: destination.id });
        if (error) alert(`Gagal: ${error.message}`);
        else if (data) exportToExcel(data, destination.destination_name);
        setDownloadingId(null);
    };

    // Hitung jumlah untuk badge tab
    const countDestination = allData.filter(i => i.role === 'destination').length;
    const countHotel = allData.filter(i => i.role === 'hotel' || i.organization_type?.toLowerCase().includes('hotel')).length;
    const countTour = allData.filter(i => i.role === 'tour_operator' || i.organization_type?.toLowerCase().includes('tour')).length;

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Control Tower</h1>
                    <p className="text-slate-500 mt-1">Pantau performa keberlanjutan klien Anda dalam satu pandangan.</p>
                </div>
                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari nama atau lokasi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1c3d52] focus:border-transparent bg-white shadow-sm transition-all"
                    />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Destinasi" 
                    count={countDestination} 
                    icon={<MapIcon className="w-6 h-6 text-blue-600"/>} 
                    color="bg-blue-50"
                />
                <StatCard 
                    title="Total Hotel" 
                    count={countHotel} 
                    icon={<BuildingOfficeIcon className="w-6 h-6 text-emerald-600"/>} 
                    color="bg-emerald-50"
                />
                <StatCard 
                    title="Tour Operator" 
                    count={countTour} 
                    icon={<TicketIcon className="w-6 h-6 text-purple-600"/>} 
                    color="bg-purple-50"
                />
            </div>

            {/* Notifikasi */}
            {user && <ConsultantNotificationCenter supabase={supabase} user={user} />}

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Sector Tabs (Pintu Pemisah) */}
                <div className="flex border-b border-slate-200 overflow-x-auto">
                    <SectorTab 
                        active={activeTab === 'destination'} 
                        label="Destinasi Wisata" 
                        icon={<MapIcon />} 
                        count={countDestination}
                        onClick={() => setActiveTab('destination')}
                    />
                    <SectorTab 
                        active={activeTab === 'hotel'} 
                        label="Perhotelan (Coming Soon)" 
                        icon={<BuildingOfficeIcon />} 
                        count={countHotel}
                        onClick={() => setActiveTab('hotel')}
                    />
                    <SectorTab 
                        active={activeTab === 'tour_operator'} 
                        label="Tour Operator (Coming Soon)" 
                        icon={<TicketIcon />} 
                        count={countTour}
                        onClick={() => setActiveTab('tour_operator')}
                    />
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Klien</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Lokasi / Kategori</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">Progress Kepatuhan</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500 animate-pulse">Memuat data...</td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                            <p className="font-medium">Belum ada data untuk kategori ini.</p>
                                            <p className="text-sm text-slate-400 mt-1">Data akan muncul setelah klien mendaftar.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{item.destination_name}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{item.organization_type || 'Organisasi'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {item.admin_province || 'Lokasi belum diatur'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div 
                                                    className={`h-full rounded-full ${item.progress >= 80 ? 'bg-green-500' : item.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                                    initial={{ width: 0 }} 
                                                    animate={{ width: `${item.progress}%` }} 
                                                    transition={{ duration: 1, ease: "easeOut" }} 
                                                />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 w-10 text-right">{Math.round(item.progress)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleDownloadReport(item)}
                                                disabled={downloadingId === item.id}
                                                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-[#1c3d52] rounded-lg transition-colors" 
                                                title="Download Laporan"
                                            >
                                                {downloadingId === item.id ? <span className="text-xs font-bold">...</span> : <DownloadIcon />}
                                            </button>
                                            
                                            <button 
                                                onClick={() => router.push(`/dashboard/consultant/review/${item.id}`)} 
                                                className="px-4 py-2 text-xs font-bold text-white rounded-lg flex items-center gap-2 hover:shadow-md transition-all active:scale-95" 
                                                style={{backgroundColor: '#1c3d52'}}
                                            >
                                                Review <ChevronRightIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}