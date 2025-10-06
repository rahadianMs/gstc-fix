"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Impor semua komponen halaman yang kita butuhkan
import BerandaPage from './BerandaPage';
import StandardCompliancePage from './StandardCompliancePage';
import PillarDetailPage from './PillarDetailPage';
import AdminDashboardPage from './AdminDashboardPage';
import AdminDestinationDetailPage from './AdminDestinationDetailPage';
import NotificationPage from './NotificationPage'; // Digunakan untuk 'What To Do'
import AboutPage from './AboutPage';
import AccountPage from './AccountPage';
import FaqPage from './FaqPage';
import PembelajaranPage from './PembelajaranPage';
import PanduanPage from './PanduanPage';

// Impor Ikon yang relevan
import {
    HomeIcon,
    ClipboardCheckIcon,
    AcademicCapIcon,
    QuestionMarkCircleIcon,
    UserCircleIcon,
    ShieldCheckIcon,
    ChevronDownIcon,
    DocumentChartBarIcon
} from './Icons.jsx';

// Komponen Dasbor Utama
export default function Dashboard({ supabase, user, activeDashboardPage, setActiveDashboardPage, isUserMenuOpen, setIsUserMenuOpen, userMenuRef, handleLogout }) {
    const [isComplianceOpen, setIsComplianceOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loadingRole, setLoadingRole] = useState(true);
    const [dataVersion, setDataVersion] = useState(Date.now());


    useEffect(() => {
        const fetchUserRole = async () => {
            if (!user) return;
            setLoadingRole(true);
            const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            setUserRole(data?.role || 'destination');
            setLoadingRole(false);
        };
        fetchUserRole();
    }, [user, supabase]);

    useEffect(() => {
        const isCompliancePageActive = (typeof activeDashboardPage === 'string' && activeDashboardPage.startsWith('compliance-')) ||
                                       (typeof activeDashboardPage === 'object' && activeDashboardPage?.page === 'admin-destination-detail');
        if (isCompliancePageActive) {
            setIsComplianceOpen(true);
        }
    }, [activeDashboardPage]);

    let sidebarLinks = [];
    if (userRole === 'consultant') {
        sidebarLinks = [
            { id: 'beranda', text: 'Beranda', icon: <HomeIcon /> },
            { id: 'review-compliance', text: 'Review Kepatuhan', icon: <DocumentChartBarIcon /> },
            { id: 'what-to-do', text: 'What To Do', icon: <ClipboardCheckIcon /> },
            { id: 'pembelajaran', text: 'Pembelajaran', icon: <AcademicCapIcon /> },
            { id: 'panduan', text: 'Panduan', icon: <QuestionMarkCircleIcon /> },
        ];
    } else {
        sidebarLinks = [
            { id: 'beranda', text: 'Beranda', icon: <HomeIcon /> },
            { id: 'what-to-do', text: 'What To Do', icon: <ClipboardCheckIcon /> },
            { 
                id: 'standard-compliance', text: 'Standar Kepatuhan', icon: <ShieldCheckIcon />,
                children: [
                    { id: 'compliance-a', text: 'BAGIAN A: Pengelolaan Berkelanjutan' },
                    { id: 'compliance-b', text: 'BAGIAN B: Keberlanjutan Sosial-Ekonomi' },
                    { id: 'compliance-c', text: 'BAGIAN C: Keberlanjutan Budaya' },
                    { id: 'compliance-d', text: 'BAGIAN D: Keberlanjutan Lingkungan' },
                ] 
            },
            { id: 'pembelajaran', text: 'Pembelajaran', icon: <AcademicCapIcon /> },
            { id: 'panduan', text: 'Panduan', icon: <QuestionMarkCircleIcon /> },
        ];
    }
    
    const getPageTitle = () => {
        if (typeof activeDashboardPage === 'object' && activeDashboardPage?.page === 'admin-destination-detail') {
            return "Review Destinasi";
        }
        const allLinks = sidebarLinks.flatMap(l => l.children || [l]);
        const activeLink = allLinks.find(link => link.id === activeDashboardPage);
        if (activeLink) return activeLink.text;

        switch(activeDashboardPage) {
            case 'akun': return 'Akun Saya';
            case 'faq': return 'FAQ';
            case 'tentang': return 'Tentang';
            default: return 'Dasbor';
        }
    };
    const pageTitle = getPageTitle();

    const PageContent = () => {
        if (loadingRole) return <div className="text-center p-8">Memverifikasi peran pengguna...</div>;

        if (typeof activeDashboardPage === 'object' && activeDashboardPage !== null) {
            if (activeDashboardPage.page === 'admin-destination-detail') {
                return <AdminDestinationDetailPage destinationId={activeDashboardPage.destinationId} supabase={supabase} setActiveDashboardPage={setActiveDashboardPage} />;
            }
        }
        
        switch (activeDashboardPage) {
            case 'beranda':
                return userRole === 'consultant' 
                    ? <div className="text-center"><h1>Selamat Datang, Konsultan!</h1><p>Halaman beranda untuk konsultan.</p></div> 
                    : <BerandaPage user={user} supabase={supabase} setActiveDashboardPage={setActiveDashboardPage} dataVersion={dataVersion} />;
            case 'review-compliance':
                return <AdminDashboardPage supabase={supabase} setActiveDashboardPage={setActiveDashboardPage} />;
            case 'standard-compliance':
                return <StandardCompliancePage setActiveDashboardPage={setActiveDashboardPage} />;
            case 'compliance-a': return <PillarDetailPage pillar="A" supabase={supabase} user={user} />;
            case 'compliance-b': return <PillarDetailPage pillar="B" supabase={supabase} user={user} />;
            case 'compliance-c': return <PillarDetailPage pillar="C" supabase={supabase} user={user} />;
            case 'compliance-d': return <PillarDetailPage pillar="D" supabase={supabase} user={user} />;
            case 'what-to-do': return <NotificationPage />;
            case 'pembelajaran': return <PembelajaranPage />;
            case 'panduan': return <PanduanPage />;
            case 'tentang': return <AboutPage />;
            case 'akun': return <AccountPage user={user} supabase={supabase} />;
            case 'faq': return <FaqPage />;
            default:
                 return <div className="text-center p-8">Halaman tidak ditemukan.</div>;
        }
    };
    
    const isLinkActive = (link) => {
        if (link.id === activeDashboardPage) return true;
        if ((link.id === 'standard-compliance' || link.id === 'review-compliance') && typeof activeDashboardPage === 'object' && activeDashboardPage?.page === 'admin-destination-detail') {
            return true;
        }
        if (link.children && typeof activeDashboardPage === 'string') {
            return link.children.some(child => child.id === activeDashboardPage);
        }
        return false;
    };

    return (
        <div id="app-wrapper" className="flex min-h-screen bg-slate-50">
            <aside className="fixed top-0 left-0 z-40 flex flex-col h-screen p-6 w-72 text-white" style={{backgroundColor: '#22543d'}}>
               <div className="pb-6 mb-4 border-b border-white/20">
                    <h1 className="text-xl font-bold">GSTC Self Assistant</h1>
                </div>
                <nav className="flex flex-col flex-grow gap-1 overflow-y-auto">
                    {sidebarLinks.map(link => {
                        const isActive = isLinkActive(link);
                        return link.children ? (
                            <div key={link.id}>
                                <button onClick={() => setIsComplianceOpen(!isComplianceOpen)} className={`w-full flex items-center justify-between gap-4 p-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white font-semibold' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}>
                                    <div className="flex items-center gap-4">{link.icon}<span>{link.text}</span></div>
                                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isComplianceOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>{isComplianceOpen && ( <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-8 mt-1 space-y-1">
                                    {link.children.map(child => (
                                        <button key={child.id} onClick={() => setActiveDashboardPage(child.id)} className={`w-full text-left py-2 px-3 rounded-md text-sm transition-colors ${activeDashboardPage === child.id ? 'text-white font-bold bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>{child.text}</button>
                                    ))}
                                </motion.div>)}</AnimatePresence>
                            </div>
                        ) : (
                            <button key={link.id} onClick={() => setActiveDashboardPage(link.id)} className={`flex items-center gap-4 p-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white font-semibold' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}>{link.icon}<span>{link.text}</span></button>
                        );
                    })}
                </nav>
                <div className="mt-auto pt-4 border-t border-white/20">
                    <button onClick={handleLogout} className="flex items-center w-full gap-4 p-3 text-sm font-medium text-red-300 rounded-lg hover:bg-red-500/20 hover:text-red-200 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            <div className="flex flex-col flex-1 w-full ml-72">
                <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-10 bg-white border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800">{pageTitle}</h2>
                    <div className="relative" ref={userMenuRef}>
                       <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100">
                            <UserCircleIcon />
                        </button>
                        <AnimatePresence>
                        {isUserMenuOpen && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                    <button onClick={() => { setActiveDashboardPage('tentang'); setIsUserMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tentang</button>
                                    <button onClick={() => { setActiveDashboardPage('akun'); setIsUserMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Akun</button>
                                    <button onClick={() => { setActiveDashboardPage('faq'); setIsUserMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">FAQ</button>
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                </header>
                <main className="flex-1 p-10 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div key={typeof activeDashboardPage === 'object' ? activeDashboardPage.destinationId : activeDashboardPage} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
                            <PageContent />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}