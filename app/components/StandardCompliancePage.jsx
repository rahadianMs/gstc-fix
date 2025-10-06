"use client";

// Daftar pilar-pilar GSTC
const pillars = [
    { id: 'compliance-a', letter: 'A', title: 'BAGIAN A', subtitle: 'Pengelolaan Berkelanjutan' },
    { id: 'compliance-b', letter: 'B', title: 'BAGIAN B', subtitle: 'Keberlanjutan Sosial-Ekonomi' },
    { id: 'compliance-c', letter: 'C', title: 'BAGIAN C', subtitle: 'Keberlanjutan Budaya' },
    { id: 'compliance-d', letter: 'D', title: 'BAGIAN D', subtitle: 'Keberlanjutan Lingkungan' }
];

// Komponen untuk setiap kartu pilar
const PillarCard = ({ letter, title, subtitle, onClick }) => (
    <button 
        onClick={onClick}
        className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
    >
        <div className="w-24 h-24 bg-slate-100 group-hover:bg-emerald-500 rounded-full flex items-center justify-center transition-colors duration-300">
            <span className="text-4xl font-bold text-slate-500 group-hover:text-white">{letter}</span>
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-800 text-center">{title}</h3>
        <p className="text-sm text-slate-500 text-center">{subtitle}</p>
    </button>
);

// Komponen utama halaman
export default function StandardCompliancePage({ setActiveDashboardPage }) {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-800">Standar Kepatuhan GSTC</h1>
                <p className="mt-2 text-lg text-slate-600">Pilih pilar untuk melihat detail indikator dan mengunggah bukti kepatuhan.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {pillars.map(pillar => (
                    <PillarCard 
                        key={pillar.id}
                        {...pillar}
                        onClick={() => setActiveDashboardPage(pillar.id)}
                    />
                ))}
            </div>
        </div>
    );
}