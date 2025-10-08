"use client";

import { useState, useEffect } from 'react';
import { BookOpenIcon, DashboardIcon, HandshakeIcon, IncentiveIcon } from './Icons.jsx';

export default function LandingPage({ setActivePage, setIsLogin }) {
    const [isScrolled, setIsScrolled] = useState(false);

    // URL Logo berwarna untuk Header dan Footer
    const logoWiseSteps = "https://cdn-biofo.nitrocdn.com/pguRNgUGRHgHBjvClHTnuzLuMOCPhzJi/assets/images/optimized/rev-a721222/wisestepsconsulting.id/wp-content/uploads/2023/03/WSG_Masterfiles_Logo-02.png";
    const logoGstc = "https://www.gstc.org/wp-content/uploads/GSTC-logo.png";
    
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleGoToAuth = (showLogin) => {
        setIsLogin(showLogin);
        setActivePage('auth');
    };

    const colors = {
        primary: 'zinc-800',
        secondary: 'zinc-600',
        brand: '#3f545f',
        brandHover: '#31424b',
        accent: '#c89c49',
        accentHover: '#b38b40'
    };

    const featureCards = [
        { icon: <DashboardIcon />, title: "Dasboard Standar Kepatuhan GSTC", description: "Penuhi standar pariwisata berkelanjutan global melalui panduan langkah demi langkah." },
        { icon: <BookOpenIcon />, title: "Self-Assessment Tool", description: "Evaluasi kinerja keberlanjutan destinasi Anda secara mandiri untuk mengidentifikasi area perbaikan." },
        { icon: <HandshakeIcon />, title: "Kolaborasi dengan Konsultan", description: "Dapatkan feedback dan validasi dari konsultan ahli melalui fitur diskusi terintegrasi." },
        { icon: <IncentiveIcon />, title: "Pengakuan & Sertifikasi", description: "Tingkatkan kredibilitas destinasi Anda dengan menunjukkan komitmen terhadap praktik berkelanjutan." },
    ];

    const participantLogos = [
        { name: "InJourney", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Logo_InJourney.svg/2560px-Logo_InJourney.svg.png", heightClass: "h-14" },
        { name: "Traveloka", url: "https://ik.imagekit.io/tvlk/image/imageResource/2024/08/09/1723192761223-35bd6fefad235fbb690b6d79b050343f.png?tr=q-75", heightClass: "h-24" },
        { name: "Exo Travel", url: "https://www.exotravel.com/images/w3_images/logo222.png", heightClass: "h-16" },
        { name: "Tiket.com", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Tiket.com_logo.png/1200px-Tiket.com_logo.png", heightClass: "h-12" },
        { name: "Ekosistem Hotels", url: "https://ekosistemhotels.com/wp-content/themes/ekosistem1.1/images/Logo-Ekosistem.png", heightClass: "h-20" },
    ];

     const scopeCards = [
        { title: "Akomodasi", imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmFsaSUyMGhvdGVsfGVufDB8fDB8fHww" },
        { title: "Operator Jasa Perjalanan", imageUrl: "https://images.unsplash.com/photo-1616895727759-dd84a2690433?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
        { title: "Pengelola Atraksi Wisata", imageUrl: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }
    ];

    return (
        <>
            <style jsx global>{`
                html {
                  scroll-behavior: smooth;
                }
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                .logo-white {
                    filter: brightness(0) invert(1) grayscale(1);
                }
            `}</style>
            <div id="landing-page" className={`bg-white text-${colors.primary}`}>
                <header className={`fixed top-0 left-0 z-50 w-full px-[5%] py-4 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img 
                                src={logoWiseSteps} 
                                alt="Wise Steps Consulting Logo" 
                                className={`h-8 md:h-9 transition-all duration-300 ${!isScrolled && 'logo-white'}`} 
                            />
                            <img 
                                src={logoGstc} 
                                alt="GSTC Logo" 
                                className={`h-9 md:h-10 transition-all duration-300 ${!isScrolled && 'logo-white'}`} 
                            />
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#home" className={`font-medium transition-colors duration-200 ${isScrolled ? `text-${colors.secondary} hover:text-[${colors.brand}]` : 'text-white hover:opacity-80'}`}>Home</a>
                            <a href="#about" className={`font-medium transition-colors duration-200 ${isScrolled ? `text-${colors.secondary} hover:text-[${colors.brand}]` : 'text-white hover:opacity-80'}`}>Tentang</a>
                            <a href="#features" className={`font-medium transition-colors duration-200 ${isScrolled ? `text-${colors.secondary} hover:text-[${colors.brand}]` : 'text-white hover:opacity-80'}`}>Fitur</a>
                            <button onClick={() => handleGoToAuth(true)} className={`px-5 py-2 font-semibold border-2 rounded-lg transition-all duration-300 ${isScrolled ? `text-[${colors.brand}] border-[${colors.brand}] hover:bg-gray-100` : 'text-white border-white hover:bg-white/10'}`}>
                                Login
                            </button>
                        </nav>
                    </div>
                </header>

                <main id="home" className="relative flex items-center min-h-screen px-[5%] py-24 text-white bg-cover bg-center" style={{ backgroundImage: "url('https://indonesia.travel/contentassets/ad62b2d07c3b463694923e90a9701331/borobudur_2.jpg')" }}>
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="relative z-10 max-w-2xl text-left">
                        <p className="mb-4 text-lg md:text-xl opacity-95">GSTC Self-Assessment Tool for Destinations</p>
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-8 drop-shadow-lg">Mewujudkan Destinasi Pariwisata Berkelanjutan di Indonesia</h1>
                        <button onClick={() => handleGoToAuth(false)} style={{ backgroundColor: colors.accent }} className={`px-8 py-4 text-lg font-semibold text-white rounded-lg shadow-xl hover:bg-[${colors.accentHover}] transform hover:-translate-y-1 transition-all duration-300`}>
                            Mulai Assessment
                        </button>
                    </div>
                </main>

                <section id="about" className="py-24 px-[5%]">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                             <h2 className={`text-4xl md:text-5xl font-bold text-${colors.primary}`}>Tentang Platform Asesmen Mandiri GSTC</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <div>
                                {/* --- PERUBAHAN 2: GAMBAR DIPERBARUI --- */}
                                <img src="https://images.unsplash.com/photo-1517480448885-d5c53555ba8c?q=80&w=899&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Sustainable Destination" className="rounded-2xl shadow-lg w-full object-cover aspect-[4/3]" />
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h3 className={`text-2xl font-bold text-${colors.primary} mb-3`}>Apa itu Kriteria GSTC?</h3>
                                    <p className={`text-${colors.secondary} leading-relaxed text-justify`}>Kriteria Global Sustainable Tourism Council (GSTC) adalah standar global untuk pariwisata berkelanjutan. Kriteria ini disusun dalam empat pilar utama: (A) Pengelolaan Berkelanjutan, (B) Keberlanjutan Sosial-Ekonomi, (C) Keberlanjutan Budaya, dan (D) Keberlanjutan Lingkungan.</p>
                                </div>
                                <div>
                                    <h3 className={`text-2xl font-bold text-${colors.primary} mb-3`}>Mengapa Platform Ini Dibuat?</h3>
                                    <p className={`text-${colors.secondary} leading-relaxed text-justify`}>Platform ini dirancang sebagai alat bantu bagi pengelola destinasi di Indonesia untuk melakukan asesmen mandiri terhadap kriteria GSTC. Tujuannya adalah untuk mempermudah identifikasi kekuatan dan area yang memerlukan perbaikan, serta mempersiapkan destinasi menuju proses sertifikasi pariwisata berkelanjutan yang diakui secara internasional.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-24">
                             <h3 className={`text-3xl font-bold text-${colors.primary} mb-12 text-center`}>Untuk Siapa Platform Ini?</h3>
                             <div className="grid md:grid-cols-3 gap-8">
                                {scopeCards.map(card => (
                                    <div key={card.title} className="relative rounded-xl overflow-hidden shadow-lg h-80 group">
                                        <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 p-6">
                                            <h4 className="text-2xl font-bold text-white">{card.title}</h4>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="py-24 px-[5%] bg-zinc-50">
                    <div className="container mx-auto max-w-6xl text-center">
                        <span className="font-semibold" style={{color: colors.brand}}>Fitur Utama</span>
                        <h2 className={`text-4xl font-bold text-${colors.primary} mt-2 mb-16`}>Semua yang Anda Butuhkan untuk Keberlanjutan</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featureCards.map(card => (
                                <div key={card.title} className="bg-white p-8 rounded-xl shadow-sm text-left border hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                                    <div style={{color: colors.brand}} className="mb-4">{card.icon}</div>
                                    <h3 className={`text-xl font-bold mb-2 text-${colors.primary}`}>{card.title}</h3>
                                    <p className={`text-${colors.secondary} leading-relaxed`}>{card.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
                <section id="participant-list-section" className="relative py-24 bg-center bg-cover" style={{ backgroundImage: "url('https://myoona.id/content/dam/oona/aem-images/blog/liburan-labuan-bajo-risiko-perjalanan-domestik-banner.webp')" }}>
                    <div className="absolute inset-0 bg-black opacity-70"></div>
                    <div className="relative z-10 container mx-auto text-center">
                        <h2 className="text-4xl font-bold text-white mb-4">Our Client</h2>
                        <p className="text-white/80 max-w-2xl mx-auto mb-16">Bergabunglah dengan jaringan bisnis dan inisiatif pariwisata yang telah berkomitmen pada keberlanjutan.</p>
                        <div className="relative w-full overflow-hidden">
                            <div className="flex animate-marquee">
                                {[...participantLogos, ...participantLogos].map((logo, index) => (
                                    <div key={index} className="flex-shrink-0 w-64 flex justify-center items-center mx-4"> 
                                        <img src={logo.url} alt={logo.name} className={`${logo.heightClass} object-contain filter grayscale brightness-0 invert hover:grayscale-0 hover:brightness-100 hover:invert-0 transition-all duration-300`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="glasgow-portal" className="py-20 px-[5%] bg-zinc-100">
                    <div className="container mx-auto max-w-4xl bg-white p-10 rounded-2xl shadow-lg border flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        <div className="flex-shrink-0">
                            <img src="https://www.gstc.org/wp-content/uploads/GSTC-logo.png" alt="GSTC Logo" className="h-24" />
                        </div>
                        <div>
                            <h3 className={`text-2xl font-bold text-${colors.primary}`}>Standar Global untuk Pariwisata Berkelanjutan</h3>
                            <p className={`text-${colors.secondary} mt-2 mb-4`}>Platform ini didasarkan pada Kriteria Destinasi GSTC yang diakui secara internasional. Pelajari lebih lanjut tentang standar global ini.</p>
                            <a href="https://www.gstc.org" target="_blank" rel="noopener noreferrer" style={{backgroundColor: colors.brand}} className={`inline-block font-semibold text-white rounded-lg px-6 py-3 hover:bg-[${colors.brandHover}] transition-colors`}>
                                Kunjungi Website GSTC
                            </a>
                        </div>
                    </div>
                </section>

                <footer style={{backgroundColor: colors.brand}} className="text-white/80 py-16 px-[5%]">
                    <div className="container mx-auto max-w-6xl">
                         <div className="flex flex-col md:flex-row justify-between">
                            <div className="mb-8 md:mb-0">
                                <div className="flex items-center gap-4 mb-4">
                                     <img src={logoWiseSteps} alt="Wise Steps Consulting Logo" className="h-10 logo-white"/>
                                     <img src={logoGstc} alt="GSTC Logo" className="h-12 logo-white"/>
                                </div>
                                <h3 className="text-white text-xl font-semibold mb-2">GSTC Self-Assessment Tool</h3>
                                <p className="text-sm max-w-sm">Dikelola oleh Wise Steps Consulting sebagai mitra pelatihan resmi GSTC di Indonesia.</p>
                            </div>
                            <div className="text-sm">
                                <h4 className="text-white font-semibold mb-4 text-base">Kontak</h4>
                                <p>Email: info@wisesteps.id</p>
                                <p className="mt-2">Website: www.wisestepsconsulting.id</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/20 mt-12 pt-8 text-center text-sm text-white/60">
                        <p>Copyright ©2025 Wise Steps Consulting - Konsultan Pariwisata Indonesia. All Rights Reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}