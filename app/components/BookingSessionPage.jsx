"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BookingModal from './BookingModal'; 
import ConsultantBookingModal from './ConsultantBookingModal';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default function BookingSessionPage({ supabase, user, userRole }) {
    const [bookings, setBookings] = useState([]);
    const [bookingQuota, setBookingQuota] = useState(0);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConsultantModalOpen, setIsConsultantModalOpen] = useState(false);

    const fetchBookingData = async () => {
        if (!user) return;
        setLoading(true);

        if (userRole === 'destination') {
            const { data: profileData } = await supabase.from('profiles').select('booking_quota').eq('id', user.id).single();
            if (profileData) setBookingQuota(profileData.booking_quota);

            const { data: bookingsData } = await supabase.from('booking_sessions').select('*').eq('destination_id', user.id).order('created_at', { ascending: false });
            setBookings(bookingsData || []);

        } else if (userRole === 'consultant') {
            const { data: bookingsData } = await supabase.from('booking_sessions').select('*, profiles (destination_name)').order('created_at', { ascending: false });
            setBookings(bookingsData || []);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchBookingData();
    }, [supabase, user, userRole]);
    
    const getStatusStyles = (status) => {
        switch (status) {
            case 'Menunggu Persetujuan': return 'bg-yellow-100 text-yellow-800';
            case 'Disetujui': return 'bg-green-100 text-green-800';
            case 'Ditolak': return 'bg-red-100 text-red-800';
            case 'Selesai': return 'bg-slate-100 text-slate-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const formatDate = (dateString, timeSlot) => {
        const date = new Date(dateString + 'T00:00:00Z');
        const timeMap = { 'Pagi': '08:30', 'Siang': '13:30', 'Sore': '15:30' };
        return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(date) + ` pukul ${timeMap[timeSlot] || ''}`;
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setIsConsultantModalOpen(false);
        fetchBookingData();
    };
    
    if (userRole === 'consultant') {
        return (
             <>
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-slate-800">Review Booking Sessions</h1>
                    <p className="mt-2 text-lg text-slate-600">Kelola permintaan sesi konsultasi yang masuk dari semua destinasi.</p>
                </div>
                <div className="mt-8 bg-white rounded-xl shadow-md border overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                         <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Destinasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tanggal & Waktu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Topik</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                             {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Memuat permintaan...</td></tr>
                            ) : bookings.map(booking => (
                                <tr key={booking.id}>
                                    <td className="px-6 py-4 font-semibold">{booking.profiles?.destination_name}</td>
                                    <td className="px-6 py-4">{formatDate(booking.requested_date, booking.time_slot)}</td>
                                    <td className="px-6 py-4">{booking.topic}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusStyles(booking.status)}`}>{booking.status}</span></td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => { setSelectedBooking(booking); setIsConsultantModalOpen(true); }} className="px-3 py-1 text-sm font-semibold text-white rounded-lg disabled:bg-slate-300 disabled:cursor-not-allowed" style={{backgroundColor: '#1c3d52'}}>
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <AnimatePresence>
                    {isConsultantModalOpen && (
                        <ConsultantBookingModal isOpen={isConsultantModalOpen} onClose={handleModalClose} booking={selectedBooking} supabase={supabase} onActionComplete={fetchBookingData} />
                    )}
                </AnimatePresence>
            </>
        );
    }
    
    return (
        <>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-800">Consultation Session</h1>
                        <p className="mt-2 text-lg text-slate-600">Atur dan jadwalkan sesi konsultasi Anda.</p>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="text-right">
                            <span className="text-sm font-semibold text-slate-500">Session Quota</span>
                            <p className="text-2xl font-bold" style={{color: '#1c3d52'}}>{loading ? '...' : bookingQuota}</p>
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-3 font-semibold text-white rounded-lg shadow-md transition-transform active:scale-95" style={{backgroundColor: '#1c3d52'}}>
                            <PlusIcon />
                            Request Session
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-md border">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Session History</h2>
                        {loading ? <p className="text-slate-500">Memuat riwayat...</p> : bookings.length > 0 ? (
                            <div className="space-y-3">
                                {bookings.map(booking => (
                                    <button key={booking.id} onClick={() => setSelectedBooking(booking)} className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedBooking?.id === booking.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-slate-50'}`}>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-slate-700">{booking.topic || 'Sesi Konsultasi'}</h3>
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusStyles(booking.status)}`}>{booking.status}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">{formatDate(booking.requested_date, booking.time_slot)}</p>
                                    </button>
                                ))}
                            </div>
                        ) : <p className="text-sm text-slate-500 text-center mt-8">Belum ada riwayat sesi.</p>}
                    </div>
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md border flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div key={selectedBooking ? selectedBooking.id : 'empty'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="w-full">
                                {selectedBooking ? (
                                    <div className="text-left">
                                        <div className="flex justify-between items-center mb-6 pb-4 border-b">
                                            <h2 className="text-2xl font-bold text-slate-800">{selectedBooking.topic || 'Sesi Konsultasi'}</h2>
                                            <span className={`px-3 py-1 text-sm font-bold rounded-full ${getStatusStyles(selectedBooking.status)}`}>{selectedBooking.status}</span>
                                        </div>
                                        <div className="space-y-4 text-slate-700">
                                            <p><strong>Tanggal & Waktu Diajukan:</strong> {formatDate(selectedBooking.requested_date, selectedBooking.time_slot)}</p>
                                            <p><strong>Kontak WA:</strong> {selectedBooking.contact_wa}</p>
                                            {/* --- TAMPILKAN DESKRIPSI --- */}
                                            {selectedBooking.description && (
                                                <div>
                                                    <p><strong>Deskripsi:</strong></p>
                                                    <p className="text-sm p-3 bg-slate-50 rounded-md mt-1 border whitespace-pre-wrap">{selectedBooking.description}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p><strong>Catatan Konsultan:</strong></p>
                                                <p className="p-3 bg-slate-50 rounded-md mt-1 border">{selectedBooking.consultant_notes || (selectedBooking.status === 'Menunggu Persetujuan' ? 'Belum ada catatan dari konsultan.' : '-')}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-500">
                                        <ClockIcon />
                                        <h3 className="font-semibold mt-4">Select a session</h3>
                                        <p>Pilih sesi dari daftar untuk melihat detailnya, atau ajukan sesi baru.</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {isModalOpen && (
                    <BookingModal isOpen={isModalOpen} onClose={handleModalClose} supabase={supabase} user={user} />
                )}
            </AnimatePresence>
        </>
    );
}