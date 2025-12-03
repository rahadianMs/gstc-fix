"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import BerandaPage from '@/app/components/BerandaPage'; // Pastikan import ini benar
import ConsultantHomePage from '@/app/components/ConsultantHomePage'; // Pastikan import ini benar

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardHome() {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                setRole(data?.role);
            }
            setLoading(false);
        }
        getData();
    }, []);

    if (loading) return <div>Memuat...</div>;

    // Logika Pemisahan Konsultan vs User
    if (role === 'consultant') {
        // Nanti kita pindahkan ini ke folder /dashboard/consultant/page.jsx agar lebih rapi
        // Tapi untuk sekarang di sini dulu tidak apa-apa
        return <ConsultantHomePage user={user} supabase={supabase} />;
    }

    return <BerandaPage user={user} supabase={supabase} />;
}