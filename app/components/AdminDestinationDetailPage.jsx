"use client";

import { useState, useEffect } from 'react';
import AdminReviewCard from './AdminReviewCard'; // Impor komponen baru

// Komponen Halaman Detail Destinasi untuk Admin/Konsultan
export default function AdminDestinationDetailPage({ destinationId, supabase, setActiveDashboardPage }) {
    const [destination, setDestination] = useState(null);
    const [indicators, setIndicators] = useState([]);
    const [loading, setLoading] = useState(true);

    // Data sub-section dari dokumen GSTC
    const subSections = {
        'A': { 'A(a)': 'Struktur dan kerangka pengelolaan', 'A(b)': 'Pelibatan pemangku-kepentingan', 'A(c)': 'Mengelola tekanan dan perubahan' },
        'B': { 'B(a)': 'Memberikan manfaat ekonomi lokal', 'B(b)': 'Kesejahteraan dan dampak sosial' },
        'C': { 'C(a)': 'Pelindungan warisan budaya', 'C(b)': 'Mengunjungi situs budaya' },
        'D': { 'D(a)': 'Konservasi warisan alam', 'D(b)': 'Pengelolaan sumberdaya', 'D(c)': 'Pengelolaan limbah dan emisi' }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);

            // 1. Ambil info profil destinasi
            const { data: profileData } = await supabase
                .from('profiles')
                .select('destination_name, admin_province')
                .eq('id', destinationId)
                .single();
            setDestination(profileData);

            // 2. Ambil semua indikator DAN gabungkan (join) dengan bukti yang sudah disubmit oleh destinasi ini
            const { data: indicatorData, error } = await supabase
                .from('gstc_indicators')
                .select(`
                    *,
                    compliance_evidence (
                        id,
                        status,
                        evidence_link,
                        consultant_comment
                    )
                `)
                .eq('compliance_evidence.destination_id', destinationId)
                .order('id');
            
            if (indicatorData) {
                // Proses data agar lebih mudah digunakan di UI
                const processedData = indicatorData.map(ind => ({
                    ...ind,
                    evidence: ind.compliance_evidence[0] || null // Ambil bukti pertama (karena relasinya 1-to-1)
                }));
                setIndicators(processedData);
            }
            setLoading(false);
        };

        fetchAllData();
    }, [destinationId, supabase]);

    // Fungsi untuk update data di UI secara real-time setelah konsultan mereview
    const handleEvidenceUpdate = (updatedEvidence) => {
        setIndicators(prevIndicators => 
            prevIndicators.map(ind => 
                ind.id === updatedEvidence.indicator_id 
                ? { ...ind, evidence: updatedEvidence } 
                : ind
            )
        );
    };

    if (loading) return <div>Memuat detail destinasi dan bukti kepatuhan...</div>;

    // Helper untuk mengelompokkan indikator berdasarkan pilar
    const indicatorsByPillar = (pillar) => indicators.filter(i => i.pillar === pillar);

    return (
        <div>
            <button onClick={() => setActiveDashboardPage('beranda')} className="text-sm font-semibold text-emerald-600 mb-6 hover:underline">
                &larr; Kembali ke Daftar Destinasi
            </button>
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-800">{destination?.destination_name}</h1>
                <p className="mt-2 text-lg text-slate-600">{destination?.admin_province}</p>
            </div>
            
            <div className="space-y-12">
                {['A', 'B', 'C', 'D'].map(pillar => (
                    <section key={pillar}>
                        <h2 className="text-2xl font-bold text-slate-700 pb-2 mb-6 border-b-2">BAGIAN {pillar}</h2>
                        <div className="space-y-6">
                            {indicatorsByPillar(pillar).map(indicator => (
                                <AdminReviewCard
                                    key={indicator.id}
                                    indicator={indicator}
                                    evidence={indicator.evidence}
                                    subSectionTitle={"Contoh Sub-section"} // Placeholder, bisa dibuat lebih dinamis
                                    onUpdate={handleEvidenceUpdate}
                                    supabase={supabase}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}