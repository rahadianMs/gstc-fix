"use client";

import { useState, useEffect } from 'react';

// Komponen Halaman Dasbor untuk Admin/Konsultan
export default function AdminDashboardPage({ supabase, setActiveDashboardPage }) {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDestinations = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, destination_name, admin_province')
                .eq('role', 'destination');

            if (error) {
                setError(`Gagal memuat data destinasi: ${error.message}`);
            } else {
                setDestinations(data);
            }
            setLoading(false);
        };

        fetchDestinations();
    }, [supabase]);

    if (loading) {
        return <div>Memuat daftar destinasi...</div>;
    }
    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-800">Dasbor Konsultan</h1>
                <p className="mt-2 text-lg text-slate-600">Berikut adalah daftar semua destinasi yang terdaftar.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md border overflow-hidden">
                <ul className="divide-y divide-slate-200">
                    {destinations.map(dest => (
                        <li key={dest.id}>
                            <button 
                                // --- PERUBAHAN DI SINI ---
                                // Saat diklik, ubah state activeDashboardPage menjadi objek
                                // yang berisi halaman tujuan dan ID destinasi
                                onClick={() => setActiveDashboardPage({ page: 'admin-destination-detail', destinationId: dest.id })}
                                className="w-full text-left p-6 hover:bg-slate-50 transition-colors flex justify-between items-center"
                            >
                                <div>
                                    <h3 className="text-lg font-semibold text-emerald-700">{dest.destination_name}</h3>
                                    <p className="text-sm text-slate-500">{dest.admin_province || 'Lokasi belum diatur'}</p>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}