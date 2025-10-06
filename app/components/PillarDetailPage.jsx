"use client";

import { useState, useEffect } from 'react';
import CriterionAccordion from './CriterionAccordion';
import { motion } from 'framer-motion';

// Data baru untuk visualisasi header setiap pilar
const PILLAR_VISUALS = {
    A: {
        title: 'Pengelolaan Berkelanjutan',
        imageUrl: 'https://images.unsplash.com/photo-1542626991-cbc4e32524cc?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    B: {
        title: 'Keberlanjutan Sosial-Ekonomi',
        imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    C: {
        title: 'Keberlanjutan Budaya',
        imageUrl: 'https://images.unsplash.com/photo-1727341853917-08c9397af773?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    D: {
        title: 'Keberlanjutan Lingkungan',
        imageUrl: 'https://images.unsplash.com/photo-1591807105152-594ed605cc58?q=80&w=1074&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
};


// Komponen Progress Bar
const ProgressBar = ({ value, title }) => {
    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-slate-700">{title}</span>
                <span className="text-sm font-medium text-slate-600">{Math.round(value)}% Selesai</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <motion.div 
                    className="h-2.5 rounded-full"
                    style={{ backgroundColor: '#e8c458' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </div>
        </div>
    );
};

export default function PillarDetailPage({ pillar, supabase, user }) {
    const [criteria, setCriteria] = useState([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    const visual = PILLAR_VISUALS[pillar];

    const groupedCriteria = criteria.reduce((acc, criterion) => {
        const key = criterion.sub_section_title;
        if (!acc[key]) acc[key] = { code: criterion.sub_section_code, criteria: [] };
        acc[key].criteria.push(criterion);
        return acc;
    }, {});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('gstc_criteria')
                .select('*, gstc_sub_indicators(id, evidence_submissions(status))')
                .eq('pillar', pillar)
                .eq('gstc_sub_indicators.evidence_submissions.destination_id', user.id);
            
            if (data) {
                setCriteria(data);
                let total = 0, done = 0;
                data.forEach(c => {
                    c.gstc_sub_indicators.forEach(s => {
                        total++;
                        if (s.evidence_submissions[0]?.status === 'Done') done++;
                    });
                });
                setProgress(total > 0 ? (done / total) * 100 : 0);
            }
            setLoading(false);
        };
        fetchData();
    }, [pillar, supabase, user.id]);
    
    const calculateProgress = (criteriaList) => {
        let total = 0, done = 0;
        criteriaList.forEach(c => {
            c.gstc_sub_indicators.forEach(s => {
                total++;
                if (s.evidence_submissions[0]?.status === 'Done') done++;
            });
        });
        return total > 0 ? (done / total) * 100 : 0;
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div 
                className="relative p-8 rounded-2xl text-white bg-cover bg-center mb-12"
                style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.2)), url('${visual.imageUrl}')` }}
            >
                <h1 className="text-4xl font-bold drop-shadow-md">PILAR {pillar}</h1>
                <p className="mt-1 text-lg opacity-90 drop-shadow-md">{visual.title}</p>
            </div>

            {loading ? <p className='text-center'>Memuat data progres...</p> : (
                <div className="space-y-10">
                    {Object.entries(groupedCriteria).map(([subSectionTitle, data]) => {
                        const progressValue = calculateProgress(data.criteria);
                        return (
                            <div key={subSectionTitle} className="bg-white p-6 rounded-2xl shadow-md border">
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">{subSectionTitle}</h2>
                                <p className="text-sm text-slate-500 mb-6">Penuhi semua kriteria di bawah ini untuk menyelesaikan bagian ini.</p>
                                
                                <ProgressBar value={progressValue} title="Progress Bagian" />

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