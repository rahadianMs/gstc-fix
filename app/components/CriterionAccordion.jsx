"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// --- PERUBAHAN DI SINI: Impor Ikon ---
import { ChevronDownIcon, TrashCanIcon, ChatBubbleIcon } from './Icons';
import SubIndicatorItem from './SubIndicatorItem';
import EvidenceModal from './EvidenceModal';
import ReviewModal from './ReviewModal';

const CHAR_LIMIT = 280;

// --- PERUBAHAN DI SINI: Definisi ikon lokal dihapus ---

export default function CriterionAccordion({ criterion, user, supabase, onDataChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [subIndicators, setSubIndicators] = useState(criterion.gstc_sub_indicators || []);
    const [evidenceMap, setEvidenceMap] = useState(() => {
        const initialMap = {};
        if (criterion.gstc_sub_indicators) {
            criterion.gstc_sub_indicators.forEach(sub => {
                if (sub.evidence_submissions && sub.evidence_submissions.length > 0) {
                    initialMap[sub.id] = sub.evidence_submissions[0];
                }
            });
        }
        return initialMap;
    });

    const [overallStatus, setOverallStatus] = useState('To Do');
    const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
    const [selectedSubIndicator, setSelectedSubIndicator] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedEvidenceForReview, setSelectedEvidenceForReview] = useState(null);
    const [discussionMessages, setDiscussionMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Done': return 'bg-green-500';
            case 'Rejected': return 'bg-red-500';
            case 'Revision': return 'bg-purple-500';
            case 'In Review': return 'bg-yellow-500';
            default: return 'bg-slate-300';
        }
    };

    const fetchMessages = async () => {
        if (!criterion.id) return;
        const { data, error } = await supabase.rpc('get_discussion_threads', { p_criterion_id: criterion.id, p_destination_id: user.id });
        if (!error && data) setDiscussionMessages(data);
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === '' || !user) return;
        setIsSending(true);
        const { error } = await supabase.from('discussion_threads').insert({ criterion_id: criterion.id, destination_id: user.id, sender_id: user.id, message: newMessage.trim() });
        if (!error) {
            setNewMessage('');
            await fetchMessages();
        }
        setIsSending(false);
    };

    // Fungsi ini tetap ada, namun tombolnya tidak akan di-render untuk user
    const handleDeleteMessage = async (messageId) => {
        const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus komentar ini?");
        if (isConfirmed) {
            const { error } = await supabase.from('discussion_threads').delete().eq('id', messageId);
            if (!error) await fetchMessages();
        }
    };
    
    useEffect(() => {
        const fetchDetailsIfNeeded = async () => {
            if (subIndicators.length === 0) {
                const { data: subData } = await supabase.from('gstc_sub_indicators').select('*').eq('criterion_id', criterion.id).order('indicator_letter');
                if (subData) {
                    setSubIndicators(subData);
                    const subIds = subData.map(s => s.id);
                    if (subIds.length > 0) {
                        const { data: evidenceData } = await supabase.from('evidence_submissions').select('*').in('sub_indicator_id', subIds).eq('destination_id', user.id);
                        if (evidenceData) {
                            const map = evidenceData.reduce((acc, ev) => { acc[ev.sub_indicator_id] = ev; return acc; }, {});
                            setEvidenceMap(map);
                        }
                    }
                }
            }
        };

        if (isOpen) {
            fetchDetailsIfNeeded();
            if(isDiscussionOpen) fetchMessages();
        }
    }, [isOpen, isDiscussionOpen, criterion.id, user.id, supabase, subIndicators.length]);
    
    useEffect(() => { 
        const allStatuses = subIndicators.map(sub => evidenceMap[sub.id]?.status || 'To Do'); 
        if (allStatuses.length === 0) { setOverallStatus('To Do'); return; } 
        if (allStatuses.every(s => s === 'Done')) { setOverallStatus('Done'); } 
        else if (allStatuses.some(s => s !== 'To Do')) { setOverallStatus('In Progress'); } 
        else { setOverallStatus('To Do'); } 
    }, [evidenceMap, subIndicators]);

    const handleOpenEvidenceModal = (subIndicator) => { setSelectedSubIndicator(subIndicator); setIsEvidenceModalOpen(true); }; const handleCloseEvidenceModal = () => setIsEvidenceModalOpen(false); const handleOpenReviewModal = (evidence) => { setSelectedEvidenceForReview(evidence); setIsReviewModalOpen(true); }; const handleCloseReviewModal = () => setIsReviewModalOpen(false); const handleSaveEvidence = (newEvidence) => { setEvidenceMap(prev => ({ ...prev, [newEvidence.sub_indicator_id]: newEvidence })); if(onDataChange) onDataChange(); };
    const statusMap = { 'To Do': { label: 'To Do', style: 'bg-slate-100 text-slate-600' }, 'In Progress': { label: 'In Progress', style: 'bg-blue-100 text-blue-700' }, 'Done': { label: 'Selesai', style: 'bg-green-100 text-green-800' } }; const statusInfo = statusMap[overallStatus];

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden transition-shadow hover:shadow-md">
                 <div onClick={() => setIsOpen(!isOpen)} className="w-full p-6 text-left flex justify-between items-start cursor-pointer hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start gap-5 flex-1">
                        <div className="flex-shrink-0 w-14 h-14 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center transition-colors"><span className="font-bold text-lg" style={{color: '#3f545f'}}>{criterion.criterion_code}</span></div>
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-slate-800">{criterion.criterion_title}</h4>
                            <p className="text-sm text-slate-500 mt-1 max-w-3xl">{criterion.criterion_description}</p>
                            <div className="flex items-center gap-2 mt-3">
                                {subIndicators.map(indicator => (
                                    <span 
                                        key={indicator.id}
                                        title={`${indicator.indicator_letter}: ${evidenceMap[indicator.id]?.status || 'To Do'}`}
                                        className={`w-3 h-3 rounded-full transition-colors ${getStatusColor(evidenceMap[indicator.id]?.status)}`}
                                    ></span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className='flex items-center gap-4 flex-shrink-0'>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusInfo.style}`}>{statusInfo.label}</span>
                        <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden" transition={{ duration: 0.3, ease: "easeInOut" }}>
                            <div className={`grid grid-cols-1 lg:grid-cols-5 border-t border-slate-200/80`}>
                                <div className={`p-8 relative transition-all duration-300 ${isDiscussionOpen ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <h5 className="text-base font-bold text-slate-800">Indicators</h5>
                                        {!isDiscussionOpen && (
                                            <button 
                                                onClick={() => setIsDiscussionOpen(true)}
                                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-colors"
                                                style={{backgroundColor: '#3f545f'}}
                                            >
                                                {/* PERUBAHAN DI SINI: Menambahkan margin kanan */}
                                                <ChatBubbleIcon className="w-5 h-5 mr-2" />
                                                Diskusi
                                            </button>
                                        )}
                                    </div>
                                    {subIndicators.length > 0 ? subIndicators.map(sub => (<SubIndicatorItem key={sub.id} sub={sub} evidence={evidenceMap[sub.id]} onLinkEvidence={() => handleOpenEvidenceModal(sub)} onViewReview={() => handleOpenReviewModal(evidenceMap[sub.id])} />)) : <p className="text-sm text-slate-400">Memuat indikator...</p>}
                                </div>
                                <AnimatePresence>
                                {isDiscussionOpen && (
                                    <motion.div 
                                        className="lg:col-span-2 p-8 bg-slate-50 lg:border-l border-slate-200/80 flex flex-col"
                                        initial={{ opacity: 0, x: 100 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 100 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <h5 className="font-bold text-slate-800">Discussion Thread</h5>
                                            <button onClick={() => setIsDiscussionOpen(false)} className="text-sm font-semibold text-slate-500 hover:text-slate-800">Tutup</button>
                                        </div>
                                        <div className="flex-grow space-y-4 h-64 overflow-y-auto mb-4 border-b pb-4">
                                            {discussionMessages.map(msg => {
                                                const isMyMessage = msg.sender_id === user.id;
                                                const senderName = msg.sender_role === 'consultant' ? (msg.sender_full_name || 'Konsultan') : (msg.sender_destination_name || 'Destinasi');
                                                return (
                                                    <div key={msg.id} className={`group flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                                        <div className={`relative p-3 rounded-lg max-w-xs ${isMyMessage ? 'bg-blue-100' : 'bg-white border'}`}>
                                                            <div className="font-bold text-sm" style={{color: '#3f545f'}}>{isMyMessage ? 'Anda' : senderName}</div>
                                                            <p className="text-sm text-slate-700">{msg.message}</p>
                                                            {/* --- PERUBAHAN UTAMA DI SINI: Tombol Hapus Dihilangkan --- */}
                                                        </div>
                                                        <p className="text-xs text-slate-400 mt-1">{new Date(msg.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                );
                                            })}
                                            {discussionMessages.length === 0 && <div className="text-sm text-slate-500 text-center py-10">Belum ada diskusi.</div>}
                                        </div>
                                        <textarea className="w-full p-2 border border-slate-300 rounded-lg text-sm" rows="3" placeholder="Tulis komentar..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} maxLength={CHAR_LIMIT} />
                                        <div className="flex justify-between items-center mt-2"><p className={`text-xs ${newMessage.length >= CHAR_LIMIT ? 'text-red-500' : 'text-slate-400'}`}>{newMessage.length}/{CHAR_LIMIT}</p><button onClick={handleSendMessage} disabled={isSending || newMessage.trim() === ''} className="px-4 py-2 text-sm font-semibold text-white rounded-lg" style={{backgroundColor: '#3f545f'}}>{isSending ? 'Mengirim...' : 'Send'}</button></div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {isEvidenceModalOpen && (<EvidenceModal isOpen={isEvidenceModalOpen} onClose={handleCloseEvidenceModal} subIndicator={selectedSubIndicator} existingEvidence={evidenceMap[selectedSubIndicator.id]} user={user} supabase={supabase} onSave={handleSaveEvidence} />)}
            {isReviewModalOpen && (<ReviewModal isOpen={isReviewModalOpen} onClose={handleCloseReviewModal} evidence={selectedEvidenceForReview} />)}
        </>
    );
}