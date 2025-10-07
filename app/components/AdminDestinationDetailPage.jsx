"use client";

import { useState, useEffect } from 'react';
import AdminReviewCard from './AdminReviewCard';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashCanIcon } from './Icons';

const CHAR_LIMIT = 280;

const CriterionReviewGroup = ({ criterionGroup, onUpdate, supabase, user, destination }) => {
    const [discussionMessages, setDiscussionMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const { criterion, subIndicators } = criterionGroup;

    const fetchMessages = async () => {
        if (!criterion.id) return;
        const { data, error } = await supabase.rpc('get_discussion_threads', { p_criterion_id: criterion.id, p_destination_id: destination.id });
        if (!error && data) setDiscussionMessages(data);
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === '' || !user || !destination.id) return;
        setIsSending(true);
        const { error } = await supabase.from('discussion_threads').insert({ criterion_id: criterion.id, destination_id: destination.id, sender_id: user.id, message: newMessage.trim() });
        if (!error) {
            setNewMessage('');
            await fetchMessages();
        }
        setIsSending(false);
    };

    const handleDeleteMessage = async (messageId) => {
        const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus komentar ini?");
        if (isConfirmed) {
            const { error } = await supabase.from('discussion_threads').delete().eq('id', messageId);
            if (!error) {
                await fetchMessages();
            }
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [criterion.id, destination.id, supabase]);

    return (
        <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
            <div className="p-6 border-b"><h3 className="text-xl font-bold text-slate-800">{criterion.criterion_code}: {criterion.criterion_title}</h3></div>
            <div className="grid grid-cols-1 lg:grid-cols-5">
                <div className="lg:col-span-3 p-6 space-y-4">
                    {subIndicators.map(indicator => (<AdminReviewCard key={indicator.id} indicator={indicator} evidence={indicator.evidence} subSectionTitle={criterion.sub_section_title} onUpdate={onUpdate} supabase={supabase} />))}
                </div>
                <div className="lg:col-span-2 p-6 bg-slate-50 lg:border-l flex flex-col">
                    <h5 className="font-bold text-slate-800 mb-4">Discussion Thread</h5>
                    <div className="flex-grow space-y-4 h-96 overflow-y-auto mb-4 border-b pb-4">
                        {discussionMessages.map(msg => {
                            const isMyMessage = msg.sender_id === user.id;
                            const senderName = isMyMessage ? 'Anda (Konsultan)' : (msg.sender_destination_name || 'Destinasi');
                            return (
                                <div key={msg.id} className={`group flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                    <div className={`relative p-3 rounded-lg max-w-xs ${isMyMessage ? 'bg-cyan-100' : 'bg-white border'}`}>
                                        <div className="font-bold text-sm" style={{color: '#3f545f'}}>{senderName}</div>
                                        <p className="text-sm text-slate-700">{msg.message}</p>
                                        {isMyMessage && (
                                            <button onClick={() => handleDeleteMessage(msg.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-500 hover:bg-red-100 rounded-full">
                                                <TrashCanIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">{new Date(msg.created_at).toLocaleString('id-ID')}</p>
                                </div>
                            );
                        })}
                        {discussionMessages.length === 0 && <p className="text-sm text-slate-500 text-center py-10">Belum ada diskusi.</p>}
                    </div>
                    <textarea className="w-full p-2 border border-slate-300 rounded-lg text-sm" rows="3" placeholder="Tulis balasan..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} maxLength={CHAR_LIMIT}/>
                    <div className="flex justify-between items-center mt-2"><p className={`text-xs ${newMessage.length >= CHAR_LIMIT ? 'text-red-500' : 'text-slate-400'}`}>{newMessage.length}/{CHAR_LIMIT}</p><button onClick={handleSendMessage} disabled={isSending || newMessage.trim() === ''} className="px-4 py-2 text-sm font-semibold text-white rounded-lg" style={{backgroundColor: '#3f545f'}}>{isSending ? 'Mengirim...' : 'Send'}</button></div>
                </div>
            </div>
        </div>
    );
};

export default function AdminDestinationDetailPage({ destinationId, supabase, setActiveDashboardPage, user }) { const [destination, setDestination] = useState(null); const [indicators, setIndicators] = useState([]); const [loading, setLoading] = useState(true); useEffect(() => { const fetchAllData = async () => { if (!destinationId) return; setLoading(true); const { data: profileData } = await supabase.from('profiles').select('id, destination_name, admin_province').eq('id', destinationId).single(); setDestination(profileData); const { data: allIndicators } = await supabase.from('gstc_sub_indicators').select(`*, gstc_criteria (*)`).order('id'); const { data: evidenceData } = await supabase.from('evidence_submissions').select('*').eq('destination_id', destinationId); const evidenceMap = evidenceData ? evidenceData.reduce((map, evidence) => { map[evidence.sub_indicator_id] = evidence; return map; }, {}) : {}; const processedData = allIndicators ? allIndicators.map(indicator => ({ ...indicator, evidence: evidenceMap[indicator.id] || null })) : []; setIndicators(processedData); setLoading(false); }; fetchAllData(); }, [destinationId, supabase]); const handleEvidenceUpdate = (updatedEvidence) => { setIndicators(prevIndicators => prevIndicators.map(ind => ind.id === updatedEvidence.sub_indicator_id ? { ...ind, evidence: updatedEvidence } : ind)); }; if (loading || !destination) return <div className="text-center p-8">Memuat detail destinasi...</div>; const groupIndicatorsByPillarAndCriterion = (pillar) => { const pillarIndicators = indicators.filter(i => i.gstc_criteria?.criterion_code?.startsWith(pillar)); return pillarIndicators.reduce((acc, indicator) => { const criterionId = indicator.criterion_id; if (!acc[criterionId]) { acc[criterionId] = { criterion: indicator.gstc_criteria, subIndicators: [] }; } acc[criterionId].subIndicators.push(indicator); return acc; }, {}); }; return (<div className="max-w-7xl mx-auto"><button onClick={() => setActiveDashboardPage('review-compliance')} className="text-sm font-semibold mb-6 hover:underline" style={{color: '#3f545f'}}>&larr; Kembali ke Daftar Destinasi</button><div className="text-center mb-12"><h1 className="text-4xl font-bold text-slate-800">{destination?.destination_name}</h1><p className="mt-2 text-lg text-slate-600">{destination?.admin_province}</p></div><div className="space-y-12">{['A', 'B', 'C', 'D'].map(pillar => { const criterionGroups = groupIndicatorsByPillarAndCriterion(pillar); return (<section key={pillar}><h2 className="text-2xl font-bold text-slate-700 pb-2 mb-6 border-b-2">BAGIAN {pillar}</h2><div className="space-y-8">{Object.values(criterionGroups).map(group => (<CriterionReviewGroup key={group.criterion.id} criterionGroup={group} onUpdate={handleEvidenceUpdate} supabase={supabase} user={user} destination={destination}/>))}{Object.keys(criterionGroups).length === 0 && <p className="text-slate-500">Tidak ada kriteria untuk pilar ini.</p>}</div></section>); })}</div></div>); }