"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// Pastikan path Icons ini sesuai dengan lokasi file Icons.jsx Anda
import { 
    HomeIcon, ClipboardCheckIcon, AcademicCapIcon, 
    QuestionMarkCircleIcon, ShieldCheckIcon, ChevronDownIcon, 
    DocumentChartBarIcon, PencilIcon, VideoCameraIcon 
} from './Icons'; 

export default function Sidebar({ userRole, onLogout }) {
    const pathname = usePathname(); // Ini mendeteksi kita sedang di halaman mana
    const [isComplianceOpen, setIsComplianceOpen] = useState(true);

    const logoWiseSteps = "https://github.com/rahadianMs/gstc-fix/blob/main/asset/WSG_Masterfiles_Logo-02-1024x264.png?raw=true";

    // --- MENU UNTUK KONSULTAN ---
    const consultantLinks = [
        { href: '/dashboard/consultant', label: 'Home', icon: <HomeIcon /> }, // Mengarah ke dashboard khusus konsultan
        { href: '/dashboard/consultant/review', label: 'Review Compliance', icon: <DocumentChartBarIcon /> },
        { href: '/dashboard/action-plan', label: 'Action Plan', icon: <ClipboardCheckIcon /> },
        { href: '/dashboard/bookings', label: 'Consultation Session', icon: <VideoCameraIcon /> },
        { href: '/dashboard/resources', label: 'Resource', icon: <AcademicCapIcon /> },
        { href: '/dashboard/guide', label: 'Guide', icon: <QuestionMarkCircleIcon /> },
    ];

    // --- MENU UNTUK USER (Akomodasi/Hotel/Tour) ---
    const destinationLinks = [
        { href: '/dashboard', label: 'Home', icon: <HomeIcon /> },
        { 
            label: 'Standard Compliance', 
            icon: <ShieldCheckIcon />,
            isDropdown: true,
            children: [
                // Nanti kita buat halaman ini di langkah selanjutnya
                { href: '/dashboard/compliance/a', label: 'PILAR A' },
                { href: '/dashboard/compliance/b', label: 'PILAR B' },
                { href: '/dashboard/compliance/c', label: 'PILAR C' },
                { href: '/dashboard/compliance/d', label: 'PILAR D' },
            ]
        },
        { href: '/dashboard/action-plan', label: 'Action Plan', icon: <ClipboardCheckIcon /> },
        { href: '/dashboard/bookings', label: 'Consultation Session', icon: <VideoCameraIcon /> },
        { href: '/dashboard/assessment', label: 'Self-Assessment', icon: <PencilIcon className="w-5 h-5" /> },
        { href: '/dashboard/resources', label: 'Resource', icon: <AcademicCapIcon /> },
        { href: '/dashboard/guide', label: 'Guide', icon: <QuestionMarkCircleIcon /> },
    ];

    const links = userRole === 'consultant' ? consultantLinks : destinationLinks;

    // Fungsi untuk mengecek apakah link sedang aktif (memberi warna kuning)
    const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

    return (
        <aside className="fixed top-0 left-0 z-40 flex flex-col h-screen p-6 w-72 text-white bg-[#1c2120]">
            {/* Logo */}
            <div className="pb-6 mb-4 border-b border-white/20 flex items-center gap-3">
                <img src={logoWiseSteps} alt="Logo" className="h-8 logo-white filter brightness-0 invert grayscale" />
                <div>
                    <h1 className="text-sm font-bold leading-tight">Certification</h1>
                    <h1 className="text-sm font-bold leading-tight">Assistance</h1>
                </div>
            </div>

            {/* Menu Navigasi */}
            <nav className="flex flex-col flex-grow gap-1 overflow-y-auto">
                {links.map((link, index) => {
                    if (link.isDropdown) {
                        const isChildActive = link.children.some(child => isActive(child.href));
                        return (
                            <div key={index}>
                                <button 
                                    onClick={() => setIsComplianceOpen(!isComplianceOpen)} 
                                    className={`w-full flex items-center justify-between gap-4 p-3 rounded-lg text-sm font-medium transition-colors ${isChildActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <div className="flex items-center gap-4" style={isChildActive ? {color: '#e8c458'} : {}}>
                                        {link.icon}<span>{link.label}</span>
                                    </div>
                                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isComplianceOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {isComplianceOpen && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }} 
                                            animate={{ height: 'auto', opacity: 1 }} 
                                            exit={{ height: 0, opacity: 0 }} 
                                            className="overflow-hidden pl-8 mt-1 space-y-1"
                                        >
                                            {link.children.map(child => (
                                                <Link 
                                                    key={child.href} 
                                                    href={child.href} 
                                                    className={`block py-2 px-3 rounded-md text-sm transition-colors ${isActive(child.href) ? 'text-[#e8c458] font-bold bg-white/5' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    }

                    const active = isActive(link.href);
                    return (
                        <Link 
                            key={link.href} 
                            href={link.href} 
                            className={`flex items-center gap-4 p-3 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                        >
                            <div className="flex items-center gap-4" style={active ? {color: '#e8c458'} : {}}>
                                {link.icon}<span>{link.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Tombol Logout */}
            <div className="mt-auto pt-4 border-t border-white/20">
                <button onClick={onLogout} className="flex items-center w-full gap-4 p-3 text-sm font-medium text-red-400 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-colors">
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}