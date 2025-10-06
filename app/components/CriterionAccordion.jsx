"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from './Icons';

// Komponen Accordion yang diperbarui untuk setiap kriteria (misal A1, A2)
export default function CriterionAccordion({ criterion, user, supabase }) {
    const [isOpen, setIsOpen] = useState(false);
    const [subIndicators, setSubIndicators] = useState([]);
    
    // Placeholder untuk fungsionalitas
    const [discussionMessages, setDiscussionMessages] = useState([]);

    // Ambil data sub-indikator saat accordion dibuka
    useEffect(() => {
        const fetchSubIndicators = async () => {
            if (isOpen) {
                const { data } = await supabase
                    .from('gstc_sub_indicators')
                    .select('*, evidence_submissions(status)')
                    .eq('criterion_id', criterion.id)
                    .eq('evidence_submissions.destination_id', user.id)
                    .order('indicator_letter');
                if (data) setSubIndicators(data);
            }
        };
        fetchSubIndicators();
    }, [isOpen, criterion.id, user.id, supabase]);

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Header Accordion yang bisa diklik */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
            >
                <div>
                    <h4 className="text-lg font-bold text-slate-800">{criterion.criterion_code}: {criterion.criterion_title}</h4>
                    <p className="text-sm text-slate-500 mt-1 max-w-2xl">{criterion.criterion_description}</p>
                </div>
                <div className='flex items-center gap-4'>
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600">To Do</span>
                    <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            
            {/* Konten Accordion yang bisa expand/collapse */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-5 border-t">
                            {/* Kolom Indikator (Upload) */}
                            <div className="lg:col-span-3 p-6 space-y-4">
                                <h5 className="font-bold text-slate-700">Indicators</h5>
                                {subIndicators.length > 0 ? subIndicators.map(sub => (
                                    <div key={sub.id} className="border-t pt-3">
                                        <p className="font-semibold text-slate-700 text-sm">{sub.indicator_letter}. {sub.indicator_text}</p>
                                        <div className="mt-2 flex items-center gap-4">
                                            <button className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Link Evidence</button>
                                            <span className="text-xs text-slate-400">Status: {sub.evidence_submissions[0]?.status || 'To Do'}</span>
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-slate-400">Memuat indikator...</p>}
                            </div>
                            
                            {/* Kolom Diskusi */}
                            <div className="lg:col-span-2 p-6 bg-slate-50 lg:border-l">
                                <h5 className="font-bold text-slate-700 mb-4">Discussion Thread</h5>
                                <div className="space-y-4 h-48 overflow-y-auto mb-4 border-b pb-4">
                                    <p className="text-sm text-slate-500 text-center">Kolom diskusi akan ada di sini.</p>
                                </div>
                                <textarea className="w-full p-2 border rounded-lg text-sm" rows="2" placeholder="Tulis komentar..."></textarea>
                                <button className="mt-2 px-4 py-2 text-sm font-semibold text-white bg-slate-700 rounded-lg hover:bg-slate-800">Send</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}