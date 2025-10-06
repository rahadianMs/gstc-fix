"use client";

import { useState, useEffect } from 'react';
import AdminReviewCard from './AdminReviewCard';

// Komponen Halaman Detail Destinasi untuk Admin/Konsultan
export default function AdminDestinationDetailPage({ destinationId, supabase, setActiveDashboardPage }) {
    const [destination, setDestination] = useState(null);
    const [indicators, setIndicators] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!destinationId) return;
            setLoading(true);

            // 1. Ambil info profil destinasi
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('destination_name, admin_province')
                .eq('id', destinationId)
                .single();
            
            if (profileError) console.error("Error fetching profile:", profileError);
            else setDestination(profileData);

            // 2. Ambil SEMUA sub-indikator beserta relasi kriterianya
            const { data: allIndicators, error: indicatorsError } = await supabase
                .from('gstc_sub_indicators')
                .select(`
                    *,
                    gstc_criteria (
                        criterion_code,
                        sub_section_title
                    )
                `)
                .order('id');

            if (indicatorsError) {
                console.error("Error fetching sub-indicators:", indicatorsError);
                setLoading(false);
                return;
            }

            // 3. Ambil SEMUA bukti yang relevan untuk destinasi ini saja
            const { data: evidenceData, error: evidenceError } = await supabase
                .from('evidence_submissions')
                .select('*')
                .eq('destination_id', destinationId);
            
            if (evidenceError) {
                console.error("Error fetching evidence:", evidenceError);
                setLoading(false);
                return;
            }

            // 4. Gabungkan kedua data tersebut di dalam kode
            const evidenceMap = evidenceData.reduce((map, evidence) => {
                map[evidence.sub_indicator_id] = evidence;
                return map;
            }, {});

            const processedData = allIndicators.map(indicator => ({
                ...indicator,
                evidence: evidenceMap[indicator.id] || null
            }));

            setIndicators(processedData);
            setLoading(false);
        };

        fetchAllData();
    }, [destinationId, supabase]);

    // Fungsi ini sudah benar dan akan bekerja dengan data baru
    const handleEvidenceUpdate = (updatedEvidence) => {
        setIndicators(prevIndicators => 
            prevIndicators.map(ind => 
                ind.id === updatedEvidence.sub_indicator_id 
                ? { ...ind, evidence: updatedEvidence } 
                : ind
            )
        );
    };

    if (loading) return <div className="text-center p-8">Memuat detail destinasi dan bukti kepatuhan...</div>;

    const indicatorsByPillar = (pillar) => {
        return indicators.filter(i => i.gstc_criteria?.criterion_code?.startsWith(pillar));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => setActiveDashboardPage('review-compliance')} className="text-sm font-semibold mb-6 hover:underline" style={{color: '#3f545f'}}>
                &larr; Kembali ke Daftar Destinasi
            </button>
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-800">{destination?.destination_name || 'Nama Destinasi'}</h1>
                <p className="mt-2 text-lg text-slate-600">{destination?.admin_province || 'Lokasi Belum Diatur'}</p>
            </div>
            
            <div className="space-y-12">
                {['A', 'B', 'C', 'D'].map(pillar => (
                    <section key={pillar}>
                        <h2 className="text-2xl font-bold text-slate-700 pb-2 mb-6 border-b-2">BAGIAN {pillar}</h2>
                        <div className="space-y-6">
                            {indicatorsByPillar(pillar).length > 0 ? (
                                indicatorsByPillar(pillar).map(indicator => (
                                    <AdminReviewCard
                                        key={indicator.id}
                                        indicator={indicator}
                                        evidence={indicator.evidence}
                                        subSectionTitle={indicator.gstc_criteria.sub_section_title}
                                        onUpdate={handleEvidenceUpdate}
                                        supabase={supabase}
                                    />
                                ))
                            ) : (
                                <p className="text-center text-slate-500 py-8">Tidak ada indikator yang tersedia untuk pilar ini.</p>
                            )}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}