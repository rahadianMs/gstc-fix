"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default function ConsultantBookingModal({ isOpen, onClose, booking, supabase, onActionComplete }) {
    const [notes, setNotes] = useState(booking?.consultant_notes || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleAction = async (actionType) => {
        setLoading(true);
        setMessage('');

        if (actionType === 'approve') {
            const { error } = await supabase.rpc('approve_booking_session', {
                p_booking_id: booking.id,
                p_consultant_notes: notes,
            });
            if (error) setMessage(`Gagal menyetujui sesi: ${error.message}`);
            else {
                onActionComplete();
                onClose();
            }
        } else if (actionType === 'reject') {
            const { error } = await supabase.from('booking_sessions').update({ status: 'Ditolak', consultant_notes: notes }).eq('id', booking.id);
            if (error) setMessage(`Gagal menolak sesi: ${error.message}`);
            else {
                onActionComplete();
                onClose();
            }
        }
        setLoading(false);
    };

    // --- FUNGSI BARU UNTUK MENGHAPUS ---
    const handleDelete = async () => {
        const isConfirmed = window.confirm(`Apakah Anda yakin ingin menghapus sesi booking untuk "${booking.topic}"? Tindakan ini tidak dapat diurungkan.`);
        if (isConfirmed) {
            setLoading(true);
            const { error } = await supabase.from('booking_sessions').delete().eq('id', booking.id);
            if (error) {
                setMessage(`Gagal menghapus sesi: ${error.message}`);
                setLoading(false);
            } else {
                onActionComplete();
                onClose();
            }
        }
    };

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                    <header className="p-6 border-b flex justify-between items-start">
                        <div>
                           <h3 className="text-xl font-bold text-slate-800">Review Sesi Konsultasi</h3>
                           <p className="text-sm text-slate-500">Dari: {booking.profiles.destination_name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100"><CloseIcon /></button>
                    </header>
                    
                    <main className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <p><strong>Topik:</strong> {booking.topic}</p>
                        {/* --- TAMPILKAN DESKRIPSI --- */}
                        {booking.description && (
                            <div>
                                <p><strong>Deskripsi:</strong></p>
                                <p className="text-sm text-slate-600 p-3 bg-slate-50 rounded-md border mt-1 whitespace-pre-wrap">{booking.description}</p>
                            </div>
                        )}
                        <p><strong>Tanggal Diajukan:</strong> {new Date(booking.requested_date + 'T00:00:00Z').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}</p>
                        <p><strong>Slot Waktu:</strong> {booking.time_slot}</p>
                        <p><strong>Kontak WA:</strong> {booking.contact_wa}</p>
                        <div>
                            <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 mb-1">Catatan / Link Meeting</label>
                            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows="4" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Contoh: Link Google Meet: https://meet.google.com/..."></textarea>
                        </div>
                        {message && <p className="text-sm text-red-500">{message}</p>}
                    </main>

                    <footer className="p-6 bg-slate-50 border-t flex justify-between items-center">
                        {/* --- TOMBOL HAPUS BARU --- */}
                        <button onClick={handleDelete} disabled={loading} className="px-5 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50">
                            {loading ? '...' : 'Hapus'}
                        </button>
                        <div className="flex gap-4">
                            <button onClick={() => handleAction('reject')} disabled={loading} className="px-5 py-2 text-sm font-medium bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200">
                                {loading ? '...' : 'Tolak'}
                            </button>
                            <button onClick={() => handleAction('approve')} disabled={loading} className="px-5 py-2 text-sm font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                               {loading ? '...' : 'Setujui Sesi'}
                            </button>
                        </div>
                    </footer>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}