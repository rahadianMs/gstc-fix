"use client";

import { BookOpenIcon, DashboardIcon, HandshakeIcon, IncentiveIcon } from './Icons.jsx';

// Komponen untuk Halaman Tentang
export default function AboutPage() {
    const features = [
        { 
            icon: <DashboardIcon />, 
            title: "Dasbor Kepatuhan GSTC", 
            description: "Pantau progres pemenuhan standar pariwisata berkelanjutan Anda secara visual. Dasbor ini memberikan gambaran jelas tentang kinerja Anda di setiap pilar GSTC, membantu Anda mengidentifikasi area yang memerlukan perhatian lebih." 
        },
        { 
            icon: <BookOpenIcon />, 
            title: "Alur Kerja Asesmen Terpandu", 
            description: "Platform ini memandu Anda melalui setiap kriteria dan indikator GSTC. Unggah bukti kepatuhan dengan mudah dan lacak statusnya, mulai dari draf hingga disetujui oleh konsultan." 
        },
        { 
            icon: <HandshakeIcon />, 
            title: "Kolaborasi dengan Konsultan Ahli", 
            description: "Gunakan fitur diskusi terintegrasi pada setiap kriteria untuk berkomunikasi langsung dengan konsultan. Dapatkan umpan balik, klarifikasi, dan bimbingan untuk memastikan kepatuhan yang akurat." 
        },
        { 
            icon: <IncentiveIcon />, 
            title: "Self-Assessment & Rencana Aksi", 
            description: "Lakukan evaluasi mandiri untuk mengukur kesiapan Anda dan gunakan fitur Action Plan untuk membuat serta mengelola tugas-tugas perbaikan yang diperlukan untuk mencapai standar kepatuhan." 
        },
    ];
    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md border">
            <h2 className="text-3xl font-bold mb-2 text-slate-800">Tentang Platform Asesmen Mandiri GSTC</h2>
            <p className="text-slate-600 mb-8">Alat bantu kolaboratif untuk memandu destinasi pariwisata menuju standar keberlanjutan global.</p>
            <div className="space-y-6">
                {features.map(feature => (
                    <div key={feature.title} className="flex gap-6 items-start">
                        <div className="flex-shrink-0 text-white rounded-lg p-3" style={{backgroundColor: '#1c3d52'}}>{feature.icon}</div>
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