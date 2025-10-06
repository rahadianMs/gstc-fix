"use client";

import { BookOpenIcon, DashboardIcon, HandshakeIcon, IncentiveIcon } from './Icons.jsx';

// Komponen untuk Halaman Tentang
export default function AboutPage() {
    const features = [
        { icon: <DashboardIcon />, title: "Dashboard Pemantauan Emisi", description: "Fitur utama platform ini adalah dasbor interaktif yang memungkinkan Anda menghitung dan melacak jejak karbon dari berbagai sumber emisi seperti penggunaan listrik, transportasi, dan pengelolaan limbah secara akurat." },
        { icon: <BookOpenIcon />, title: "Pusat Edukasi Terpadu", description: "Tingkatkan pemahaman Anda tentang praktik pariwisata berkelanjutan. Kami menyediakan akses ke berbagai materi pembelajaran, studi kasus, dan panduan praktik terbaik untuk menerapkan operasional rendah emisi." },
        { icon: <HandshakeIcon />, title: "Kolaborasi Vendor Berkelanjutan", description: "Temukan dan jalin kemitraan dengan penyedia solusi, produk, dan layanan ramah lingkungan yang telah terverifikasi untuk mendukung transisi hijau bisnis Anda." },
        { icon: <IncentiveIcon />, title: "Insentif dan Pengakuan", description: "Dengan berpartisipasi aktif, bisnis Anda berkesempatan mendapatkan pengakuan resmi, akses ke pasar pariwisata hijau, serta dukungan kebijakan sebagai pionir dalam pariwisata berkelanjutan di Indonesia." },
    ];
    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md border">
            <h2 className="text-3xl font-bold mb-2 text-slate-800">Tentang Wonderful Indonesia Net Zero Hub</h2>
            <p className="text-slate-600 mb-8">Platform ini adalah pusat kendali Anda untuk transformasi pariwisata berkelanjutan.</p>
            <div className="space-y-6">
                {features.map(feature => (
                    <div key={feature.title} className="flex gap-6 items-start">
                        <div className="flex-shrink-0 text-white rounded-lg p-3" style={{backgroundColor: '#22543d'}}>{feature.icon}</div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-700">{feature.title}</h4>
                            <p className="text-slate-500">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};