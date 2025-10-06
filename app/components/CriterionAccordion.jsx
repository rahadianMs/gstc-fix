"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from './Icons';

// Komponen Accordion yang diperbarui dengan tampilan modern
export default function CriterionAccordion({ criterion, user, supabase }) {
    const [isOpen, setIsOpen] = useState(false);
    const [subIndicators, setSubIndicators] = useState([]);
    
    // Placeholder untuk fungsionalitas
    const [discussionMessages, setDiscussionMessages] = useState([]);
    
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
        <div className="bg-brand-surface rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden transition-shadow hover:shadow-md">
            {/* Header Accordion */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 text-left flex justify-between items-center"
            >
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-brand-accent/20 rounded-full flex items-center justify-center">
                        <span className="font-bold text-brand-primary text-lg">{criterion.criterion_code}</span>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-brand-primary">{criterion.criterion_title}</h4>
                        <p className="text-sm text-slate-500 mt-1 max-w-2xl">{criterion.criterion_description}</p>
                    </div>
                </div>
                <div className='flex items-center gap-4'>
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-200 text-slate-600">To Do</span>
                    <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            
            {/* Konten Accordion */}
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
                            <div className="lg:col-span-3 p-8 space-y-6">
                                <h5 className="text-base font-bold text-slate-700">Indicators</h5>
                                {subIndicators.length > 0 ? subIndicators.map(sub => (
                                    <div key={sub.id} className="border-t pt-5">
                                        <p className="font-semibold text-slate-800">{sub.indicator_letter}. {sub.indicator_text}</p>
                                        <div className="mt-3 flex items-center gap-4">
                                            <button className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-secondary">Link Evidence</button>
                                            <span className="text-xs text-slate-400">Status: {sub.evidence_submissions[0]?.status || 'To Do'}</span>
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-slate-400">Memuat indikator...</p>}
                            </div>
                            
                            {/* Kolom Diskusi */}
                            <div className="lg:col-span-2 p-8 bg-slate-50 lg:border-l">
                                <h5 className="font-bold text-slate-700 mb-4">Discussion Thread</h5>
                                <div className="space-y-4 h-64 overflow-y-auto mb-4 border-b pb-4">
                                    {/* Contoh tampilan diskusi */}
                                    <div className="text-sm text-slate-500 text-center py-10">Belum ada diskusi.</div>
                                </div>
                                <textarea className="w-full p-2 border rounded-lg text-sm" rows="3" placeholder="Tulis komentar..."></textarea>
                                <button className="mt-2 w-full px-4 py-2 text-sm font-semibold text-white bg-brand-secondary rounded-lg hover:bg-brand-primary">Send</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}