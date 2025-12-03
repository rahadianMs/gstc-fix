"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation'; 
import { ShieldCheckIcon, BellIcon } from './Icons';
import ComplianceProgress from './ComplianceProgress';
import ProgressHeatmap from './ProgressHeatmap';
import NotificationPanel from './NotificationPanel';
import { AnimatePresence } from 'framer-motion';

export default function BerandaPage({ user, supabase, dataVersion }) {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);
    const notificationRef = useRef(null);

    useEffect(() => { setHasUnread(notifications.some(n => !n.is_read)); }, [notifications]);
    
    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) setNotifications(data);
    }, [supabase, user]);

    useEffect(() => {
        fetchNotifications();
        const channel = supabase.channel('public:notifications').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => { setNotifications(c => [payload.new, ...c]); }).subscribe();
        return () => supabase.removeChannel(channel);
    }, [supabase, user, fetchNotifications]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            setLoading(true);
            const { data } = await supabase.from('profiles').select('destination_name').eq('id', user.id).single();
            if (data) setProfile(data);
            setLoading(false);
        };
        fetchProfile();
    }, [user, supabase, dataVersion]);

    const handleNotificationClick = (notification) => {
        let targetUrl = '/dashboard'; 
        const linkKey = notification.link_to || '';

        if (linkKey.startsWith('compliance-')) {
            const pillarPart = linkKey.split('-')[1];
            targetUrl = `/dashboard/compliance/${pillarPart}`;
        } else {
            const staticMap = {
                'action-plan': '/dashboard/action-plan',
                'standard-compliance': '/dashboard/compliance',
                'booking-session': '/dashboard/bookings',
                'resource-admin': '/dashboard/resources',
                'pembelajaran': '/dashboard/resources',
                'home': '/dashboard'
            };
            if (staticMap[linkKey]) targetUrl = staticMap[linkKey];
            else if (linkKey) targetUrl = `/dashboard/${linkKey}`;
        }

        router.push(targetUrl);

        if (!notification.is_read) {
            setNotifications(current => current.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
            supabase.from('notifications').update({ is_read: true }).eq('id', notification.id).then();
        }
        setIsNotificationPanelOpen(false);
    };

    const handleNavigation = (path) => {
        router.push(path);
    };

    const handleBellClick = () => setIsNotificationPanelOpen(prev => !prev);
    
    const handleMarkAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;
        setNotifications(c => c.map(n => ({ ...n, is_read: true })));
        await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    };

    useEffect(() => {
        function handleClickOutside(event) { if (notificationRef.current && !notificationRef.current.contains(event.target)) setIsNotificationPanelOpen(false); }
        document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [notificationRef]);

    const staticBgImage = "https://cdn.prod.website-files.com/66fab24d6dde4d79b3b50865/678258d8a57c03a93b723b53_NUSA%20DUA.webp";

    return (
        <div className="space-y-8">
            <div className="relative p-8 rounded-2xl text-white bg-cover bg-center min-h-[200px] flex flex-col justify-end" style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1)), url('${staticBgImage}')` }}>
                <div ref={notificationRef}>
                    <button onClick={handleBellClick} className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10">
                        <BellIcon />
                        {hasUnread && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
                    </button>
                    <AnimatePresence>
                        {isNotificationPanelOpen && (
                            <NotificationPanel notifications={notifications} supabase={supabase} onUpdateNotifications={setNotifications} onClose={() => setIsNotificationPanelOpen(false)} onNotificationClick={handleNotificationClick} onMarkAllAsRead={handleMarkAllAsRead} hasUnread={hasUnread} />
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
                        <button onClick={() => handleNavigation('/dashboard/guide')} className="text-sm font-medium text-slate-500 hover:text-emerald-700">Baca Panduan</button>
                        <button onClick={() => handleNavigation('/dashboard/compliance/a')} className="w-full md:w-auto px-6 py-3 text-base font-semibold text-white rounded-lg transition-colors flex items-center gap-2" style={{backgroundColor: '#3f545f'}}>
                            <ShieldCheckIcon />
                            Lihat Standar Kepatuhan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}