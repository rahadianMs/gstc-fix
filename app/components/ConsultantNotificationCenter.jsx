"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // <-- 1. Import Router
import { BellIcon } from './Icons';

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

// Hapus prop setActiveDashboardPage
export default function ConsultantNotificationCenter({ supabase, user }) {
    const router = useRouter(); // <-- 2. Inisialisasi Router
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        if (!user || !user.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100);
        
        if (data) setNotifications(data);
        setLoading(false);
    }, [supabase, user]);

    useEffect(() => {
        if (!user || !user.id) return;
        fetchNotifications();
        const channel = supabase
            .channel('public:notifications:consultant')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, 
            (payload) => {
                setNotifications(current => [payload.new, ...current]);
            })
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [supabase, user, fetchNotifications]);

    // --- 3. PERBAIKAN LOGIKA KLIK NOTIFIKASI ---
    const handleNotificationClick = async (notification) => {
        // Mapping halaman lama ke URL baru untuk Konsultan
        const linkMap = {
            'home': '/dashboard/consultant',
            'review-compliance': '/dashboard/consultant/review',
            'action-plan': '/dashboard/action-plan',
            'booking-session': '/dashboard/bookings',
            'pembelajaran': '/dashboard/resources',
            'resource-admin': '/dashboard/resources',
            'panduan': '/dashboard/guide'
        };

        const linkKey = notification.link_to || '';
        let targetUrl = '/dashboard/consultant'; // Default ke home konsultan

        if (linkMap[linkKey]) {
            targetUrl = linkMap[linkKey];
        } else if (linkKey.startsWith('review/')) {
            // Jika notifikasi berisi ID spesifik (misal: review/123), arahkan langsung
            targetUrl = `/dashboard/consultant/${linkKey}`;
        } else if (linkKey) {
            // Fallback: coba jadikan path langsung
            targetUrl = `/dashboard/${linkKey}`;
        }

        // Navigasi ke URL baru
        router.push(targetUrl);

        // Tandai sebagai sudah dibaca
        if (!notification.is_read) {
            setNotifications(current => current.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
            await supabase.from('notifications').update({ is_read: true }).eq('id', notification.id);
        }
    };
    // ---------------------------------------------
    
    const handleDeleteNotification = async (notificationId, event) => {
        event.stopPropagation();
        
        const { error } = await supabase.rpc('delete_notification', {
            p_notification_id: notificationId
        });
        
        if (error) {
            console.error("RPC Error:", error);
            // Fallback delete manual jika RPC tidak ada/gagal
            await supabase.from('notifications').delete().eq('id', notificationId);
        }
        
        setNotifications(current => current.filter(n => n.id !== notificationId));
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold text-xl text-slate-800 mb-4">Pusat Notifikasi</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
                {loading ? (
                    <p className="text-slate-500 text-center py-4">Memuat notifikasi...</p>
                ) : notifications.length > 0 ? (
                    notifications.map(notif => (
                        <div key={notif.id} className="relative group">
                            <button
                                onClick={() => handleNotificationClick(notif)}
                                className={`w-full text-left p-4 rounded-lg transition-colors flex items-start gap-3 ${notif.is_read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50 hover:bg-blue-100'}`}
                            >
                                <div className="mt-1 flex-shrink-0">
                                    {!notif.is_read && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm text-slate-800 ${!notif.is_read ? 'font-semibold' : ''}`}>{notif.message}</p>
                                    <p className="text-xs text-slate-400 mt-1"><TimeAgo date={notif.created_at} /></p>
                                </div>
                            </button>
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
                        <p className="mt-2 font-semibold">Tidak ada notifikasi baru</p>
                    </div>
                )}
            </div>
        </div>
    );
}