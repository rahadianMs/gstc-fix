"use client";

import { useEffect, useState, use } from 'react'; // 'use' untuk unwrap params di Next.js terbaru
import { createClient } from '@supabase/supabase-js';
import PillarDetailPage from '@/app/components/PillarDetailPage';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PillarRoute({ params }) {
    // Membuka parameter dari URL. Contoh: jika URL /compliance/a, maka pillar = 'a'
    const { pillar } = use(params);
    const pillarCode = pillar.toUpperCase(); // Ubah 'a' jadi 'A'

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

    if (loading) return <div className="p-8 text-center">Memuat data pilar...</div>;

    // CATATAN UNTUK PENGEMBANGAN HOTEL/TOUR OPERATOR:
    // Di sinilah nanti Anda bisa menambahkan logika pengecekan tipe user.
    // Contoh:
    // if (userType === 'hotel') return <HotelPillarDetail pillar={pillarCode} ... />
    
    return (
        <PillarDetailPage 
            pillar={pillarCode} 
            supabase={supabase} 
            user={user} 
        />
    );
}