"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Impor komponen-komponen yang sudah dipisah
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

// Inisialisasi Supabase Client
// Pastikan variabel lingkungan Anda sudah benar di file .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function HomePage() {
    const [session, setSession] = useState(null);
    const [activePage, setActivePage] = useState('landing');
    const [isLogin, setIsLogin] = useState(true);
    const [activeDashboardPage, setActiveDashboardPage] = useState('beranda');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fungsi untuk mengambil sesi saat komponen pertama kali dimuat
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session) {
                setActivePage('app');
            }
            setLoading(false);
        };
        getSession();
        // Listener untuk memantau perubahan status otentikasi (login, logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                // Jika ada sesi (berhasil login/register), arahkan ke dasbor
                setActivePage('app');
                setActiveDashboardPage('beranda'); // Reset ke halaman utama dasbor
            } else {
                // Jika tidak ada sesi (logout), arahkan ke landing page
                setActivePage('landing');
            }
        });

        // Berhenti memantau saat komponen di-unmount
        return () => subscription.unsubscribe();
    }, []);

    // Fungsi untuk logout
    const handleLogout = async () => {
        await supabase.auth.signOut();
        // onAuthStateChange akan otomatis menangani perpindahan halaman ke 'landing'
    };

    // Efek untuk menutup menu dropdown pengguna saat klik di luar area menu
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

    // Tampilkan loading indicator saat sesi sedang diperiksa
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-slate-500">Memuat Aplikasi...</div>
            </div>
        );
    }

    // Fungsi untuk merender halaman berdasarkan state 'activePage'
    const renderPage = () => {
        switch (activePage) {
            case 'auth':
                return <AuthPage
                    supabase={supabase}
                    setActivePage={setActivePage}
                    isLogin={isLogin}
                    setIsLogin={setIsLogin}
                />;
            case 'app':
                return session ? <Dashboard
                    supabase={supabase}
                    user={session.user}
                    activeDashboardPage={activeDashboardPage}
                    setActiveDashboardPage={setActiveDashboardPage}
                    isUserMenuOpen={isUserMenuOpen}
                    setIsUserMenuOpen={setIsUserMenuOpen}
                    userMenuRef={userMenuRef}
                    handleLogout={handleLogout}
                /> : <LandingPage setActivePage={setActivePage} setIsLogin={setIsLogin} />;
            case 'landing':
            default:
                return <LandingPage setActivePage={setActivePage} setIsLogin={setIsLogin} />;
        }
    };

    return (
        <div className="font-sans bg-slate-50 text-slate-800">
            {renderPage()}
        </div>
    );
}