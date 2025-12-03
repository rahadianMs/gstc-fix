"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // <-- Penting: Import Link
import { createClient } from '@supabase/supabase-js';
import Sidebar from '../components/Sidebar';
import { UserCircleIcon } from '../components/Icons';

// Inisialisasi Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardLayout({ children }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            // 1. Cek User Session
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                router.push('/login'); // Redirect ke halaman login jika tidak ada sesi
                return;
            }

            // 2. Ambil Profile Data (Role, Nama, dll)
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profileData) {
                setProfile(profileData);
            }
            
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-slate-500 font-medium">Memuat Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800">
            {/* Sidebar Persisten */}
            <Sidebar userRole={profile?.role} onLogout={handleLogout} />

            {/* Konten Utama */}
            <div className="flex flex-col flex-1 w-full ml-72">
                
                {/* Header Persisten */}
                <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-10 bg-[#1c2120] text-white shadow-md">
                    <h2 className="text-2xl font-bold">
                        Dashboard
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold">{profile?.destination_name || profile?.full_name}</p>
                            <p className="text-xs text-white/60 capitalize">{profile?.role}</p>
                        </div>
                        
                        {/* --- PERBAIKAN DI SINI: Ikon User Dibungkus Link --- */}
                        <Link href="/dashboard/profile" title="Lihat Profil">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                                <UserCircleIcon className="w-6 h-6" />
                            </div>
                        </Link>
                        {/* --------------------------------------------------- */}

                    </div>
                </header>

                {/* Area Konten Halaman (Page) */}
                <main className="flex-1 p-10 overflow-y-auto">
                    {/* Disini halaman anak akan dirender */}
                    {children} 
                </main>
            </div>
        </div>
    );
}