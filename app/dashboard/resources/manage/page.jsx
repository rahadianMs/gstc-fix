"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ResourceAdminPage from '@/app/components/ResourceAdminPage';

// Inisialisasi Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ResourceManageRoute() {
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

    if (loading) return <div className="p-8 text-center">Memuat panel admin...</div>;

    // Render komponen admin
    return <ResourceAdminPage supabase={supabase} user={user} />;
}