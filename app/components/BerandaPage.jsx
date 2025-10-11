// app/components/BerandaPage.jsx
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldCheckIcon, BellIcon } from './Icons';
import ComplianceProgress from './ComplianceProgress';
import ProgressHeatmap from './ProgressHeatmap';
import NotificationPanel from './NotificationPanel';
import { AnimatePresence } from 'framer-motion';

export default function BerandaPage({ user, supabase, setActiveDashboardPage, dataVersion }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);
    const notificationRef = useRef(null);

    useEffect(() => {
        setHasUnread(notifications.some(n => !n.is_read));
    }, [notifications]);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (data) setNotifications(data);
    }, [supabase, user]);

    useEffect(() => {
        fetchNotifications();
        const channel = supabase
            .channel('public:notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, 
            (payload) => {
                setNotifications(currentNotifications => [
                    payload.new,
                    ...currentNotifications
                ]);
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [supabase, user, fetchNotifications]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            setLoading(true);
            const { data: profileData } = await supabase.from('profiles').select('destination_name').eq('id', user.id).single();
            if (profileData) setProfile(profileData);
            setLoading(false);
        };
        fetchProfile();
    }, [user, supabase, dataVersion]);

    const handleNotificationClick = (notification) => {
        if (notification.link_to) {
            setActiveDashboardPage(notification.link_to);
        }
        if (!notification.is_read) {
            // Update UI optimis
            setNotifications(current => current.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
            // Update DB
            supabase.from('notifications').update({ is_read: true }).eq('id', notification.id).then();
        }
        setIsNotificationPanelOpen(false);
    };

    const handleBellClick = () => {
        setIsNotificationPanelOpen(prev => !prev);
    };

    const handleMarkAllAsRead = async () => {
        const unreadNotificationIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadNotificationIds.length === 0) return;
        setNotifications(current => current.map(n => ({ ...n, is_read: true })));
        const { error } = await supabase.from('notifications').update({ is_read: true }).in('id', unreadNotificationIds);
        if (error) {
            console.error("Gagal menandai semua notifikasi sebagai dibaca:", error);
            fetchNotifications(); 
        }
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationPanelOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [notificationRef]);

    const staticBgImage = "https://cdn.prod.website-files.com/66fab24d6dde4d79b3b50865/678258d8a57c03a93b723b53_NUSA%20DUA.webp";

    return (
        <div className="space-y-8">
            <div 
                className="relative p-8 rounded-2xl text-white bg-cover bg-center min-h-[200px] flex flex-col justify-end"
                style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1)), url('${staticBgImage}')` }}
            >
                <div ref={notificationRef}>
                    <button 
                        onClick={handleBellClick}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
                        title="Lihat Notifikasi"
                    >
                        <BellIcon />
                        {hasUnread && (
                            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>
                    <AnimatePresence>
                        {isNotificationPanelOpen && (
                            // --- PERUBAHAN DI SINI: Mengirim props baru ---
                            <NotificationPanel 
                                notifications={notifications}
                                supabase={supabase}
                                onUpdateNotifications={setNotifications}
                                onClose={() => setIsNotificationPanelOpen(false)}
                                onNotificationClick={handleNotificationClick}
                                onMarkAllAsRead={handleMarkAllAsRead}
                                hasUnread={hasUnread}
                            />
                        )}
                    </AnimatePresence>
                </div>
                
                <div className="relative z-0">
                    {loading ? <div className="h-10 bg-white/20 rounded-md animate-pulse w-3/4 mb-2"></div> : <h1 className="text-4xl font-extrabold drop-shadow-md">Selamat Datang, {profile?.destination_name || 'Rekan'}!</h1>}
                    <p className="mt-1 text-lg opacity-90 drop-shadow">Ini adalah pusat kendali Anda untuk menuju pariwisata berkelanjutan.</p>
                </div>
            </div>
            
            <ComplianceProgress supabase={supabase} user={user} />
            <ProgressHeatmap supabase={supabase} user={user} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3 bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                     <div>
                        <h3 className="text-xl font-bold text-slate-800">Mulai Penuhi Standar</h3>
                        <p className="text-slate-500 mt-1">Pilih pilar untuk mulai mengunggah bukti kepatuhan Anda.</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-4">
                        <button onClick={() => setActiveDashboardPage('panduan')} className="text-sm font-medium text-slate-500 hover:text-emerald-700">Baca Panduan</button>
                        <button onClick={() => setActiveDashboardPage('standard-compliance')} className="w-full md:w-auto px-6 py-3 text-base font-semibold text-white rounded-lg transition-colors flex items-center gap-2" style={{backgroundColor: '#3f545f'}}>
                            <ShieldCheckIcon />
                            Lihat Standar Kepatuhan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}