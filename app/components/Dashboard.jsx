import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BerandaPage from './BerandaPage';
import PanduanPage from './PanduanPage';
import SertifikasiPage from './SertifikasiPage';
import PembelajaranPage from './PembelajaranPage';
import FaqPage from './FaqPage';
import ProfilUsahaPage from './ProfilUsahaPage';
import SubSectionSelectionPage from './SubSectionSelectionPage';
import StandardCompliancePage from './StandardCompliancePage';
import PillarDetailPage from './PillarDetailPage';
import CriterionListPage from './CriterionListPage';
import AboutPage from './AboutPage';
import AccountPage from './AccountPage';
import NotificationPage from './NotificationPage';
import AdminDashboardPage from './AdminDashboardPage';
import AdminDestinationDetailPage from './AdminDestinationDetailPage';
import { Home, BookOpen, Award, Lightbulb, HelpCircle, User, Settings, LogOut, ChevronDown, ChevronRight, Menu, X, Bell, Building } from 'lucide-react';

const Dashboard = ({ user, onLogout }) => {
    const [activeDashboardPage, setActiveDashboardPage] = useState('beranda');
    const [pageHistory, setPageHistory] = useState(['beranda']);
    const [selectedPillar, setSelectedPillar] = useState(null);
    const [selectedCriterion, setSelectedCriterion] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isComplianceMenuOpen, setIsComplianceMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [destinationName, setDestinationName] = useState('Kawasan Desa');

    useEffect(() => {
        setIsAdmin(user?.email === 'gstc.admin@gmail.com');
    }, [user]);

    const navigateTo = (page, state = {}) => {
        setPageHistory(prev => [...prev, page]);
        setActiveDashboardPage(page);
        if (page === 'pillarDetail') setSelectedPillar(state.pillar);
        if (page === 'criterionList') setSelectedCriterion(state.criterion);
        if (page === 'adminDestinationDetail') setSelectedDestination(state.destination);
    };

    const navigateBack = () => {
        if (pageHistory.length > 1) {
            const newHistory = [...pageHistory];
            newHistory.pop();
            setPageHistory(newHistory);
            setActiveDashboardPage(newHistory[newHistory.length - 1]);
        }
    };

    const renderContent = () => {
        switch (activeDashboardPage) {
            case 'beranda': return <BerandaPage navigateTo={navigateTo} />;
            case 'panduan': return <PanduanPage />;
            case 'sertifikasi': return <SertifikasiPage />;
            case 'pembelajaran': return <PembelajaranPage />;
            case 'faq': return <FaqPage />;
            case 'profil-usaha': return <ProfilUsahaPage />;
            case 'subSectionSelection': return <SubSectionSelectionPage navigateTo={navigateTo} />;
            case 'standardCompliance': return <StandardCompliancePage navigateTo={navigateTo} />;
            case 'pillarDetail': return <PillarDetailPage pillar={selectedPillar} navigateTo={navigateTo} />;
            case 'criterionList': return <CriterionListPage criterion={selectedCriterion} navigateTo={navigateTo} />;
            case 'tentang': return <AboutPage />;
            case 'akun': return <AccountPage user={user} />;
            case 'notifikasi': return <NotificationPage />;
            case 'adminDashboard': return <AdminDashboardPage navigateTo={navigateTo} />;
            case 'adminDestinationDetail': return <AdminDestinationDetailPage destination={selectedDestination} />;
            default: return <BerandaPage navigateTo={navigateTo} />;
        }
    };

    const getPageTitle = () => {
        const pageTitles = {
            beranda: 'Beranda',
            panduan: 'Panduan',
            sertifikasi: 'Sertifikasi',
            pembelajaran: 'Pembelajaran',
            faq: 'FAQ',
            'profil-usaha': 'Profil Usaha',
            subSectionSelection: 'Pilih Sub-bagian',
            standardCompliance: 'Standar Kepatuhan',
            pillarDetail: `Detail Pilar: ${selectedPillar?.name || ''}`,
            criterionList: `Daftar Kriteria: ${selectedCriterion?.name || ''}`,
            tentang: 'Tentang Aplikasi',
            akun: 'Pengaturan Akun',
            notifikasi: 'Notifikasi',
            adminDashboard: 'Dashboard Admin',
            adminDestinationDetail: `Detail Destinasi: ${selectedDestination?.destination_name || ''}`,
        };
        return pageTitles[activeDashboardPage] || 'Dashboard';
    };

    const NavLink = ({ page, icon, children }) => (
        <button
            onClick={() => navigateTo(page)}
            className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 rounded-lg ${
                activeDashboardPage === page
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:bg-green-700 hover:text-white'
            }`}
        >
            {React.cloneElement(icon, { className: 'w-6 h-6 mr-4' })}
            {isSidebarOpen && <span className="truncate">{children}</span>}
        </button>
    );

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside className={`bg-green-800 text-gray-200 ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out flex flex-col shadow-lg`}>
                <div className="flex items-center justify-between p-4 border-b border-green-700">
                    {isSidebarOpen && <h2 className="text-xl font-bold text-white">GSTC Self Assistant</h2>}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded-full text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-white">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {isAdmin ? (
                        <NavLink page="adminDashboard" icon={<Settings />}>Dashboard Admin</NavLink>
                    ) : (
                        <>
                            <NavLink page="beranda" icon={<Home />}>Beranda</NavLink>
                            <NavLink page="profil-usaha" icon={<Building />}>Profil Usaha</NavLink>
                            <div>
                                <button onClick={() => setIsComplianceMenuOpen(!isComplianceMenuOpen)} className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-300 transition-colors duration-200 rounded-lg hover:bg-green-700 hover:text-white">
                                    <div className="flex items-center">
                                        <Award className="w-6 h-6 mr-4" />
                                        {isSidebarOpen && <span className="truncate">Standar Kepatuhan</span>}
                                    </div>
                                    {isSidebarOpen && (isComplianceMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                                </button>
                                <AnimatePresence>
                                    {isComplianceMenuOpen && isSidebarOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pl-8 pt-2 space-y-1">
                                                <NavLink page="subSectionSelection" icon={<BookOpen />}>Seksi A</NavLink>
                                                <NavLink page="standardCompliance" icon={<BookOpen />}>Seksi B</NavLink>
                                                <NavLink page="sertifikasi" icon={<BookOpen />}>Seksi C</NavLink>
                                                <NavLink page="pembelajaran" icon={<BookOpen />}>Seksi D</NavLink>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    )}
                </nav>
                <div className="p-4 border-t border-green-700">
                    <button onClick={onLogout} className="flex items-center w-full px-4 py-3 text-left text-red-400 transition-colors duration-200 rounded-lg hover:bg-green-700 hover:text-red-300">
                        <LogOut className="w-6 h-6 mr-4" />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
                    <h1 className="text-2xl font-semibold text-gray-800">{getPageTitle()}</h1>
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigateTo('notifikasi')} className="relative text-gray-600 hover:text-gray-800">
                            <Bell size={24} />
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                        </button>
                        <div className="relative">
                            <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2">
                                <span className="font-medium text-gray-700">{user?.displayName || destinationName}</span>
                                <User size={24} className="text-gray-600" />
                            </button>
                            <AnimatePresence>
                            {isUserMenuOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20"
                                >
                                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                        <p className="font-semibold">Signed in as</p>
                                        <p className="truncate">{user?.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <button onClick={() => { navigateTo('tentang'); setIsUserMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tentang</button>
                                        <button onClick={() => { navigateTo('akun'); setIsUserMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Akun</button>
                                        <button onClick={() => { navigateTo('faq'); setIsUserMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">FAQ</button>
                                    </div>
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-gray-100">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeDashboardPage}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};