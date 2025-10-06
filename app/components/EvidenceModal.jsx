"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilIcon, CheckIcon, XMarkIcon } from './Icons'; // Pastikan ikon ini ada di Icons.jsx

// --- Ikon Baru untuk Peringatan ---
const AlertTriangleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

// --- Komponen Utama Modal ---
export default function EvidenceModal({ isOpen, onClose, subIndicator, existingEvidence, user, supabase, onSave }) {
    const [links, setLinks] = useState([{ id: Date.now(), url: '' }]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

    useEffect(() => {
        // Jika ada bukti yang sudah ada, muat link-nya
        if (existingEvidence?.links && existingEvidence.links.length > 0) {
            setLinks(existingEvidence.links.map((url, i) => ({ id: Date.now() + i, url })));
        } else {
            setLinks([{ id: Date.now(), url: '' }]);
        }
    }, [existingEvidence]);

    if (!isOpen) return null;

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
    
    // Fungsi untuk menangani SEMUA aksi simpan/update ke database
    const handleSave = async (newStatus) => {
        setLoading(true);
        setMessage('');

        const finalLinks = links.filter(l => l.url.trim() !== '').map(l => l.url.trim());

        // Tentukan status baru berdasarkan aksi dan jumlah link
        let statusToSave = newStatus;
        if (newStatus === 'In Progress' && finalLinks.length === 0) {
            statusToSave = 'To Do'; // Kembali ke To Do jika draf kosong
        }

        const submissionData = {
            sub_indicator_id: subIndicator.id,
            destination_id: user.id,
            links: finalLinks,
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
            onSave(data); // Kirim data terbaru ke parent
            onClose();     // Tutup modal
        }

        setLoading(false);
        setShowSubmitConfirm(false);
    };


    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <header className="p-6 border-b">
                        <h3 className="text-lg font-bold text-slate-800">{subIndicator.indicator_letter}. {subIndicator.indicator_text}</h3>
                        <p className="text-sm text-slate-500 mt-1">{subIndicator.guidance_text}</p>
                    </header>
                    
                    <main className="p-6 space-y-4 overflow-y-auto">
                        <label className="block text-sm font-semibold text-slate-700">Tautan Bukti (Google Drive, Dropbox, dll.)</label>
                        {links.map((link) => (
                            <div key={link.id} className="flex items-center gap-2">
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={link.url}
                                    onChange={(e) => handleLinkChange(link.id, e.target.value)}
                                    className="w-full p-2 border rounded-lg transition-colors border-slate-300 focus:ring-2 focus:ring-[#3f545f]"
                                />
                                <button 
                                    onClick={() => handleRemoveLink(link.id)} 
                                    className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-50" 
                                    title="Hapus Link"
                                    disabled={links.length <= 1}
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        <button onClick={handleAddLink} className="text-sm font-medium hover:underline" style={{color: '#3f545f'}}>
                            + Tambah tautan lain
                        </button>
                        
                        {message && <p className="text-sm text-red-600 mt-2">{message}</p>}

                        {/* --- KOTAK PERINGATAN KONFIRMASI --- */}
                        {showSubmitConfirm && (
                             <div className="mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                                <div className="flex items-start gap-3">
                                    <AlertTriangleIcon />
                                    <div>
                                        <h4 className="font-bold text-yellow-800">Konfirmasi Pengajuan</h4>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Setelah diajukan, Anda **tidak dapat mengubah tautan bukti** sampai konsultan selesai mereview. Pastikan tautan sudah dapat diakses oleh publik (public).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>

                    <footer className="p-6 bg-slate-50 border-t flex justify-between items-center">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">
                            Batal
                        </button>
                        
                        <div className="flex gap-4">
                            {!showSubmitConfirm ? (
                                <>
                                    <button 
                                        onClick={() => handleSave('In Progress')} 
                                        disabled={loading} 
                                        className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-200 disabled:bg-slate-100"
                                    >
                                        {loading ? 'Menyimpan...' : 'Simpan sebagai Draf'}
                                    </button>
                                    <button 
                                        onClick={() => setShowSubmitConfirm(true)} 
                                        disabled={loading || links.every(l => l.url.trim() === '')}
                                        className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{backgroundColor: '#3f545f'}}
                                    >
                                        Ajukan untuk Review
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => setShowSubmitConfirm(false)} 
                                        disabled={loading}
                                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300"
                                    >
                                        Kembali
                                    </button>
                                    <button 
                                        onClick={() => handleSave('In Review')} 
                                        disabled={loading}
                                        className="px-4 py-2 text-sm font-semibold text-white bg-yellow-600 rounded-lg hover:bg-yellow-700"
                                    >
                                        {loading ? 'Mengajukan...' : 'Ya, Ajukan Sekarang'}
                                    </button>
                                </>
                            )}
                        </div>
                    </footer>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}