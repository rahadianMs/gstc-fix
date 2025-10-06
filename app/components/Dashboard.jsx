"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Impor semua komponen halaman
import BerandaPage from './BerandaPage';
import EmissionReportPage from './EmissionReportPage';
import DashboardSummary from './DashboardSummary';
import DashboardPieChart from './DashboardPieChart';
import DashboardTrends from './DashboardTrends';
import ProfilUsahaPage from './ProfilUsahaPage';
import NotificationPage from './NotificationPage';
import AboutPage from './AboutPage';
import AccountPage from './AccountPage';
import FaqPage from './FaqPage';
import SertifikasiPage from './SertifikasiPage';
import PembelajaranPage from './PembelajaranPage';
import PanduanPage from './PanduanPage';

import {
    HomeIcon, BellIcon, ChartPieIcon, BuildingOfficeIcon,
    DocumentChartBarIcon, PlusCircleIcon, AcademicCapIcon,
    QuestionMarkCircleIcon, UserCircleIcon
} from './Icons.jsx';

// Komponen PageContent yang mengatur halaman mana yang tampil
const PageContent = ({ activeDashboardPage, setActiveDashboardPage, supabase, user, sidebarLinks, dataVersion, onDataUpdate }) => {
    switch (activeDashboardPage) {
        case 'beranda':
            return <BerandaPage user={user} supabase={supabase} setActiveDashboardPage={setActiveDashboardPage} dataVersion={dataVersion} />;
        case 'dashboard-utama':
            // --- PERUBAHAN TATA LETAK DI SINI ---
            return (
                <div className="space-y-8">
                    <DashboardSummary supabase={supabase} user={user} dataVersion={dataVersion} />
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <DashboardTrends supabase={supabase} user={user} dataVersion={dataVersion} />
                        <DashboardPieChart supabase={supabase} user={user} dataVersion={dataVersion} />
                    </div>
                </div>
            );
        case 'laporan-emisi':
            return <EmissionReportPage supabase={supabase} user={user} onDataUpdate={onDataUpdate} />;
        case 'notifikasi':
            return <NotificationPage />;
        case 'profil-usaha':
            return <ProfilUsahaPage />;
        case 'sertifikasi':
            return <SertifikasiPage supabase={supabase} user={user} />;
        case 'pembelajaran':
            return <PembelajaranPage />;
        case 'panduan':
            return <PanduanPage />;
        case 'tentang':
            return <AboutPage />;
        case 'akun':
            return <AccountPage user={user} supabase={supabase} />;
        case 'faq':
            return <FaqPage />;
        default:
             return (
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md border text-center">
                    <h2 className="text-2xl font-bold mb-4">Halaman dalam Pengembangan</h2>
                    <p className="text-slate-500">Fitur untuk "{sidebarLinks.find(link => link.id === activeDashboardPage)?.text}" sedang kami siapkan.</p>
                </div>
            );
    }
};

// Komponen Dasbor Utama
export default function Dashboard({
    supabase,
    user,
    activeDashboardPage,
    setActiveDashboardPage,
    isUserMenuOpen,
    setIsUserMenuOpen,
    userMenuRef,
    handleLogout
}) {
    const [dataVersion, setDataVersion] = useState(Date.now());
    
    const logoKemenparPutih = "https://bob.kemenparekraf.go.id/wp-content/uploads/2025/02/Kementerian-Pariwisata-RI_Bahasa-Indonesia-Putih.png";
    const logoWiseSteps = "https://cdn-lgbgj.nitrocdn.com/ItTrnTtgyWTkOHFuOZYyLNqTCVGqVARe/assets/images/optimized/rev-7dc1829/wisesteps.id/wp-content/uploads/revslider/home-desktop-tablet-12/Wise-Steps-Consulting-Logo-White.png";


    const handleDataUpdate = () => {
        setDataVersion(Date.now());
    };

    const sidebarLinks = [
        { id: 'beranda', text: 'Beranda', icon: <HomeIcon /> },
        { id: 'notifikasi', text: 'Notifikasi', icon: <BellIcon /> },
        { id: 'dashboard-utama', text: 'Dasbor Utama', icon: <ChartPieIcon /> },
        { id: 'profil-usaha', text: 'Profil Usaha', icon: <BuildingOfficeIcon /> },
        { id: 'laporan-emisi', text: 'Laporan Emisi', icon: <DocumentChartBarIcon /> },
        { id: 'sertifikasi', text: 'Sertifikasi', icon: <PlusCircleIcon /> },
        { id: 'pembelajaran', text: 'Pembelajaran', icon: <AcademicCapIcon /> },
        { id: 'panduan', text: 'Panduan', icon: <QuestionMarkCircleIcon /> },
    ];

    const pageTitle = sidebarLinks.find(link => link.id === activeDashboardPage)?.text || 
                      (activeDashboardPage === 'akun' && 'Akun Saya') ||
                      (activeDashboardPage === 'faq' && 'FAQ') ||
                      (activeDashboardPage === 'tentang' && 'Tentang') ||
                      'Dasbor';

    return (
        <div id="app-wrapper" className="flex min-h-screen">
            <aside 
                className="fixed top-0 left-0 z-40 flex flex-col h-screen p-6 w-64 text-white"
                style={{backgroundColor: '#22543d'}}
            >
               <div className="pb-6 mb-4 border-b border-white/20">
                    <div className="flex items-center gap-4">
                        <img src={logoWiseSteps} alt="Wise Steps Consulting Logo" className="h-8" />
                        <img src={logoKemenparPutih} alt="Logo Kemenpar" className="h-9" />
                    </div>
                </div>
                <nav className="flex flex-col flex-grow gap-1">
                    {sidebarLinks.map(link => (
                        <button
                            key={link.id}
                            onClick={() => setActiveDashboardPage(link.id)}
                            className={`flex items-center gap-4 p-3 rounded-lg text-sm font-medium transition-colors ${activeDashboardPage === link.id ? 'bg-white/10 text-white font-semibold' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                        >
                            {link.icon}
                            <span>{link.text}</span>
                        </button>
                    ))}
                </nav>
                <div className="mt-auto">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full gap-4 p-3 text-sm font-medium text-red-400 rounded-lg hover:bg-red-500/20 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            <div className="flex flex-col flex-1 w-full ml-64">
                <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-10 bg-white border-b border-slate-200">
                    <h2 className="text-2xl font-bold">{pageTitle}</h2>
                    <div className="relative" ref={userMenuRef}>
                        <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100">
                            <UserCircleIcon />
                        </button>
                        {isUserMenuOpen && (
                            <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                    <button onClick={() => { setActiveDashboardPage('tentang'); setIsUserMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tentang</button>
                                    <button onClick={() => { setActiveDashboardPage('akun'); setIsUserMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Akun</button>
                                    <button onClick={() => { setActiveDashboardPage('faq'); setIsUserMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">FAQ</button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>
                <main className="flex-1 p-10 overflow-y-auto bg-slate-50">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeDashboardPage}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <PageContent
                                activeDashboardPage={activeDashboardPage}
                                setActiveDashboardPage={setActiveDashboardPage}
                                supabase={supabase}
                                user={user}
                                sidebarLinks={sidebarLinks}
                                dataVersion={dataVersion}
                                onDataUpdate={handleDataUpdate}
                            />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}