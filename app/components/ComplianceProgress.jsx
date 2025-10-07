"use client";

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

// --- KOMPONEN-KOMPONEN VISUAL (TIDAK BERUBAH) ---
const ChartBar = ({ pillar, percentage, color }) => (
    <div className="flex flex-col items-center h-full justify-end gap-2">
        <div className="text-sm font-bold text-slate-700">{percentage.toFixed(1)}%</div>
        <motion.div
            className="w-12 md:w-16 rounded-t-lg"
            style={{ backgroundColor: color }}
            initial={{ height: 0 }}
            animate={{ height: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <div className="text-sm font-semibold text-slate-500">{pillar}</div>
    </div>
);
const ProgressRow = ({ letter, title, done, total, color }) => {
    const percentage = total > 0 ? (done / total) * 100 : 0;
    return (
        <div className="p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-bold text-slate-700">{letter}. {title}</span>
                <span className="font-semibold text-slate-500">{done}/{total} Kriteria</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <motion.div
                    className="h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
        </div>
    );
};
// --- END KOMPONEN VISUAL ---


// --- GAUGE CHART YANG DIPERBAIKI ---
const GaugeChart = ({ value }) => {
    const radius = 80;
    const arcLength = Math.PI * radius; // Ini adalah panjang busur setengah lingkaran
    const progress = useMotionValue(0);
    const count = useMotionValue(0);
    const rounded = useTransform(count, latest => latest.toFixed(1));

    useEffect(() => {
        const countAnimation = animate(count, value, { duration: 1.5, ease: "easeOut" });
        const progressAnimation = animate(progress, value, { duration: 1.5, ease: "easeOut" });
        return () => {
            countAnimation.stop();
            progressAnimation.stop();
        };
    }, [value]);

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg border h-full">
            <h4 className="text-lg font-bold text-slate-800 mb-2">Total Progress</h4>
            <svg width="200" height="120" viewBox="0 0 200 120">
                {/* 1. Warna Kerangka (Background Arc) */}
                <path
                    d={`M ${100 - radius},100 A ${radius},${radius} 0 0 1 ${100 + radius},100`}
                    fill="none"
                    stroke="#E2E8F0" // Abu-abu muda
                    strokeWidth="20"
                    strokeLinecap="round"
                />
                {/* 2. Warna Progress (Foreground Arc) */}
                <motion.path
                    d={`M ${100 - radius},100 A ${radius},${radius} 0 0 1 ${100 + radius},100`}
                    fill="none"
                    stroke="#F59E0B" // Oranye/kuning
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeDasharray={arcLength}
                    // --- PERBAIKAN LOGIKA UTAMA ADA DI SINI ---
                    strokeDashoffset={useTransform(progress, v => arcLength * (1 - v / 100))}
                />
            </svg>
            <motion.span className="text-4xl font-extrabold text-slate-800 -mt-16">
                {rounded}
            </motion.span>
             <span className="text-xl font-bold text-slate-500 -mt-2">%</span>
        </div>
    );
};

// --- KOMPONEN FOCUS AREA (TIDAK BERUBAH) ---
const FocusArea = ({ pillar }) => {
    return (
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-lg border h-full">
            <h4 className="text-lg font-bold text-slate-800 mb-2">⭐ Focus Area</h4>
            <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: pillar.color }}>
                    <span className="text-3xl font-bold text-white">{pillar.letter}</span>
                </div>
                <p className="mt-3 font-bold text-slate-700 text-lg">{pillar.name}</p>
                <p className="text-slate-500 font-semibold">{pillar.done}/{pillar.total} Kriteria</p>
            </div>
        </div>
    );
};


export default function ComplianceProgress({ supabase, user }) {
    const [loading, setLoading] = useState(true);
    const [complianceData, setComplianceData] = useState(null);
    const [focusPillar, setFocusPillar] = useState(null);

    useEffect(() => {
        const fetchComplianceData = async () => {
            if (!user) return;
            setLoading(true);

            const { data: criteriaWithSubs, error } = await supabase
                .from('gstc_criteria')
                .select(`id, pillar, gstc_sub_indicators(id, evidence_submissions(status))`)
                .eq('gstc_sub_indicators.evidence_submissions.destination_id', user.id);

            if (error) {
                console.error("Error fetching compliance data:", error);
                setLoading(false);
                return;
            }

            const pillarStats = {
                A: { done: 0, total: 0, name: 'Sustainability Management', color: '#F59E0B' },
                B: { done: 0, total: 0, name: 'Socio-economic Sustainability', color: '#84CC16' },
                C: { done: 0, total: 0, name: 'Cultural Sustainability', color: '#3B82F6' },
                D: { done: 0, total: 0, name: 'Environmental Sustainability', color: '#10B981' }
            };
            
            criteriaWithSubs.forEach(criterion => {
                const pillar = criterion.pillar;
                if (pillar && pillarStats[pillar]) {
                    pillarStats[pillar].total++;
                    const subIndicators = criterion.gstc_sub_indicators;
                    const isCriterionDone = subIndicators.length > 0 && subIndicators.every(sub => 
                        sub.evidence_submissions?.length > 0 && sub.evidence_submissions[0].status === 'Done'
                    );
                    if (isCriterionDone) {
                        pillarStats[pillar].done++;
                    }
                }
            });
            
            setComplianceData(pillarStats);

            let lowestPercentage = 101;
            let focusCandidates = [];

            for (const [key, pillar] of Object.entries(pillarStats)) {
                const percentage = pillar.total > 0 ? (pillar.done / pillar.total) * 100 : 0;
                if (percentage < lowestPercentage) {
                    lowestPercentage = percentage;
                    focusCandidates = [{ letter: key, ...pillar }];
                } else if (percentage === lowestPercentage) {
                    focusCandidates.push({ letter: key, ...pillar });
                }
            }

            if (focusCandidates.length > 1) {
                const winner = focusCandidates.sort((a, b) => b.total - a.total)[0];
                setFocusPillar(winner);
            } else if (focusCandidates.length === 1) {
                setFocusPillar(focusCandidates[0]);
            }

            setLoading(false);
        };

        fetchComplianceData();
    }, [supabase, user]);

    if (loading) {
        return <div className="h-80 w-full bg-slate-200 rounded-xl animate-pulse"></div>;
    }
    
    if (!complianceData || !focusPillar) {
        return <div className="p-6 text-center bg-white rounded-xl border">Gagal memuat data progres.</div>;
    }

    const totalDone = Object.values(complianceData).reduce((sum, p) => sum + p.done, 0);
    const totalOverall = Object.values(complianceData).reduce((sum, p) => sum + p.total, 0);
    const totalPercentage = totalOverall > 0 ? (totalDone / totalOverall) * 100 : 0;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-8">
            <div>
                <h3 className="font-bold text-xl text-slate-800 mb-6">Progres Kepatuhan Standar</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="p-4 rounded-lg bg-slate-50 border h-[300px]">
                        <div className="flex h-full items-end justify-around">
                            {Object.entries(complianceData).map(([pillar, data]) => {
                                const percentage = data.total > 0 ? (data.done / data.total) * 100 : 0;
                                return <ChartBar key={pillar} pillar={pillar} percentage={percentage} color={data.color} />
                            })}
                        </div>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(complianceData).map(([pillar, data]) => (
                            <ProgressRow key={pillar} letter={pillar} title={data.name} done={data.done} total={data.total} color={data.color} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GaugeChart value={totalPercentage} />
                <FocusArea pillar={focusPillar} />
            </div>
        </div>
    );
}