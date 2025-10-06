"use client";

import { useState, useEffect } from 'react';
import CriterionAccordion from './CriterionAccordion';
import { motion } from 'framer-motion';

// Komponen Progress Bar (tidak berubah)
const ProgressBar = ({ value, title }) => {
    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-emerald-700">{title}</span>
                <span className="text-sm font-medium text-emerald-700">{Math.round(value)}% Done</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <motion.div 
                    className="bg-emerald-600 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </div>
        </div>
    );
};

// Komponen Halaman Pilar yang sudah direvisi
export default function PillarDetailPage({ pillar, supabase, user }) {
    const [criteria, setCriteria] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mengelompokkan kriteria berdasarkan sub-seksi
    const groupedCriteria = criteria.reduce((acc, criterion) => {
        const key = criterion.sub_section_title;
        if (!acc[key]) {
            acc[key] = {
                code: criterion.sub_section_code,
                criteria: []
            };
        }
        acc[key].criteria.push(criterion);
        return acc;
    }, {});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            // Query dioptimalkan untuk mengambil semua data yang dibutuhkan sekaligus
            const { data, error } = await supabase
                .from('gstc_criteria')
                .select(`
                    *,
                    gstc_sub_indicators (
                        id,
                        evidence_submissions ( status )
                    )
                `)
                .eq('pillar', pillar)
                .eq('gstc_sub_indicators.evidence_submissions.destination_id', user.id);
            
            if (data) {
                setCriteria(data);
            }
            setLoading(false);
        };
        fetchData();
    }, [pillar, supabase, user.id]);
    
    // Fungsi untuk menghitung progres untuk setiap sub-seksi
    const calculateProgress = (criteriaList) => {
        let totalIndicators = 0;
        let doneIndicators = 0;
        
        criteriaList.forEach(criterion => {
            criterion.gstc_sub_indicators.forEach(sub => {
                totalIndicators++;
                // Cek apakah ada bukti yang disubmit dan statusnya 'Done'
                if (sub.evidence_submissions && sub.evidence_submissions.length > 0 && sub.evidence_submissions[0].status === 'Done') {
                    doneIndicators++;
                }
            });
        });
        
        return totalIndicators > 0 ? (doneIndicators / totalIndicators) * 100 : 0;
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-800">BAGIAN {pillar}</h1>
                <p className="mt-2 text-lg text-slate-600">Kelola dan penuhi semua kriteria untuk pilar ini.</p>
            </div>

            {loading ? <p className='text-center'>Memuat data progres...</p> : (
                <div className="space-y-10">
                    {Object.entries(groupedCriteria).map(([subSectionTitle, data]) => {
                        const progressValue = calculateProgress(data.criteria);
                        return (
                            <div key={subSectionTitle} className="bg-white p-6 rounded-2xl shadow-md border">
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">{subSectionTitle}</h2>
                                <p className="text-sm text-slate-500 mb-6">Penuhi semua kriteria di bawah ini untuk menyelesaikan sub-seksi ini.</p>
                                
                                {/* Progress bar per sub-seksi */}
                                <ProgressBar value={progressValue} title="Progress Sub-Seksi" />

                                <div className="mt-8 space-y-4">
                                    {data.criteria.map(criterion => (
                                        <CriterionAccordion 
                                            key={criterion.id} 
                                            criterion={criterion} 
                                            user={user} 
                                            supabase={supabase} 
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}