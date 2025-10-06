"use client";

// Komponen untuk menampilkan pilihan sub-seksi
export default function SubSectionSelectionPage({ pillar, subSections, onSelectSubSection }) {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-800">BAGIAN {pillar}: {subSections.title}</h1>
                <p className="mt-2 text-lg text-slate-600">Pilih sub-seksi untuk melihat kriteria yang relevan.</p>
            </div>
            <div className="space-y-6">
                {subSections.items.map(item => (
                    <button 
                        key={item.code}
                        onClick={() => onSelectSubSection(item)}
                        className="w-full p-6 bg-white rounded-2xl shadow-sm border border-slate-200 text-left hover:border-emerald-500 hover:shadow-lg transition-all flex justify-between items-center"
                    >
                        <div>
                            <p className="font-bold text-emerald-600">{item.code}</p>
                            <h3 className="text-xl font-bold text-slate-800">{item.title}</h3>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                ))}
            </div>
        </div>
    );
}