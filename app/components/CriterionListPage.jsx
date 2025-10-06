"use client";

import { useState, useEffect } from 'react';
import CriterionAccordion from './CriterionAccordion'; // Impor komponen baru

export default function CriterionListPage({ subSection, onBack, supabase, user }) {
    const [criteria, setCriteria] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCriteria = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('gstc_criteria')
                .select('*')
                .eq('sub_section_code', subSection.code)
                .order('criterion_code');
            if (data) setCriteria(data);
            setLoading(false);
        };
        fetchCriteria();
    }, [subSection.code, supabase]);

    return (
        <div>
             <button onClick={onBack} className="text-sm font-semibold text-emerald-600 mb-6 hover:underline">
                &larr; Kembali ke pemilihan sub-seksi
            </button>
            <div className="text-left mb-8">
                <h2 className="text-3xl font-bold text-slate-800">{subSection.title}</h2>
                <p className="mt-1 text-md text-slate-500">{subSection.code}</p>
            </div>
            {loading ? <p>Memuat...</p> : (
                <div className="space-y-4">
                    {criteria.map(c => <CriterionAccordion key={c.id} criterion={c} user={user} supabase={supabase} />)}
                </div>
            )}
        </div>
    );
}