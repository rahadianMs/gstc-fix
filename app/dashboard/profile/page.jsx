"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import AccountPage from '@/app/components/AccountPage';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProfileRoute() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
            }
            setLoading(false);
        };
        getUser();
    }, []);

    if (loading) return <div className="p-8 text-center">Memuat profil...</div>;

    return <AccountPage user={user} supabase={supabase} />;
}