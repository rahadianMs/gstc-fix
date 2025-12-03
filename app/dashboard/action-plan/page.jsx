"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ActionPlanPage from '@/app/components/ActionPlanPage';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ActionPlanRoute() {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const getData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                setRole(data?.role);
            }
        }
        getData();
    }, []);

    if (!user) return <div>Memuat...</div>;

    return <ActionPlanPage supabase={supabase} user={user} userRole={role} />;
}