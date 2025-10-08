"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

// Pindahkan inisialisasi ke luar komponen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function HomePage() {
    const [session, setSession] = useState(null);
    const [activePage, setActivePage] = useState('landing');
    const [isLogin, setIsLogin] = useState(true);
    const [activeDashboardPage, setActiveDashboardPage] = useState('home');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session) {
                setActivePage('app');
            }
            setLoading(false);
        };
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                setActivePage('app');
                // Jangan reset ke 'home' di sini agar tidak pindah halaman saat auth state refresh
            } else {
                setActivePage('landing');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // Reset state setelah logout
        setActivePage('landing');
        setActiveDashboardPage('home');
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [userMenuRef]);

    // --- PERBAIKAN UTAMA ADA DI SINI ---

    // Tampilkan loading screen jika sesi belum siap
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen bg-slate-50"><div className="text-slate-500">Memuat Aplikasi...</div></div>;
    }

    // Gunakan conditional rendering di level atas
    let content;
    switch (activePage) {
        case 'auth':
            content = <AuthPage supabase={supabase} setActivePage={setActivePage} isLogin={isLogin} setIsLogin={setIsLogin} />;
            break;
        case 'app':
            content = session ? (
                <Dashboard 
                    supabase={supabase} 
                    user={session.user} 
                    activeDashboardPage={activeDashboardPage} 
                    setActiveDashboardPage={setActiveDashboardPage} 
                    isUserMenuOpen={isUserMenuOpen} 
                    setIsUserMenuOpen={setIsUserMenuOpen} 
                    userMenuRef={userMenuRef} 
                    handleLogout={handleLogout} 
                />
            ) : (
                <LandingPage setActivePage={setActivePage} setIsLogin={setIsLogin} />
            );
            break;
        case 'landing':
        default:
            content = <LandingPage setActivePage={setActivePage} setIsLogin={setIsLogin} />;
            break;
    }

    return (
        <div className="font-sans bg-slate-50 text-slate-800">
            {content}
        </div>
    );
}