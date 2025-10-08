"use client";

import { useState, useEffect } from 'react';
import { BookOpenIcon, DashboardIcon, HandshakeIcon, ClipboardCheckIcon, ChatBubbleIcon, InstagramIcon, LinkedinIcon, FacebookIcon } from './Icons.jsx';

export default function LandingPage({ setActivePage, setIsLogin }) {
    const [isScrolled, setIsScrolled] = useState(false);

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
        brand: '#1c3d52',
        brandHover: '#31424b',
        accent: '#e8c458',
        accentHover: '#d4b350'
    };

    const featureCards = [
        { icon: <DashboardIcon />, title: "Dashboard Pemenuhan GSTC", description: "Menampilkan tingkat pemenuhan berdasarkan hasil asesmen dan progres tindak lanjut secara visual dan terukur." },
        { icon: <BookOpenIcon />, title: "Self-Assessment Tools", description: "Alat untuk menilai tingkat kepatuhan terhadap kriteria GSTC secara mandiri sebelum pendampingan dimulai." },
        { icon: <HandshakeIcon />, title: "Review Compliance", description: "Ruang diskusi dan validasi antara klien dan konsultan untuk meninjau pemenuhan setiap kriteria GSTC beserta bukti dukungnya." },
        { icon: <ClipboardCheckIcon />, title: "Action Plan", description: "Fitur manajemen proyek yang membantu merencanakan dan memantau aksi keberlanjutan yang perlu dilakukan untuk memenuhi standar GSTC." },
        { icon: <ChatBubbleIcon className="w-8 h-8"/>, title: "Consultation Session", description: "Fitur penjadwalan sesi konsultasi langsung dengan konsultan untuk membahas temuan, progres, dan strategi peningkatan praktik keberlanjutan." },
    ];

     const scopeCards = [
        { title: "Akomodasi", imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmFsaSUyMGhvdGVsfGVufDB8fDB8fHww" },
        { title: "Operator Jasa Perjalanan", imageUrl: "https://images.unsplash.com/photo-1616895727759-dd84a2690433?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
        { title: "Pengelola Destinasi Wisata", imageUrl: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }
    ];

    return (
        <>
            <style jsx global>{`
                html {
                  scroll-behavior: smooth;
                }
                .logo-white {
                    filter: brightness(0) invert(1) grayscale(1);
                }
            `}</style>
            <div id="landing-page" className="bg-white text-zinc-800">
                <header className={`fixed top-0 left-0 z-50 w-full px-4 sm:px-8 py-4 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-sm shadow-md' : 'bg-transparent'}`}>
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img 
                                src={logoWiseSteps} 
                                alt="Wise Steps Consulting Logo" 
                                className={`h-8 md:h-9 transition-all duration-300 ${!isScrolled && 'logo-white'}`} 
                            />
                        </div>
                        <nav className="hidden md:flex items-center gap-6">
                            <a href="#home" className={`font-medium transition-colors duration-200 ${isScrolled ? `text-zinc-600 hover:text-[${colors.brand}]` : 'text-white hover:opacity-80'}`}>Home</a>
                            <a href="#about" className={`font-medium transition-colors duration-200 ${isScrolled ? `text-zinc-600 hover:text-[${colors.brand}]` : 'text-white hover:opacity-80'}`}>Tentang</a>
                            <a href="#features" className={`font-medium transition-colors duration-200 ${isScrolled ? `text-zinc-600 hover:text-[${colors.brand}]` : 'text-white hover:opacity-80'}`}>Fitur</a>
                            <button onClick={() => handleGoToAuth(true)} className={`px-5 py-2 font-semibold border-2 rounded-lg transition-all duration-300 ${isScrolled ? `text-[${colors.brand}] border-[${colors.brand}] hover:bg-zinc-100` : 'text-white border-white hover:bg-white/10'}`}>
                                Login
                            </button>
                        </nav>
                         <div className="md:hidden">
                            <button onClick={() => handleGoToAuth(true)} style={{backgroundColor: colors.accent, color: 'white'}} className="px-4 py-2 font-semibold rounded-lg">Login</button>
                        </div>
                    </div>
                </header>

                <main id="home" className="relative flex items-center min-h-screen px-4 sm:px-8 py-24 text-white bg-cover bg-center" style={{ backgroundImage: "url('https://indonesia.travel/contentassets/ad62b2d07c3b463694923e90a9701331/borobudur_2.jpg')" }}>
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="relative z-10 container mx-auto max-w-3xl text-left">
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">Sustainability Portal: Your Gateway to GSTC Certification</h1>
                        <p className="mb-8 text-lg md:text-xl opacity-95 max-w-2xl">Platform digital untuk asistensi, pemantauan, dan percepatan sertifikasi pariwisata berkelanjutan.</p>
                        <button onClick={() => handleGoToAuth(false)} style={{ backgroundColor: colors.accent }} className={`px-8 py-4 text-lg font-semibold text-white rounded-lg shadow-xl hover:bg-[${colors.accentHover}] transform hover:-translate-y-1 transition-all duration-300`}>
                            Mulai Assessment
                        </button>
                    </div>
                </main>

                <section id="about" className="py-20 md:py-28 px-4 sm:px-8">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                             <h2 className="text-4xl md:text-5xl font-bold text-zinc-800">Tentang Platform Ini</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <div>
                                <img src="https://images.unsplash.com/photo-1517480448885-d5c53555ba8c?q=80&w=899&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Sustainable Destination" className="rounded-2xl shadow-lg w-full object-cover aspect-[4/3]" />
                            </div>
                            <div className="space-y-6 text-zinc-600 leading-relaxed text-justify">
                                <p>Sustainability Portal adalah platform digital yang dikembangkan oleh Wise Steps Consulting untuk membantu pelaku pariwisata dan konsultan menjalankan proses sertifikasi berdasarkan standar Global Sustainable Tourism Council (GSTC) secara lebih mudah, terstruktur, dan transparan.</p>
                                <p>Melalui portal ini, pengguna dapat melakukan self-assessment, menyusun rencana aksi perbaikan, mengelola dokumen pendukung, serta memantau progres pemenuhan kriteria GSTC bersama konsultan pendamping.</p>
                                <p>Platform ini dibuat untuk menjawab kebutuhan akan sistem asistensi dan dokumentasi terintegrasi, sehingga proses menuju sertifikasi GSTC menjadi lebih efisien dan dapat diakses kapan saja.</p>
                            </div>
                        </div>
                        
                        <div className="mt-24 grid md:grid-cols-5 gap-12 lg:gap-16 items-center p-8 bg-zinc-50 rounded-2xl border">
                            <div className="md:col-span-2 flex justify-center">
                                <img src={logoGstc} alt="GSTC Logo" className="h-40"/>
                            </div>
                            <div className="md:col-span-3 space-y-8">
                                <div className="space-y-3">
                                    <h3 className={`text-2xl font-bold text-zinc-800`}>Apa itu Standar GSTC?</h3>
                                    <p className={`text-zinc-600 leading-relaxed text-justify`}>Standar Global Sustainable Tourism Council (GSTC) adalah standar global untuk pariwisata berkelanjutan. Standar ini disusun dalam empat pilar utama: (A) Pengelolaan Berkelanjutan, (B) Keberlanjutan Sosial-Ekonomi, (C) Keberlanjutan Budaya, dan (D) Keberlanjutan Lingkungan.</p>
                                </div>
                                <div className="space-y-3">
                                    <h3 className={`text-2xl font-bold text-zinc-800`}>Apa itu Sertifikasi GSTC?</h3>
                                    <p className={`text-zinc-600 leading-relaxed text-justify`}>Sertifikasi GSTC merupakan pengakuan tertinggi terhadap tingkat kepatuhan praktik keberlanjutan sebuah organisasi berdasarkan standar global yang kredibel. Sertifikasi ini hanya diberikan oleh lembaga sertifikasi yang diakreditasi atau diakui oleh GSTC, sehingga menjamin integritas, objektivitas, dan kepercayaan internasional terhadap hasil sertifikasi tersebut. Melalui sertifikasi GSTC, organisasi menunjukkan komitmen nyata terhadap pariwisata berkelanjutan dan memperoleh reputasi yang diakui secara global.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-24 bg-cover bg-center rounded-2xl p-10 md:p-16" style={{backgroundImage: "url('https://images.unsplash.com/photo-1528642474498-1af0c17fd8c3?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"}}>
                            <div className="max-w-3xl mx-auto text-center bg-white/80 backdrop-blur-sm p-8 rounded-xl">
                                <h3 className={`text-3xl font-bold text-zinc-800 mb-6`}>Mengapa Platform Ini Dibuat?</h3>
                                <div className={`space-y-4 text-zinc-700 leading-relaxed text-lg`}>
                                  <p>Proses menuju sertifikasi GSTC membutuhkan kolaborasi erat antara klien dan konsultan — mulai dari asesmen awal hingga verifikasi dokumen dan tindakan perbaikan. Sustainability Portal hadir untuk mempermudah komunikasi dan koordinasi antara kedua pihak tersebut dalam satu ruang kerja digital.</p>
                                  <p>Dengan sistem ini, seluruh kegiatan seperti peninjauan hasil asesmen, diskusi kepatuhan, serta penjadwalan sesi konsultasi dapat dilakukan secara terstruktur dan terdokumentasi dengan baik. Hasilnya, proses asistensi sertifikasi menjadi lebih efisien, transparan, dan mudah dipantau oleh klien maupun konsultan.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-24">
                             <h3 className={`text-3xl font-bold text-zinc-800 mb-12 text-center`}>Untuk Siapa Platform Ini?</h3>
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

                <section id="features" className="py-20 md:py-28 px-4 sm:px-8 bg-zinc-50">
                    <div className="container mx-auto max-w-7xl text-center">
                        <span className="font-semibold" style={{color: colors.brand}}>Fitur Utama</span>
                        <h2 className={`text-4xl font-bold text-zinc-800 mt-2 mb-16`}>Semua yang Anda Butuhkan untuk Keberlanjutan</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featureCards.map(card => (
                                <div key={card.title} className="bg-white p-8 rounded-xl shadow-sm text-left border hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                                    <div style={{color: colors.brand}} className="mb-4">{card.icon}</div>
                                    <h3 className={`text-xl font-bold mb-2 text-zinc-800`}>{card.title}</h3>
                                    <p className={`text-zinc-600 leading-relaxed`}>{card.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <footer style={{backgroundColor: '#1c2120'}} className="text-white/70 py-16 px-4 sm:px-8">
                    <div className="container mx-auto max-w-6xl">
                         <div className="grid md:grid-cols-12 gap-12">
                            <div className="md:col-span-4">
                                <img src={logoWiseSteps} alt="Wise Steps Consulting Logo" className="h-10 logo-white mb-4"/>
                                <p className="text-sm">Wise Steps Consulting</p>
                            </div>
                            <div className="md:col-span-4">
                                <h4 className="text-white font-semibold mb-4 text-base">Kontak</h4>
                                <p className="text-sm leading-relaxed">Jl. Gitar No.33, Turangga, Kec. Lengkong, Kota Bandung, Jawa Barat 40264</p>
                                <p className="text-sm mt-4">Telp: +62 812-3632-1361</p>
                                <p className="text-sm mt-2">Email: consulting@wisesteps.id</p>
                            </div>
                             <div className="md:col-span-4">
                                <h4 className="text-white font-semibold mb-4 text-base">Official Training Partner of:</h4>
                                <img src={logoGstc} alt="GSTC Logo" className="h-12 logo-white mb-6"/>
                                <div className="flex items-center gap-5">
                                    <a href="https://www.instagram.com/wisestepsconsulting/?hl=id" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><InstagramIcon className="w-6 h-6" /></a>
                                    <a href="https://www.linkedin.com/company/wise-steps-consulting" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><LinkedinIcon className="w-6 h-6" /></a>
                                    <a href="https://web.facebook.com/wisestepsconsulting?_rdc=1&_rdr#" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><FacebookIcon className="w-6 h-6" /></a>
                                </div>
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