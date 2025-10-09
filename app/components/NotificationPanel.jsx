// app/components/NotificationPanel.jsx
"use client";

import { motion } from 'framer-motion';
import { BellIcon } from './Icons';

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

// PERBAIKAN: Menghapus prop onMarkAllAsRead
export default function NotificationPanel({ notifications, onClose, onNotificationClick }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-4 w-full max-w-sm bg-white rounded-xl shadow-2xl border z-20"
        >
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-bold text-lg text-slate-800">Notifikasi</h3>
                {/* Tombol "Tandai semua dibaca" dihapus dari sini */}
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <button
                            key={notif.id}
                            onClick={() => onNotificationClick(notif)}
                            className="w-full text-left p-4 hover:bg-slate-50 border-b last:border-b-0 flex items-start gap-3"
                        >
                            {/* Titik biru tetap ada sesaat sebelum state diperbarui */}
                            {!notif.is_read && (
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                            )}
                            <div className={`flex-1 ${notif.is_read ? 'pl-5' : ''}`}>
                                <p className={`text-sm text-slate-800 font-semibold`}>
                                    {notif.message}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    <TimeAgo date={notif.created_at} />
                                </p>
                            </div>
                        </button>
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