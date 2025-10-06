"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from './Icons';
import SubIndicatorItem from './SubIndicatorItem';
import EvidenceModal from './EvidenceModal';
import ReviewModal from './ReviewModal'; // <-- Impor modal review baru

// Komponen Accordion yang diperbarui
export default function CriterionAccordion({ criterion, user, supabase, onDataChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [subIndicators, setSubIndicators] = useState([]);
    const [evidenceMap, setEvidenceMap] = useState({});
    const [overallStatus, setOverallStatus] = useState('To Do');
    
    // State untuk modal upload/edit evidence
    const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
    const [selectedSubIndicator, setSelectedSubIndicator] = useState(null);
    
    // --- STATE BARU UNTUK MODAL REVIEW ---
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedEvidenceForReview, setSelectedEvidenceForReview] = useState(null);

    const [discussionMessages, setDiscussionMessages] = useState([]);

    const fetchData = async () => {
        // ... (fungsi fetchData tetap sama)
        const { data: subData } = await supabase.from('gstc_sub_indicators').select('*').eq('criterion_id', criterion.id).order('indicator_letter');
        if (subData) {
            setSubIndicators(subData);
            const subIds = subData.map(s => s.id);
            if (subIds.length > 0) {
                const { data: evidenceData } = await supabase.from('evidence_submissions').select('*').in('sub_indicator_id', subIds).eq('destination_id', user.id);
                if (evidenceData) {
                    const map = evidenceData.reduce((acc, ev) => {
                        acc[ev.sub_indicator_id] = ev;
                        return acc;
                    }, {});
                    setEvidenceMap(map);
                }
            }
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, criterion.id, user.id, supabase]);
    
    useEffect(() => {
        const allStatuses = subIndicators.map(sub => evidenceMap[sub.id]?.status || 'To Do');
        if (allStatuses.length === 0) { setOverallStatus('To Do'); return; }
        if (allStatuses.every(s => s === 'Done')) { setOverallStatus('Done'); }
        else if (allStatuses.some(s => s !== 'To Do')) { setOverallStatus('In Progress'); }
        else { setOverallStatus('To Do'); }
    }, [evidenceMap, subIndicators]);

    // --- Handler untuk membuka/menutup modal ---
    const handleOpenEvidenceModal = (subIndicator) => {
        setSelectedSubIndicator(subIndicator);
        setIsEvidenceModalOpen(true);
    };
    const handleCloseEvidenceModal = () => setIsEvidenceModalOpen(false);
    
    const handleOpenReviewModal = (evidence) => {
        setSelectedEvidenceForReview(evidence);
        setIsReviewModalOpen(true);
    };
    const handleCloseReviewModal = () => setIsReviewModalOpen(false);

    const handleSaveEvidence = (newEvidence) => {
        setEvidenceMap(prev => ({ ...prev, [newEvidence.sub_indicator_id]: newEvidence }));
        if(onDataChange) onDataChange();
    };

    const statusMap = {
        'To Do': { label: 'To Do', style: 'bg-slate-100 text-slate-600' },
        'In Progress': { label: 'In Progress', style: 'bg-blue-100 text-blue-700' },
        'Done': { label: 'Selesai', style: 'bg-green-100 text-green-800' },
    };
    const statusInfo = statusMap[overallStatus];

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden transition-shadow hover:shadow-md">
                {/* Header Accordion (tidak berubah) */}
                <button onClick={() => setIsOpen(!isOpen)} className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start gap-5">
                        <div className="flex-shrink-0 w-14 h-14 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center transition-colors">
                            <span className="font-bold text-lg" style={{color: '#3f545f'}}>{criterion.criterion_code}</span>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-800">{criterion.criterion_title}</h4>
                            <p className="text-sm text-slate-500 mt-1 max-w-3xl">{criterion.criterion_description}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-4'>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusInfo.style}`}>{statusInfo.label}</span>
                        <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </button>
                
                {/* Konten Accordion */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden" transition={{ duration: 0.3, ease: "easeInOut" }}>
                            <div className="grid grid-cols-1 lg:grid-cols-5 border-t border-slate-200/80">
                                <div className="lg:col-span-3 p-8">
                                    <h5 className="text-base font-bold text-slate-800 mb-2">Indicators</h5>
                                    {subIndicators.length > 0 ? subIndicators.map(sub => (
                                        <SubIndicatorItem 
                                            key={sub.id} 
                                            sub={sub}
                                            evidence={evidenceMap[sub.id]}
                                            onLinkEvidence={() => handleOpenEvidenceModal(sub)}
                                            onViewReview={() => handleOpenReviewModal(evidenceMap[sub.id])}
                                        />
                                    )) : <p className="text-sm text-slate-400">Memuat indikator...</p>}
                                </div>
                                
                                {/* Bagian Discussion Thread (tidak berubah) */}
                                <div className="lg:col-span-2 p-8 bg-slate-50 lg:border-l border-slate-200/80">
                                    <h5 className="font-bold text-slate-800 mb-4">Discussion Thread</h5>
                                    <div className="space-y-4 h-64 overflow-y-auto mb-4 border-b pb-4">
                                        <div className="text-sm text-slate-500 text-center py-10">Belum ada diskusi untuk kriteria ini.</div>
                                    </div>
                                    <textarea className="w-full p-2 border border-slate-300 rounded-lg text-sm" rows="3" placeholder="Tulis komentar atau pertanyaan..."></textarea>
                                    <button className="mt-2 w-full px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90" style={{backgroundColor: '#3f545f'}}>Send</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Render Modal Edit/Upload Evidence */}
            {isEvidenceModalOpen && (
                <EvidenceModal isOpen={isEvidenceModalOpen} onClose={handleCloseEvidenceModal} subIndicator={selectedSubIndicator} existingEvidence={evidenceMap[selectedSubIndicator.id]} user={user} supabase={supabase} onSave={handleSaveEvidence} />
            )}

            {/* --- RENDER MODAL REVIEW BARU --- */}
            {isReviewModalOpen && (
                <ReviewModal isOpen={isReviewModalOpen} onClose={handleCloseReviewModal} evidence={selectedEvidenceForReview} />
            )}
        </>
    );
}