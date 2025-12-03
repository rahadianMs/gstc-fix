"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import LandingPage from '@/app/components/LandingPage';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RootPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Jika sudah login, langsung lempar ke Dashboard
                router.replace('/dashboard');
            } else {
                // Jika belum, biarkan di Landing Page
                setLoading(false);
            }
        };
        checkSession();
    }, [router]);

    if (loading) return null; // Atau loading spinner

    return <LandingPage />;
}