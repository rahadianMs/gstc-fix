"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilIcon, CheckIcon, XMarkIcon } from './Icons';

// Komponen untuk satu baris input link di dalam modal
const LinkInputRow = ({ link, onLinkChange, onConfirm, onEdit, onRemove, isOnlyLink }) => {
    return (
        <div className="flex items-center gap-2">
            <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={link.url}
                onChange={(e) => onLinkChange(e.target.value)}
                readOnly={link.isConfirmed}
                className={`w-full p-2 border rounded-lg transition-colors ${link.isConfirmed ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'border-slate-300'}`}
            />
            {link.isConfirmed ? (
                <button onClick={onEdit} className="p-2 text-slate-500 hover:text-emerald-600" title="Edit Link">
                    <PencilIcon className="w-5 h-5" />
                </button>
            ) : (
                <button onClick={onConfirm} disabled={!link.url} className="p-2 text-emerald-600 hover:text-emerald-800 disabled:text-slate-300 disabled:cursor-not-allowed" title="Konfirmasi Link">
                    <CheckIcon className="w-5 h-5" />
                </button>
            )}
            {!isOnlyLink && (
                <button onClick={onRemove} className="p-2 text-red-500 hover:text-red-700" title="Hapus Link">
                     <XMarkIcon className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

// Komponen Utama Modal
export default function EvidenceModal({ isOpen, onClose, subIndicator, existingEvidence, user, supabase, onSave }) {
    const [links, setLinks] = useState([{ id: Date.now(), url: '', isConfirmed: false }]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (existingEvidence?.links) {
            const loadedLinks = existingEvidence.links.map((url, i) => ({ id: Date.now() + i, url, isConfirmed: true }));
            setLinks(loadedLinks.length > 0 ? loadedLinks : [{ id: Date.now(), url: '', isConfirmed: false }]);
        } else {
            setLinks([{ id: Date.now(), url: '', isConfirmed: false }]);
        }
    }, [existingEvidence]);

    if (!isOpen) return null;

    const handleLinkChange = (id, newUrl) => setLinks(links.map(l => l.id === id ? { ...l, url: newUrl } : l));
    const handleConfirmLink = (id) => setLinks(links.map(l => l.id === id ? { ...l, isConfirmed: true } : l));
    const handleEditLink = (id) => setLinks(links.map(l => l.id === id ? { ...l, isConfirmed: false } : l));
    const handleAddLink = () => setLinks([...links, { id: Date.now(), url: '', isConfirmed: false }]);
    const handleRemoveLink = (id) => setLinks(links.filter(l => l.id !== id));

    const handleSubmit = async () => {
        setLoading(true);
        setMessage('');
        const confirmedLinks = links.filter(l => l.isConfirmed && l.url).map(l => l.url);
        
        const newStatus = confirmedLinks.length > 0 ? 'In Progress' : 'To Do';

        const { data, error } = await supabase
            .from('evidence_submissions')
            .upsert({ 
                sub_indicator_id: subIndicator.id, 
                destination_id: user.id, 
                links: confirmedLinks,
                status: newStatus,
                updated_at: new Date().toISOString()
            }, { onConflict: 'sub_indicator_id, destination_id' })
            .select()
            .single();

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            onSave(data); // Kirim data terbaru ke parent
            onClose(); // Tutup modal
        }
        setLoading(false);
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
                        <h3 className="text-lg font-bold text-slate-800">{subIndicator.indicator_letter.toUpperCase()}. {subIndicator.indicator_text}</h3>
                        <p className="text-sm text-slate-500 mt-1">{subIndicator.guidance_text}</p>
                    </header>
                    
                    <main className="p-6 space-y-4 overflow-y-auto">
                        <label className="block text-sm font-semibold text-slate-700">Link Evidence</label>
                        {links.map((link, index) => (
                            <LinkInputRow 
                                key={link.id} 
                                link={link}
                                onLinkChange={(value) => handleLinkChange(link.id, value)}
                                onConfirm={() => handleConfirmLink(link.id)}
                                onEdit={() => handleEditLink(link.id)}
                                onRemove={() => handleRemoveLink(link.id)}
                                isOnlyLink={links.length === 1}
                            />
                        ))}
                        <button onClick={handleAddLink} className="text-sm font-medium text-emerald-600 hover:text-emerald-800">+ Add another link</button>
                    </main>

                    <footer className="p-6 bg-slate-50 border-t flex justify-between items-center">
                        {message && <p className="text-sm text-red-600">{message}</p>}
                        <div className="flex-grow"></div>
                        <div className="flex gap-4">
                            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">Cancel</button>
                            <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-sm font-semibold text-white bg-[#22543d] rounded-lg hover:bg-[#1c4532] disabled:bg-slate-400">
                                {loading ? 'Saving...' : 'Save & Close'}
                            </button>
                        </div>
                    </footer>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}