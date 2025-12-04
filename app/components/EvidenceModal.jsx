"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from './Icons';

const AlertTriangleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const ExternalLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
);

export default function EvidenceModal({ isOpen, onClose, subIndicator, existingEvidence, user, supabase, onSave }) {
    const [links, setLinks] = useState([{ id: Date.now(), url: '' }]);
    const [note, setNote] = useState(''); // <-- State baru untuk catatan
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

    useEffect(() => {
        if (existingEvidence) {
            if (existingEvidence.links && existingEvidence.links.length > 0) {
                setLinks(existingEvidence.links.map((url, i) => ({ id: Date.now() + i, url })));
            } else {
                setLinks([{ id: Date.now(), url: '' }]);
            }
            // Set catatan jika ada
            setNote(existingEvidence.submission_note || '');
        } else {
            setLinks([{ id: Date.now(), url: '' }]);
            setNote('');
        }
    }, [existingEvidence]);

    if (!isOpen) return null;

    const currentStatus = existingEvidence?.status;
    const isLocked = currentStatus === 'In Review' || currentStatus === 'Done';

    const handleLinkChange = (id, newUrl) => {
        setLinks(links.map(l => (l.id === id ? { ...l, url: newUrl } : l)));
    };

    const handleAddLink = () => {
        setLinks([...links, { id: Date.now(), url: '' }]);
    };

    const handleRemoveLink = (id) => {
        if (links.length > 1) {
            setLinks(links.filter(l => l.id !== id));
        }
    };
    
    const handleCancelSubmission = async () => {
        if (!confirm("Apakah Anda yakin ingin membatalkan pengajuan?")) return;

        setLoading(true);
        const { data, error } = await supabase
            .from('evidence_submissions')
            .update({ status: 'In Progress', updated_at: new Date().toISOString() })
            .eq('id', existingEvidence.id)
            .select()
            .single();

        if (error) {
            setMessage(`Gagal membatalkan: ${error.message}`);
        } else {
            onSave(data);
        }
        setLoading(false);
    };

    const handleSaveData = async (submissionType) => {
        setLoading(true);
        setMessage('');

        const finalLinks = links.filter(l => l.url.trim() !== '').map(l => l.url.trim());

        let statusToSave = submissionType;
        if (submissionType === 'In Review' && existingEvidence?.status === 'Rejected') {
            statusToSave = 'Revision';
        }
        if (submissionType === 'In Progress' && finalLinks.length === 0) {
            statusToSave = 'To Do';
        }

        const submissionData = {
            sub_indicator_id: subIndicator.id,
            destination_id: user.id,
            links: finalLinks,
            submission_note: note, // <-- Simpan catatan ke database
            status: statusToSave,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('evidence_submissions')
            .upsert(submissionData, { onConflict: 'sub_indicator_id, destination_id' })
            .select()
            .single();

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            onSave(data);
            onClose();
        }

        setLoading(false);
        setShowSubmitConfirm(false);
    };

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <header className="p-6 border-b">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{subIndicator.indicator_letter}. {subIndicator.indicator_text}</h3>
                                {isLocked && <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded-full ${currentStatus === 'Done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>Status: {currentStatus === 'In Review' ? 'Sedang Direview' : 'Selesai'}</span>}
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="w-6 h-6"/></button>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">{subIndicator.guidance_text}</p>
                    </header>
                    
                    <main className="p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tautan Bukti</label>
                            {links.map((link) => (
                                <div key={link.id} className="flex items-center gap-3 mb-2">
                                    <div className="relative flex-grow">
                                        <input type="url" placeholder="https://..." value={link.url} onChange={(e) => handleLinkChange(link.id, e.target.value)} disabled={isLocked} className={`w-full p-2 pr-10 border rounded-lg transition-colors ${isLocked ? 'bg-slate-100 text-slate-500 border-slate-200' : 'border-slate-300 focus:ring-2 focus:ring-[#3f545f]'}`} />
                                        {link.url && <a href={link.url} target="_blank" rel="noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors" title="Buka Link"><ExternalLinkIcon /></a>}
                                    </div>
                                    {!isLocked && <button onClick={() => handleRemoveLink(link.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50" title="Hapus Link" disabled={links.length <= 1}><XMarkIcon className="w-5 h-5" /></button>}
                                </div>
                            ))}
                            {!isLocked && <button onClick={handleAddLink} className="text-sm font-medium hover:underline flex items-center gap-1" style={{color: '#3f545f'}}><span>+</span> Tambah tautan lain</button>}
                        </div>

                        {/* --- INPUT CATATAN TAMBAHAN --- */}
                        <div>
                            <label htmlFor="submissionNote" className="block text-sm font-semibold text-slate-700 mb-1">Catatan Tambahan / Detail Lokasi Bukti</label>
                            <textarea
                                id="submissionNote"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                disabled={isLocked}
                                rows="3"
                                className={`w-full p-3 border rounded-lg transition-colors text-sm ${isLocked ? 'bg-slate-100 text-slate-500 border-slate-200' : 'border-slate-300 focus:ring-2 focus:ring-[#3f545f]'}`}
                                placeholder="Contoh: Silakan cek halaman 12 paragraf 2 pada dokumen PDF."
                            ></textarea>
                        </div>

                        {message && <p className="text-sm text-red-600 mt-2">{message}</p>}
                        {currentStatus === 'In Review' && <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100">Bukti sedang ditinjau oleh konsultan.</div>}
                        
                        {showSubmitConfirm && (
                             <div className="mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                                <div className="flex items-start gap-3">
                                    <AlertTriangleIcon />
                                    <div>
                                        <h4 className="font-bold text-yellow-800">Konfirmasi Pengajuan</h4>
                                        <p className="text-sm text-yellow-700 mt-1">Pastikan tautan sudah benar dan dapat diakses publik.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>

                    <footer className="p-6 bg-slate-50 border-t flex justify-between items-center">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">Tutup</button>
                        <div className="flex gap-4">
                            {currentStatus === 'In Review' ? (
                                <button onClick={handleCancelSubmission} disabled={loading} className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">{loading ? 'Memproses...' : 'Batalkan Pengajuan'}</button>
                            ) : !isLocked ? (
                                !showSubmitConfirm ? (
                                    <>
                                        <button onClick={() => handleSaveData('In Progress')} disabled={loading} className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-200 disabled:bg-slate-100">{loading ? 'Menyimpan...' : 'Simpan Draft'}</button>
                                        <button onClick={() => setShowSubmitConfirm(true)} disabled={loading || links.every(l => l.url.trim() === '')} className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" style={{backgroundColor: '#3f545f'}}>Ajukan Review</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setShowSubmitConfirm(false)} disabled={loading} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">Kembali</button>
                                        <button onClick={() => handleSaveData('In Review')} disabled={loading} className="px-4 py-2 text-sm font-semibold text-white bg-yellow-600 rounded-lg hover:bg-yellow-700">{loading ? 'Mengajukan...' : 'Ya, Ajukan Sekarang'}</button>
                                    </>
                                )
                            ) : null}
                        </div>
                    </footer>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}