"use client";

import { useState, useEffect } from 'react';
import { BookOpenIcon, DashboardIcon, HandshakeIcon, IncentiveIcon } from './Icons.jsx';

export default function LandingPage({ setActivePage, setIsLogin }) {
    const [isScrolled, setIsScrolled] = useState(false);

    // URL Logo
    const logoKemenparPutih = "https://bob.kemenparekraf.go.id/wp-content/uploads/2025/02/Kementerian-Pariwisata-RI_Bahasa-Indonesia-Putih.png";
    const logoKemenparBerwarna = "https://upload.wikimedia.org/wikipedia/commons/f/fc/Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.png";
    const logoWiseSteps = "https://cdn-lgbgj.nitrocdn.com/ItTrnTtgyWTkOHFuOZYyLNqTCVGqVARe/assets/images/optimized/rev-7dc1829/wisesteps.id/wp-content/uploads/revslider/home-desktop-tablet-12/Wise-Steps-Consulting-Logo-White.png";
    const logoWiseStepsBerwarna = "https://cdn-biofo.nitrocdn.com/pguRNgUGRHgHBjvClHTnuzLuMOCPhzJi/assets/images/optimized/rev-a721222/wisestepsconsulting.id/wp-content/uploads/2022/09/WSG_Masterfiles_Logo-02-1024x264.png";

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

    // Palet Warna Profesional Baru
    const colors = {
        primary: 'zinc-800', // Teks utama
        secondary: 'zinc-600', // Teks sekunder
        brand: '#22543d', // Hijau tua profesional
        brandHover: '#1c4532',
        accent: '#c89c49', // Aksen Emas/Ochre
        accentHover: '#b38b40'
    };

    // --- PERUBAHAN JUDUL DI SINI ---
    const featureCards = [
        { icon: <DashboardIcon />, title: "Dashboard Pemantauan Emisi", description: "Hitung dan lacak jejak karbon bisnis Anda secara akurat melalui dasbor interaktif." },
        { icon: <BookOpenIcon />, title: "Pusat Edukasi Terpadu", description: "Akses materi pembelajaran dan panduan praktik rendah emisi untuk pariwisata." },
        { icon: <HandshakeIcon />, title: "Kolaborasi Vendor Berkelanjutan", description: "Temukan dan terhubung dengan penyedia solusi dan produk ramah lingkungan." },
        { icon: <IncentiveIcon />, title: "Insentif Keikutsertaan", description: "Dapatkan pengakuan, akses pasar, dan dukungan kebijakan sebagai pionir pariwisata hijau." },
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
            `}</style>
            <div id="landing-page" className={`bg-white text-${colors.primary}`}>
                <header className={`fixed top-0 left-0 z-50 w-full px-[5%] py-4 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img src={isScrolled ? logoWiseStepsBerwarna : logoWiseSteps} alt="Wise Steps Consulting Logo" className="h-8 md:h-9" />
                            <img src={isScrolled ? logoKemenparBerwarna : logoKemenparPutih} alt="Kemenparekraf Logo" className="h-9 md:h-10" />
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#home" className={`font-medium transition-colors duration-200 ${isScrolled ? `text-${colors.secondary} hover:text-[${colors.brand}]` : 'text-white hover:opacity-80'}`}>Home</a>
                            <a href="#about" className={`font-medium transition-colors duration-200 ${isScrolled ? `text-${colors.secondary} hover:text-[${colors.brand}]` : 'text-white hover:opacity-80'}`}>Tentang</a>
                            <a href="#features" className={`font-medium transition-colors duration-200 ${isScrolled ? `text-${colors.secondary} hover:text-[${colors.brand}]` : 'text-white hover:opacity-80'}`}>Fitur</a>
                            <button onClick={() => handleGoToAuth(true)} className={`px-5 py-2 font-semibold border-2 rounded-lg transition-all duration-300 ${isScrolled ? `text-[${colors.brand}] border-[${colors.brand}] hover:bg-green-50` : 'text-white border-white hover:bg-white/10'}`}>
                                Login
                            </button>
                        </nav>
                    </div>
                </header>

                <main id="home" className="relative flex items-center min-h-screen px-[5%] py-24 text-white bg-cover bg-center" style={{ backgroundImage: "url('https://indonesia.travel/contentassets/ad62b2d07c3b463694923e90a9701331/borobudur_2.jpg')" }}>
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="relative z-10 max-w-2xl text-left">
                        <p className="mb-4 text-lg md:text-xl opacity-95">Selamat datang di “Wonderful Indonesia Net Zero Hub”</p>
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-8 drop-shadow-lg">Menuju Pariwisata Rendah Karbon dan Berkelanjutan</h1>
                        <button onClick={() => handleGoToAuth(false)} style={{ backgroundColor: colors.accent }} className={`px-8 py-4 text-lg font-semibold text-white rounded-lg shadow-xl hover:bg-[${colors.accentHover}] transform hover:-translate-y-1 transition-all duration-300`}>
                            Daftar / Registrasi
                        </button>
                    </div>
                </main>

                <section id="about" className="py-24 px-[5%]">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                             <h2 className={`text-4xl md:text-5xl font-bold text-${colors.primary}`}>Tentang Wonderful Indonesia Net Zero Hub</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <div>
                                <img src="https://www.aman.com/sites/default/files/2021-03/Aman_Amanjiwo_Gallery_1.jpg" alt="Amanjiwo Resort" className="rounded-2xl shadow-lg w-full object-cover aspect-[4/3]" />
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h3 className={`text-2xl font-bold text-${colors.primary} mb-3`}>Pariwisata Indonesia Menuju Net Zero Emissions</h3>
                                    <p className={`text-${colors.secondary} leading-relaxed text-justify`}>Program ini adalah inisiatif Kementerian Pariwisata Indonesia untuk mewujudkan komitmen sektor dalam Glasgow Declaration, yakni menuju Net Zero Emissions di 2060. Melalui program ini, Kementerian Pariwisata Indonesia berkomitmen untuk berkolaborasi bersama pelaku usaha pariwisata dalam mengukur dan mengurangi jejak karbon di sektor pariwisata.</p>
                                </div>
                                <div>
                                    <h3 className={`text-2xl font-bold text-${colors.primary} mb-3`}>Apa itu ‘WINZ Hub’?</h3>
                                    <p className={`text-${colors.secondary} leading-relaxed text-justify`}>Wonderful Indonesia Net Zero Hub (WINZ Hub) adalah sebuah platform nasional yang dikembangkan untuk mendukung transformasi pariwisata Indonesia dalam mengurangi jejak karbon. WINZ Hub berfungsi sebagai pusat data, wadah pengembangan upaya rendah emisi, dan kolaborasi lintas aktor dalam mengukur, melaporkan, serta mengurangi emisi karbon di sektor pariwisata.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-24">
                             <h3 className={`text-3xl font-bold text-${colors.primary} mb-12 text-center`}>Lingkup Usaha</h3>
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
                        <h2 className={`text-4xl font-bold text-${colors.primary} mt-2 mb-16`}>Semua yang Anda Butuhkan untuk Transformasi Hijau</h2>
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
                        <h2 className="text-4xl font-bold text-white mb-4">Didukung dan Diikuti Oleh</h2>
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
                            <img src="https://terraverde-solutions.com/wp-content/uploads/2025/05/GlasgowDeclarationLogo_ok-02.png" alt="Glasgow Declaration Logo" className="h-24" />
                        </div>
                        <div>
                            <h3 className={`text-2xl font-bold text-${colors.primary}`}>Bagian dari Komitmen Global</h3>
                            <p className={`text-${colors.secondary} mt-2 mb-4`}>Program ini merupakan bagian dari komitmen Indonesia dalam 'Deklarasi Glasgow tentang Aksi Iklim di Sektor Pariwisata'. Pelajari lebih lanjut tentang inisiatif global ini.</p>
                            <a href="https://www.glasgowdeclaration.org/" target="_blank" rel="noopener noreferrer" style={{backgroundColor: colors.brand}} className={`inline-block font-semibold text-white rounded-lg px-6 py-3 hover:bg-[${colors.brandHover}] transition-colors`}>
                                Kunjungi Portal Glasgow Declaration
                            </a>
                        </div>
                    </div>
                </section>

                <footer style={{backgroundColor: colors.brand}} className="text-white/80 py-16 px-[5%]">
                    <div className="container mx-auto max-w-6xl">
                         <div className="flex flex-col md:flex-row justify-between">
                            <div className="mb-8 md:mb-0">
                                <img src={logoKemenparBerwarna} alt="Logo Kemenpar" className="h-16 mb-4"/>
                                <h3 className="text-white text-xl font-semibold mb-2">Kementerian Pariwisata Republik Indonesia</h3>
                                <p className="text-sm max-w-sm">Jl. Medan Merdeka Barat No. 17, RT/RW 02/03, Gambir, Daerah Khusus Ibukota Jakarta 10110, Indonesia.</p>
                            </div>
                            <div className="text-sm">
                                <h4 className="text-white font-semibold mb-4 text-base">Kontak</h4>
                                <p>Whatsapp Contact Center: 0811-895-6767</p>
                                <p className="mt-2">Email: info@kemenpar.go.id</p>
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