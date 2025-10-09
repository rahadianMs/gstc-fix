"use client";

import { useState, useEffect } from 'react';

// Komponen Kotak Heatmap Individual
const HeatmapCell = ({ criterion, percentage }) => {
    // FUNGSI WARNA BARU: Sesuai palet warna yang Anda berikan (Terang ke Gelap)
    const getColorStyles = (p) => {
        if (p >= 0 && p <= 20) return { backgroundColor: '#E4EBEE', color: '#3F545F', borderColor: '#DAE0E3' };
        if (p > 20 && p <= 40) return { backgroundColor: '#B8C5CC', color: '#3F545F', borderColor: '#A8B6BE' };
        if (p > 40 && p <= 60) return { backgroundColor: '#7A919D', color: 'white', borderColor: '#6A808C' };
        if (p > 60 && p <= 80) return { backgroundColor: '#526874', color: 'white', borderColor: '#425560' }; 
        if (p > 80 && p <= 100) return { backgroundColor: '#3F545F', color: 'white', borderColor: '#2F3F4A' };
        return { backgroundColor: '#f3f4f6', color: '#6b7280', borderColor: '#e5e7eb' }; // Fallback
    };

    const shortCode = criterion.criterion_code.replace('.', '');

    return (
        <div 
            className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-md font-bold text-xs transition-colors duration-300 border"
            style={getColorStyles(percentage)}
            title={`${criterion.criterion_code}: ${criterion.criterion_title}\nProgress: ${percentage.toFixed(0)}%`}
        >
            {shortCode}
        </div>
    );
};

// Komponen Legenda Warna yang Disesuaikan
const HeatmapLegend = () => (
    <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
        <span>0%</span>
        <div className="flex rounded-sm overflow-hidden">
            <div className="w-4 h-4" style={{ backgroundColor: '#E4EBEE' }}></div>
            <div className="w-4 h-4" style={{ backgroundColor: '#B8C5CC' }}></div>
            <div className="w-4 h-4" style={{ backgroundColor: '#7A919D' }}></div>
            <div className="w-4 h-4" style={{ backgroundColor: '#526874' }}></div>
            <div className="w-4 h-4" style={{ backgroundColor: '#3F545F' }}></div>
        </div>
        <span>100%</span>
    </div>
);


// Komponen Utama Heatmap
export default function ProgressHeatmap({ supabase, user }) {
    const [heatmapData, setHeatmapData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const pillarColors = {
        A: '#F59E0B', B: '#84CC16', C: '#3B82F6', D: '#10B981',
    };

    useEffect(() => {
        const fetchHeatmapData = async () => {
            if (!user) return;
            setLoading(true);

            const { data: criteria } = await supabase
                .from('gstc_criteria')
                .select('id, criterion_code, pillar, gstc_sub_indicators(id), criterion_title');

            const { data: doneEvidence } = await supabase
                .from('evidence_submissions')
                .select('sub_indicator_id')
                .eq('destination_id', user.id)
                .eq('status', 'Done');

            const doneSubIndicatorIds = new Set(doneEvidence.map(e => e.sub_indicator_id));

            const processedData = criteria.map(criterion => {
                const totalSubs = criterion.gstc_sub_indicators.length;
                if (totalSubs === 0) return { ...criterion, percentage: 0 };
                const doneSubs = criterion.gstc_sub_indicators.filter(sub => doneSubIndicatorIds.has(sub.id)).length;
                return { ...criterion, percentage: (doneSubs / totalSubs) * 100 };
            });

            const groupedByPillar = processedData.reduce((acc, criterion) => {
                const pillar = criterion.pillar;
                if (!acc[pillar]) acc[pillar] = [];
                acc[pillar].push(criterion);
                return acc;
            }, {});

            for (const pillar in groupedByPillar) {
                groupedByPillar[pillar].sort((a, b) => 
                    a.criterion_code.localeCompare(b.criterion_code, undefined, { numeric: true })
                );
            }

            setHeatmapData(groupedByPillar);
            setLoading(false);
        };

        fetchHeatmapData();
    }, [supabase, user]);

    if (loading) {
        return <div className="h-64 w-full bg-slate-100 rounded-xl animate-pulse"></div>;
    }

    const pillars = ['A', 'B', 'C', 'D'];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl text-slate-800">Fokus Kriteria yang Perlu Ditingkatkan</h3>
                <HeatmapLegend />
            </div>
            
            <div className="space-y-2 p-2 bg-slate-50 rounded-lg">
                {pillars.map(pillar => {
                    const pillarData = heatmapData ? heatmapData[pillar] : [];
                    if (!pillarData || pillarData.length === 0) return null;

                    return (
                        <div key={pillar} className="flex items-start gap-3 p-2">
                            <div className="w-10 flex-shrink-0 text-center pt-1">
                                <span 
                                    className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-white"
                                    style={{ backgroundColor: pillarColors[pillar] }}
                                >
                                    {pillar}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {pillarData.map(criterion => (
                                    <HeatmapCell 
                                        key={criterion.id}
                                        criterion={criterion}
                                        percentage={criterion.percentage}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}