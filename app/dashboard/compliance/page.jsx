"use client";

import Link from 'next/link';

// Daftar pilar
const pillars = [
    { id: 'a', letter: 'A', title: 'BAGIAN A', subtitle: 'Pengelolaan Berkelanjutan' },
    { id: 'b', letter: 'B', title: 'BAGIAN B', subtitle: 'Keberlanjutan Sosial-Ekonomi' },
    { id: 'c', letter: 'C', title: 'BAGIAN C', subtitle: 'Keberlanjutan Budaya' },
    { id: 'd', letter: 'D', title: 'BAGIAN D', subtitle: 'Keberlanjutan Lingkungan' }
];

const PillarCard = ({ id, letter, title, subtitle }) => (
    <Link 
        href={`/dashboard/compliance/${id}`} // <-- Ini kuncinya! Pindah URL ke /a, /b, dst.
        className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
    >
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-[#3f545f]">
            <span className="text-4xl font-bold text-slate-500 group-hover:text-white">{letter}</span>
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-800 text-center">{title}</h3>
        <p className="text-sm text-slate-500 text-center">{subtitle}</p>
    </Link>
);

export default function ComplianceMenuPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-800">GSTC Standard Compliance</h1>
                <p className="mt-2 text-lg text-slate-600">Pilih pilar untuk melihat detail indikator dan mengunggah bukti kepatuhan.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {pillars.map(pillar => (
                    <PillarCard key={pillar.id} {...pillar} />
                ))}
            </div>
        </div>
    );
}