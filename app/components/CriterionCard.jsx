"use client";

import { useState, useEffect } from 'react';
import EvidenceModal from './EvidenceModal'; // <-- Impor modal baru

// Komponen untuk setiap baris sub-indikator di tab "Indicators"
const SubIndicatorItem = ({ sub, evidence, onLinkEvidence }) => {
    const statusMap = {
        'To Do': { label: 'To Do', color: 'bg-slate-200 text-slate-600' },
        'In Progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-600' },
        'In Review': { label: 'In Review', color: 'bg-yellow-100 text-yellow-600' },
        'Done': { label: 'Done', color: 'bg-green-100 text-green-600' },
        'Rejected': { label: 'Rejected', color: 'bg-red-100 text-red-600' },
    };
    const currentStatus = evidence?.status || 'To Do';
    
    return (
        <div className="border-b py-4">
            <p className="font-semibold text-slate-700">{sub.indicator_letter}. {sub.indicator_text}</p>
            {sub.guidance_text && <p className="text-xs text-slate-500 mt-1">Guidance: {sub.guidance_text}</p>}
            <div className="mt-3 flex items-center gap-4">
                <button onClick={onLinkEvidence} className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Link Evidence</button>
                <div className={`px-2 py-0.5 text-xs font-bold rounded-full ${statusMap[currentStatus].color}`}>{statusMap[currentStatus].label}</div>
                <span className="text-sm text-slate-400">{evidence?.links?.length || 0} evidence linked.</span>
            </div>
        </div>
    );
};

// --- Komponen Utama Kartu Kriteria ---
export default function CriterionCard({ criterion, user, userRole, supabase }) {
    const [activeTab, setActiveTab] = useState('Indicators');
    const [subIndicators, setSubIndicators] = useState([]);
    const [evidenceMap, setEvidenceMap] = useState({}); // Menggunakan map untuk akses cepat
    const [overallStatus, setOverallStatus] = useState('To Do');
    
    // State untuk mengelola modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubIndicator, setSelectedSubIndicator] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            const { data: subData } = await supabase.from('gstc_sub_indicators').select('*').eq('criterion_id', criterion.id).order('indicator_letter');
            if (subData) setSubIndicators(subData);

            if(subData?.length > 0) {
                const subIds = subData.map(s => s.id);
                const { data: evidenceData } = await supabase.from('evidence_submissions').select('*').in('sub_indicator_id', subIds).eq('destination_id', user.id);
                if (evidenceData) {
                    // Ubah array menjadi map untuk akses O(1)
                    const map = evidenceData.reduce((acc, ev) => {
                        acc[ev.sub_indicator_id] = ev;
                        return acc;
                    }, {});
                    setEvidenceMap(map);
                }
            }
        };
        fetchDetails();
    }, [criterion.id, user.id, supabase]);
    
    useEffect(() => {
        const allStatuses = subIndicators.map(sub => evidenceMap[sub.id]?.status || 'To Do');
        if (allStatuses.length === 0) { setOverallStatus('To Do'); return; }
        if (allStatuses.every(s => s === 'Done')) { setOverallStatus('Done'); }
        else if (allStatuses.some(s => s !== 'To Do')) { setOverallStatus('In Progress'); }
        else { setOverallStatus('To Do'); }
    }, [evidenceMap, subIndicators]);

    const handleOpenModal = (subIndicator) => {
        setSelectedSubIndicator(subIndicator);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSubIndicator(null);
    };

    const handleSaveEvidence = (newEvidence) => {
        setEvidenceMap(prev => ({
            ...prev,
            [newEvidence.sub_indicator_id]: newEvidence
        }));
    };

    const statusMap = { /* ... (sama seperti sebelumnya) ... */ };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                {/* ... (Header dan Navigasi Tab tetap sama) ... */}
                <div className="p-6">
                    {activeTab === 'Indicators' && (
                        <div className="space-y-2">
                            {subIndicators.map(sub => (
                                <SubIndicatorItem 
                                    key={sub.id} 
                                    sub={sub}
                                    evidence={evidenceMap[sub.id]}
                                    onLinkEvidence={() => handleOpenModal(sub)}
                                />
                            ))}
                        </div>
                    )}
                     {/* ... (Placeholder untuk tab lain) ... */}
                </div>
            </div>

            {/* Render Modal */}
            {isModalOpen && (
                <EvidenceModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    subIndicator={selectedSubIndicator}
                    existingEvidence={evidenceMap[selectedSubIndicator.id]}
                    user={user}
                    supabase={supabase}
                    onSave={handleSaveEvidence}
                />
            )}
        </>
    );
}