// app/components/NotificationPanel.jsx
"use client";

import { motion } from 'framer-motion';
import { BellIcon } from './Icons';

// --- Ikon Baru ---
const TrashIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;


function TimeAgo({ date }) {
    const now = new Date();
    const seconds = Math.floor((now - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} tahun lalu`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} bulan lalu`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} hari lalu`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} jam lalu`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} menit lalu`;
    return 'Baru saja';
}

// --- PERUBAHAN DI SINI: Menambahkan props baru ---
export default function NotificationPanel({ notifications, supabase, onUpdateNotifications, onClose, onNotificationClick, onMarkAllAsRead, hasUnread }) {

    // --- FUNGSI BARU UNTUK MENGHAPUS NOTIFIKASI ---
    const handleDeleteNotification = async (notificationId, event) => {
        event.stopPropagation(); // Mencegah klik agar tidak trigger navigasi

        // Panggil fungsi database 'delete_notification' via RPC
        const { error } = await supabase.rpc('delete_notification', {
            p_notification_id: notificationId
        });
        
        if (error) {
            console.error("RPC Error:", error);
            alert("Gagal menghapus notifikasi. Silakan coba lagi.");
        } else {
            // Jika berhasil, update state di komponen induk (BerandaPage)
            onUpdateNotifications(current => current.filter(n => n.id !== notificationId));
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-4 w-full max-w-sm bg-white rounded-xl shadow-2xl border z-20"
        >
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-bold text-lg text-slate-800">Notifikasi</h3>
                {hasUnread && (
                    <button 
                        onClick={onMarkAllAsRead} 
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                        Tandai semua dibaca
                    </button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <div key={notif.id} className="relative group border-b last:border-b-0">
                            <button
                                onClick={() => onNotificationClick(notif)}
                                className="w-full text-left p-4 hover:bg-slate-50 flex items-start gap-3"
                            >
                                <div className={`flex-shrink-0 mt-1.5 ${notif.is_read ? 'w-2.5' : ''}`}>
                                    {!notif.is_read && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm text-slate-800 ${!notif.is_read ? 'font-bold' : 'font-medium'}`}>
                                        {notif.message}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        <TimeAgo date={notif.created_at} />
                                    </p>
                                </div>
                            </button>
                            {/* --- TOMBOL HAPUS BARU --- */}
                            <button 
                                onClick={(e) => handleDeleteNotification(notif.id, e)}
                                className="absolute top-1/2 -translate-y-1/2 right-3 p-2 rounded-full text-slate-400 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                                title="Hapus notifikasi"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-slate-500">
                        <BellIcon />
                        <p className="mt-2 font-semibold">Tidak ada notifikasi</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}