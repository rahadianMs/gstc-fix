// app/components/Dashboard.jsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Impor semua komponen halaman
import BerandaPage from './BerandaPage';
import StandardCompliancePage from './StandardCompliancePage';
import PillarDetailPage from './PillarDetailPage';
import AdminDashboardPage from './AdminDashboardPage';
import AdminDestinationDetailPage from './AdminDestinationDetailPage';
import AboutPage from './AboutPage';
import AccountPage from './AccountPage';
import FaqPage from './FaqPage';
import PembelajaranPage from './PembelajaranPage';
import PanduanPage from './PanduanPage';
import SelfAssessmentPage from './SelfAssessmentPage';
import ActionPlanPage from './ActionPlanPage';
import BookingSessionPage from './BookingSessionPage';
import ResourceAdminPage from './ResourceAdminPage'; // <-- 1. IMPORT HALAMAN BARU

// Impor Ikon
import {
    HomeIcon,
    ClipboardCheckIcon,
    AcademicCapIcon,
    QuestionMarkCircleIcon,
    UserCircleIcon,
    ShieldCheckIcon,
    ChevronDownIcon,
    DocumentChartBarIcon,
    PencilIcon,
    VideoCameraIcon,
} from './Icons.jsx';

// Komponen Dasbor Utama
export default function Dashboard({ supabase, user, activeDashboardPage, setActiveDashboardPage, isUserMenuOpen, setIsUserMenuOpen, userMenuRef, handleLogout }) {
    const [isComplianceOpen, setIsComplianceOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loadingRole, setLoadingRole] = useState(true);
    const [dataVersion, setDataVersion] = useState(Date.now());
    
    const logoWiseSteps = "https://github.com/rahadianMs/gstc-fix/blob/main/asset/WSG_Masterfiles_Logo-02-1024x264.png?raw=true";

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
            { id: 'home', text: 'Home', icon: <HomeIcon /> },
            { id: 'review-compliance', text: 'Review Compliance', icon: <DocumentChartBarIcon /> },
            { id: 'action-plan', text: 'Action Plan', icon: <ClipboardCheckIcon /> },
            { id: 'booking-session', text: 'Consultation Session', icon: <VideoCameraIcon /> },
            { id: 'pembelajaran', text: 'Resource', icon: <AcademicCapIcon /> },
            { id: 'panduan', text: 'Guide', icon: <QuestionMarkCircleIcon /> },
        ];
    } else {
        sidebarLinks = [
            { id: 'home', text: 'Home', icon: <HomeIcon /> },
            { 
                id: 'standard-compliance', text: 'Standard Compliance', icon: <ShieldCheckIcon />,
                children: [
                    { id: 'compliance-a', text: 'PILAR A' }, { id: 'compliance-b', text: 'PILAR B' },
                    { id: 'compliance-c', text: 'PILAR C' }, { id: 'compliance-d', text: 'PILAR D' },
                ] 
            },
            { id: 'action-plan', text: 'Action Plan', icon: <ClipboardCheckIcon /> },
            { id: 'booking-session', text: 'Consultation Session', icon: <VideoCameraIcon /> },
            { id: 'self-assessment', text: 'Self-Assessment', icon: <PencilIcon className="w-5 h-5" /> },
            { id: 'pembelajaran', text: 'Resource', icon: <AcademicCapIcon /> },
            { id: 'panduan', text: 'Guide', icon: <QuestionMarkCircleIcon /> },
        ];
    }
    
    const getPageTitle = () => {
        if (typeof activeDashboardPage === 'object' && activeDashboardPage?.page === 'admin-destination-detail') {
            return "Review Destinasi";
        }
        
        if (typeof activeDashboardPage === 'string' && activeDashboardPage.startsWith('compliance-')) {
            const pillar = activeDashboardPage.split('-')[1].toUpperCase();
            return `Pilar ${pillar}`;
        }

        // <-- 2. TAMBAHKAN KONDISI UNTUK JUDUL HALAMAN ADMIN
        if (activeDashboardPage === 'resource-admin') {
            return 'Kelola Materi';
        }

        const allLinks = sidebarLinks.flatMap(l => l.children || [l]);
        const activeLink = allLinks.find(link => link.id === activeDashboardPage);

        if (activeLink) return activeLink.text;
        if (activeDashboardPage === 'akun') return 'Akun Saya';
        if (activeDashboardPage === 'faq') return 'FAQ';
        if (activeDashboardPage === 'tentang') return 'Tentang';
        return 'Dasbor';
    };
    const pageTitle = getPageTitle();
    
    const isLinkActive = (link) => {
        if (link.id === activeDashboardPage) return true;

        // <-- 3. TAMBAHKAN LOGIKA ACTIVE STATE UNTUK ADMIN
        if (link.id === 'pembelajaran' && activeDashboardPage === 'resource-admin') return true;

        if ((link.id === 'standard-compliance' || link.id === 'review-compliance') && typeof activeDashboardPage === 'object' && activeDashboardPage?.page === 'admin-destination-detail') {
            return true;
        }
        if (link.children && typeof activeDashboardPage === 'string') {
            return link.children.some(child => child.id === activeDashboardPage);
        }
        return false;
    };
    
    let pageToRender;

    if (loadingRole) {
        pageToRender = <div className="text-center p-8">Memverifikasi peran pengguna...</div>;
    } else if (typeof activeDashboardPage === 'object' && activeDashboardPage !== null) {
        if (activeDashboardPage.page === 'admin-destination-detail') {
            pageToRender = <AdminDestinationDetailPage 
                destinationId={activeDashboardPage.destinationId} 
                supabase={supabase} 
                setActiveDashboardPage={setActiveDashboardPage} 
                user={user} 
            />;
        }
    } else if (typeof activeDashboardPage === 'string' && activeDashboardPage.startsWith('compliance-')) {
        const pillar = activeDashboardPage.split('-')[1].toUpperCase();
        pageToRender = <PillarDetailPage pillar={pillar} supabase={supabase} user={user} />;
    } else {
        switch (activeDashboardPage) {
            case 'home':
                pageToRender = userRole === 'consultant' 
                    ? <AdminDashboardPage supabase={supabase} setActiveDashboardPage={setActiveDashboardPage} />
                    : <BerandaPage user={user} supabase={supabase} setActiveDashboardPage={setActiveDashboardPage} dataVersion={dataVersion} />;
                break;
            case 'review-compliance':
                pageToRender = <AdminDashboardPage supabase={supabase} setActiveDashboardPage={setActiveDashboardPage} />;
                break;
            case 'standard-compliance':
                pageToRender = <StandardCompliancePage setActiveDashboardPage={setActiveDashboardPage} />;
                break;
            case 'action-plan':
                pageToRender = <ActionPlanPage supabase={supabase} user={user} userRole={userRole} />;
                break;
            case 'booking-session':
                pageToRender = <BookingSessionPage supabase={supabase} user={user} userRole={userRole} />;
                break;
            case 'self-assessment':
                pageToRender = <SelfAssessmentPage supabase={supabase} user={user} />;
                break;
            case 'pembelajaran':
                // <-- 4. PASS PROPS BARU KE PEMBELAJARANPAGE
                pageToRender = <PembelajaranPage supabase={supabase} user={user} userRole={userRole} setActiveDashboardPage={setActiveDashboardPage} />;
                break;
            // <-- 5. TAMBAHKAN CASE BARU UNTUK HALAMAN ADMIN
            case 'resource-admin':
                 pageToRender = <ResourceAdminPage supabase={supabase} user={user} setActiveDashboardPage={setActiveDashboardPage} />;
                break;
            case 'panduan':
                pageToRender = <PanduanPage />;
                break;
            case 'tentang':
                pageToRender = <AboutPage />;
                break;
            case 'akun':
                pageToRender = <AccountPage user={user} supabase={supabase} />;
                break;
            case 'faq':
                pageToRender = <FaqPage />;
                break;
            default:
                pageToRender = <div className="text-center p-8">Halaman tidak ditemukan.</div>;
        }
    }


    return (
        <div id="app-wrapper" className="flex min-h-screen bg-slate-100">
            <style jsx global>{`
                .logo-white {
                    filter: brightness(0) invert(1) grayscale(1);
                }
            `}</style>
            <aside 
                className="fixed top-0 left-0 z-40 flex flex-col h-screen p-6 w-72 text-white"
                style={{backgroundColor: '#1c2120'}}
            >
               <div className="pb-6 mb-4 border-b border-white/20 flex items-center gap-3">
                    <img 
                        src={logoWiseSteps} 
                        alt="Wise Steps Consulting Logo" 
                        className="h-8 logo-white" 
                    />
                    <div>
                        <h1 className="text-sm font-bold leading-tight">Certification</h1>
                        <h1 className="text-sm font-bold leading-tight">Assistance</h1>
                    </div>
               </div>
                <nav className="flex flex-col flex-grow gap-1 overflow-y-auto">
                    {sidebarLinks.map(link => {
                        const isActive = isLinkActive(link);
                        return link.children ? (
                            <div key={link.id}>
                                <button onClick={() => setIsComplianceOpen(!isComplianceOpen)} className={`w-full flex items-center justify-between gap-4 p-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/10' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                                    <div className="flex items-center gap-4" style={isActive ? {color: '#e8c458'} : {}}>
                                        {link.icon}
                                        <span>{link.text}</span>
                                    </div>
                                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isComplianceOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>{isComplianceOpen && ( <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-8 mt-1 space-y-1">
                                    {link.children.map(child => (
                                        <button key={child.id} onClick={() => setActiveDashboardPage(child.id)} className={`w-full text-left py-2 px-3 rounded-md text-sm transition-colors ${activeDashboardPage === child.id ? 'font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'}`} style={activeDashboardPage === child.id ? {color: '#e8c458'} : {}}>{child.text}</button>
                                    ))}
                                </motion.div>)}</AnimatePresence>
                            </div>
                        ) : (
                            <button key={link.id} onClick={() => setActiveDashboardPage(link.id)} className={`flex items-center gap-4 p-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/10' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                                <div className="flex items-center gap-4" style={isActive ? {color: '#e8c458'} : {}}>
                                    {link.icon}
                                    <span>{link.text}</span>
                                </div>
                            </button>
                        );
                    })}
                </nav>
                <div className="mt-auto pt-4 border-t border-white/20">
                    <button onClick={handleLogout} className="flex items-center w-full gap-4 p-3 text-sm font-medium text-red-400 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            <div className="flex flex-col flex-1 w-full ml-72">
                <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-10" style={{backgroundColor: '#1c2120'}}>
                    <h2 className="text-2xl font-bold text-white/90">{pageTitle}</h2>
                    <div className="relative" ref={userMenuRef}>
                       <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center justify-center w-10 h-10 rounded-full text-white/80 hover:bg-white/10">
                            <UserCircleIcon />
                        </button>
                        <AnimatePresence>
                        {isUserMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                            >
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
                        <motion.div 
                            key={typeof activeDashboardPage === 'object' ? activeDashboardPage.destinationId : activeDashboardPage} 
                            initial={{ opacity: 0, y: 15 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -15 }} 
                            transition={{ duration: 0.2 }}
                        >
                            {pageToRender}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}