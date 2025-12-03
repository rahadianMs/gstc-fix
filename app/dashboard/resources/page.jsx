"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import PembelajaranPage from '@/app/components/PembelajaranPage';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ResourcesRoute() {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                setUserRole(data?.role || 'destination');
            }
            setLoading(false);
        };
        getUserData();
    }, []);

    if (loading) return <div className="p-8 text-center">Memuat resources...</div>;

    return <PembelajaranPage supabase={supabase} user={user} userRole={userRole} />;
}