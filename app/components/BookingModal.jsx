"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default function BookingModal({ isOpen, onClose, supabase, user }) {
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState(''); // <-- STATE BARU
    const [requestedDate, setRequestedDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [contactWa, setContactWa] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const resetForm = () => {
        setTopic('');
        setDescription(''); // <-- RESET STATE BARU
        setRequestedDate('');
        setTimeSlot('');
        setContactWa('');
        setMessage({ type: '', text: '' });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        const selectedDay = new Date(requestedDate).getDay();
        if (selectedDay === 0 || selectedDay === 6) {
            setMessage({ type: 'error', text: 'Sesi konsultasi hanya tersedia pada hari kerja (Senin-Jumat).' });
            return;
        }

        setLoading(true);

        const { error } = await supabase
            .from('booking_sessions')
            .insert({
                destination_id: user.id,
                topic: topic,
                description: description, // <-- TAMBAHKAN DATA BARU
                requested_date: requestedDate,
                time_slot: timeSlot,
                contact_wa: contactWa,
                status: 'Menunggu Persetujuan',
            });

        if (error) {
            setMessage({ type: 'error', text: `Gagal mengajukan sesi: ${error.message}` });
        } else {
            setMessage({ type: 'success', text: 'Sesi berhasil diajukan! Mohon tunggu konfirmasi dari konsultan.' });
            setTimeout(() => {
                handleClose();
            }, 2000);
        }

        setLoading(false);
    };
    
    const getTodayString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
                    <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <header className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800">Request a Consultation Session</h3>
                            <button onClick={handleClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100"><CloseIcon /></button>
                        </header>
                        
                        <div className="overflow-y-auto">
                            <form onSubmit={handleSubmit}>
                                <main className="p-8 space-y-4">
                                    <div>
                                        <label htmlFor="topic" className="block text-sm font-semibold text-slate-700 mb-1">Topik Konsultasi *</label>
                                        <input id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} required className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Contoh: Review Kriteria A1 & A2" />
                                    </div>

                                    {/* --- FIELD DESKRIPSI BARU --- */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi (Opsional)</label>
                                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Jelaskan lebih detail apa yang ingin Anda diskusikan..."></textarea>
                                    </div>
                                    {/* --------------------------- */}
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="requestedDate" className="block text-sm font-semibold text-slate-700 mb-1">Pilih Tanggal *</label>
                                            <input id="requestedDate" type="date" value={requestedDate} onChange={(e) => setRequestedDate(e.target.value)} required min={getTodayString()} className="w-full p-2 border border-slate-300 rounded-lg" />
                                        </div>
                                        <div>
                                            <label htmlFor="timeSlot" className="block text-sm font-semibold text-slate-700 mb-1">Pilih Sesi *</label>
                                            <select id="timeSlot" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} required className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                                                <option value="" disabled>Pilih slot waktu</option>
                                                <option value="Pagi">Pagi (08:30 - 10:00)</option>
                                                <option value="Siang">Siang (13:30 - 15:00)</option>
                                                <option value="Sore">Sore (15:30 - 17:00)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="contactWa" className="block text-sm font-semibold text-slate-700 mb-1">Nomor WhatsApp PIC *</label>
                                        <input id="contactWa" type="tel" value={contactWa} onChange={(e) => setContactWa(e.target.value)} required className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Contoh: 081234567890" />
                                    </div>

                                    {message.text && (
                                        <p className={`text-sm text-center p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {message.text}
                                        </p>
                                    )}
                                </main>

                                <footer className="flex-shrink-0 p-6 bg-slate-50 border-t flex justify-end items-center gap-4 sticky bottom-0">
                                    <button type="button" onClick={handleClose} className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">Batal</button>
                                    <button type="submit" disabled={loading || message.type === 'success'} className="px-6 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50" style={{backgroundColor: '#1c3d52'}}>
                                        {loading ? 'Mengirim...' : 'Kirim Permintaan'}
                                    </button>
                                </footer>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}