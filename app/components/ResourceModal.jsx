// app/components/ResourceModal.jsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default function ResourceModal({ isOpen, onClose, onSave, supabase, user, resourceToEdit }) {
    const isEditMode = Boolean(resourceToEdit);

    const [formData, setFormData] = useState({
        type: 'video',
        category: '',
        title: '',
        description: '',
        full_description: '',
        resource_url: '',
        image_url: '',
        duration: '',
        is_published: true,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && resourceToEdit) {
                setFormData({
                    type: resourceToEdit.type || 'video',
                    category: resourceToEdit.category || '',
                    title: resourceToEdit.title || '',
                    description: resourceToEdit.description || '',
                    full_description: resourceToEdit.full_description || '',
                    resource_url: resourceToEdit.resource_url || '',
                    image_url: resourceToEdit.image_url || '',
                    duration: resourceToEdit.duration || '',
                    is_published: resourceToEdit.is_published,
                });
            } else {
                setFormData({
                    type: 'video', category: '', title: '', description: '',
                    full_description: '', resource_url: '', image_url: '',
                    duration: '', is_published: true
                });
            }
        }
    }, [resourceToEdit, isEditMode, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (publishAction) => {
        setLoading(true);
        setMessage('');

        const dataToSubmit = {
            ...formData,
            created_by: user.id,
            is_published: publishAction === 'publish',
            image_url: formData.image_url || null,
            duration: formData.duration || null,
            full_description: formData.full_description || null,
        };

        const { error } = isEditMode
            ? await supabase.from('learning_resources').update(dataToSubmit).eq('id', resourceToEdit.id)
            : await supabase.from('learning_resources').insert(dataToSubmit);

        if (error) {
            setMessage(`Gagal menyimpan: ${error.message}`);
        } else {
            onSave();
        }
        setLoading(false);
    };
    
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
             const hasUnsavedChanges = formData.title !== '' || formData.resource_url !== '';
             if (hasUnsavedChanges) {
                const confirmClose = window.confirm("Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin menutup?");
                if (confirmClose) onClose();
             } else {
                onClose();
             }
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={handleOverlayClick}>
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <header className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Materi' : 'Tambah Materi Baru'}</h3>
                            <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100"><CloseIcon /></button>
                        </header>
                        
                        {/* --- PERBAIKAN STRUKTUR ADA DI SINI --- */}
                        <div className="overflow-y-auto">
                            <form>
                                <main className="p-8 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Tipe Konten *</label>
                                        <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                                            <option value="video">Video (YouTube)</option>
                                            <option value="pdf">PDF</option>
                                            <option value="website">Website/Artikel</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Judul *</label>
                                        <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 border border-slate-300 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                                        <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Tampil di kartu materi"></textarea>
                                    </div>
                                    
                                    {formData.type === 'video' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi Lengkap (Opsional)</label>
                                            <textarea name="full_description" value={formData.full_description} onChange={handleChange} rows="5" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Tampil di halaman detail video"></textarea>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">URL Sumber Daya *</label>
                                        <input type="url" name="resource_url" value={formData.resource_url} onChange={handleChange} required className="w-full p-2 border border-slate-300 rounded-lg" placeholder={formData.type === 'video' ? 'https://www.youtube.com/watch?v=xxxx' : 'https://...'} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori</label>
                                            <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Contoh: Policy"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">URL Gambar Thumbnail</label>
                                            <input type="url" name="image_url" value={formData.image_url} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Opsional"/>
                                        </div>
                                    </div>
                                    {formData.type === 'video' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Durasi Video</label>
                                            <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Contoh: 12 min"/>
                                        </div>
                                    )}
                                    {message && <p className="text-sm text-red-500">{message}</p>}
                                </main>

                                <footer className="p-6 bg-slate-50 border-t flex justify-end items-center gap-4 sticky bottom-0">
                                    <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">Batal</button>
                                    <button type="button" onClick={() => handleFormSubmit('draft')} disabled={loading} className="px-6 py-2 text-sm font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-200">
                                        {loading ? 'Menyimpan...' : 'Simpan sebagai Draf'}
                                    </button>
                                    <button type="button" onClick={() => handleFormSubmit('publish')} disabled={loading} className="px-6 py-2 text-sm font-semibold text-white rounded-lg" style={{backgroundColor: '#1c3d52'}}>
                                        {loading ? 'Memproses...' : (isEditMode && formData.is_published) ? 'Simpan Perubahan' : 'Publikasikan'}
                                    </button>
                                </footer>
                            </form>
                        </div>
                         {/* --- AKHIR PERBAIKAN STRUKTUR --- */}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}