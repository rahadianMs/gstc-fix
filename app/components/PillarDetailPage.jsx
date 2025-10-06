"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilIcon, CheckIcon, XMarkIcon } from './Icons';

// --- Komponen untuk satu baris input link ---
const LinkInputRow = ({ link, onLinkChange, onConfirm, onEdit, onRemove, isOnlyLink, isLocked }) => {
    return (
        <div className="flex items-center gap-2">
            <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={link.url}
                onChange={(e) => onLinkChange(e.target.value)}
                readOnly={link.isConfirmed || isLocked}
                className={`w-full p-2 border rounded-lg transition-colors ${link.isConfirmed || isLocked ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'border-slate-300'}`}
            />
            {isLocked ? (
                <div className="p-2 text-slate-400" title="Terkunci">
                    <PencilIcon className="w-5 h-5" />
                </div>
            ) : link.isConfirmed ? (
                <button onClick={onEdit} className="p-2 text-slate-500 hover:text-emerald-600" title="Edit Link">
                    <PencilIcon className="w-5 h-5" />
                </button>
            ) : (
                <button onClick={onConfirm} className="p-2 text-emerald-600 hover:text-emerald-800" title="Konfirmasi Link">
                    <CheckIcon className="w-5 h-5" />
                </button>
            )}
            {!isOnlyLink && !isLocked && (
                <button onClick={onRemove} className="p-2 text-red-500 hover:text-red-700" title="Hapus Link">
                     <XMarkIcon className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

// --- Komponen untuk setiap kartu Indikator/Kriteria ---
const IndicatorCard = ({ indicator, subSectionTitle, user, supabase }) => {
    const [links, setLinks] = useState([{ id: Date.now(), url: '', isConfirmed: false }]);
    const [status, setStatus] = useState('pending');
    const [consultantComment, setConsultantComment] = useState('');

    useEffect(() => {
        const fetchEvidence = async () => {
            const { data } = await supabase
                .from('compliance_evidence')
                .select('evidence_link, status, consultant_comment')
                .eq('destination_id', user.id)
                .eq('indicator_id', indicator.id)
                .single();

            if (data) {
                const loadedLinks = data.evidence_link?.map((url, i) => ({ id: Date.now() + i, url, isConfirmed: true })) || [{ id: Date.now(), url: '', isConfirmed: false }];
                setLinks(loadedLinks);
                setStatus(data.status);
                setConsultantComment(data.consultant_comment);
            }
        };
        fetchEvidence();
    }, [indicator.id, user.id, supabase]);

    const handleLinkChange = (id, newUrl) => {
        setLinks(links.map(link => (link.id === id ? { ...link, url: newUrl } : link)));
    };

    const handleConfirmLink = (id) => {
        setLinks(links.map(link => (link.id === id ? { ...link, isConfirmed: true } : link)));
    };

    const handleEditLink = (id) => {
        setLinks(links.map(link => (link.id === id ? { ...link, isConfirmed: false } : link)));
    };
    
    const handleAddLink = () => {
        setLinks([...links, { id: Date.now(), url: '', isConfirmed: false }]);
    };
    
    const handleRemoveLink = (id) => {
        setLinks(links.filter(link => link.id !== id));
    };

    const handleFinalSubmit = async () => {
        const confirmedLinks = links.filter(link => link.isConfirmed && link.url).map(link => link.url);
        if (confirmedLinks.length === 0) {
            alert("Harap konfirmasi setidaknya satu link sebelum submit.");
            return;
        }

        setStatus('on_review');
        const { error } = await supabase
            .from('compliance_evidence')
            .upsert({ 
                destination_id: user.id, 
                indicator_id: indicator.id, 
                evidence_link: confirmedLinks,
                status: 'on_review',
                consultant_comment: null,
                updated_at: new Date().toISOString()
            }, { onConflict: 'destination_id, indicator_id' });

        if (error) {
            alert(`Gagal menyimpan data: ${error.message}`);
            setStatus('pending');
        }
    };
    
    const handleReSubmit = () => {
        setStatus('pending');
        setLinks(links.map(link => ({...link, isConfirmed: false})));
    };

    const statusStyles = {
        pending: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Belum Diisi' },
        on_review: { bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'On Review' },
        approved: { bg: 'bg-green-100', text: 'text-green-600', label: 'Disetujui' },
        rejected: { bg: 'bg-red-100', text: 'text-red-600', label: 'Ditolak' },
    };
    
    const isLocked = status === 'on_review' || status === 'approved';

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-start gap-4 border-b pb-4">
                <div>
                    <p className="text-sm font-semibold text-emerald-700">{indicator.indicator_code} | {subSectionTitle}</p>
                    <h4 className="text-lg font-bold text-slate-800 mt-1">{indicator.indicator_text}</h4>
                </div>
                <div className={`flex-shrink-0 px-3 py-1 text-xs font-bold rounded-full ${statusStyles[status].bg} ${statusStyles[status].text}`}>
                    {statusStyles[status].label}
                </div>
            </div>
            
            {(status === 'rejected' && consultantComment) && (
                 <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                    <p className="text-sm font-semibold text-red-800">Komentar Konsultan (Perlu Revisi):</p>
                    <p className="text-sm text-red-700">{consultantComment}</p>
                </div>
            )}
             {(status === 'approved' && consultantComment) && (
                 <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                    <p className="text-sm font-semibold text-green-800">Komentar Konsultan:</p>
                    <p className="text-sm text-green-700">{consultantComment}</p>
                </div>
            )}

            <div className="mt-4 space-y-3">
                <label className="block text-sm font-medium text-slate-600">Tautan Bukti:</label>
                {links.map((link) => (
                    <LinkInputRow 
                        key={link.id} 
                        link={link}
                        onLinkChange={(value) => handleLinkChange(link.id, value)}
                        onConfirm={() => handleConfirmLink(link.id)}
                        onEdit={() => handleEditLink(link.id)}
                        onRemove={() => handleRemoveLink(link.id)}
                        isOnlyLink={links.length === 1}
                        isLocked={isLocked}
                    />
                ))}
                {!isLocked && status !== 'rejected' && (
                    <button onClick={handleAddLink} className="text-sm font-medium text-emerald-600 hover:text-emerald-800">+ Tambah link</button>
                )}
            </div>

            <div className="mt-6 flex justify-end">
                 {(status === 'pending' || (status === 'rejected' && links.some(l => !l.isConfirmed))) && (
                    <button onClick={handleFinalSubmit} className="px-5 py-2 text-sm font-semibold text-white bg-[#22543d] rounded-lg hover:bg-[#1c4532]">
                        Submit Final
                    </button>
                 )}
                 {status === 'rejected' && links.every(l => l.isConfirmed) && (
                    <button onClick={handleReSubmit} className="px-5 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600">
                        Ajukan Revisi
                    </button>
                 )}
            </div>
        </div>
    );
};

// Komponen Utama Halaman
export default function PillarDetailPage({ pillar, supabase, user }) {
    const [indicators, setIndicators] = useState([]);
    const [loading, setLoading] = useState(true);

    const subSections = {
        'A': { 'A(a)': 'Struktur dan kerangka pengelolaan', 'A(b)': 'Pelibatan pemangku-kepentingan', 'A(c)': 'Mengelola tekanan dan perubahan' },
        'B': { 'B(a)': 'Memberikan manfaat ekonomi lokal', 'B(b)': 'Kesejahteraan dan dampak sosial' },
        'C': { 'C(a)': 'Pelindungan warisan budaya', 'C(b)': 'Mengunjungi situs budaya' },
        'D': { 'D(a)': 'Konservasi warisan alam', 'D(b)': 'Pengelolaan sumberdaya', 'D(c)': 'Pengelolaan limbah dan emisi' }
    };
    
    const getSubSection = (indicatorCode) => {
        const codeNumber = parseInt(indicatorCode.substring(1));
        const p = indicatorCode.charAt(0);
        if (p === 'A') {
            if (codeNumber <= 3) return 'A(a)'; if (codeNumber <= 7) return 'A(b)'; return 'A(c)';
        }
        if (p === 'B') {
            if (codeNumber <= 3) return 'B(a)'; return 'B(b)';
        }
        if (p === 'C') {
            if (codeNumber <= 5) return 'C(a)'; return 'C(b)';
        }
        if (p === 'D') {
            if (codeNumber <= 4) return 'D(a)'; if (codeNumber <= 7) return 'D(b)'; return 'D(c)';
        }
        return '';
    };

    useEffect(() => {
        const fetchIndicators = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('gstc_indicators').select('*').eq('pillar', pillar).order('id');
            if (!error) setIndicators(data);
            setLoading(false);
        };
        fetchIndicators();
    }, [pillar, supabase]);

    return (
        <div>
            {loading ? <p className="text-center p-8">Memuat indikator...</p> : (
                <div className="space-y-8">
                    {indicators.map(indicator => (
                        <IndicatorCard 
                            key={indicator.id} 
                            indicator={indicator}
                            subSectionTitle={subSections[pillar][getSubSection(indicator.indicator_code)]}
                            user={user}
                            supabase={supabase}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}