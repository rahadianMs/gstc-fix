"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ConsultantHomePage from '@/app/components/ConsultantHomePage';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ConsultantHomeRoute() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) setUser(session.user);
            setLoading(false);
        };
        getUser();
    }, []);

    if (loading) return <div className="p-8 text-center">Memuat...</div>;

    return <ConsultantHomePage supabase={supabase} user={user} />;
}