"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import SelfAssessmentPage from '@/app/components/SelfAssessmentPage';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AssessmentRoute() {
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

    if (loading) return <div className="p-8 text-center">Memuat asesmen...</div>;

    // CATATAN PENGEMBANGAN:
    // Nanti bisa dipisahkan di sini:
    // if (userRole === 'hotel') return <HotelAssessment ... />

    return (
        <SelfAssessmentPage 
            supabase={supabase} 
            user={user} 
        />
    );
}