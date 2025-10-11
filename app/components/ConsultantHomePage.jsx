// app/components/ConsultantHomePage.jsx
"use client";

import { useState, useEffect } from 'react';
import ConsultantNotificationCenter from './ConsultantNotificationCenter';
import { motion } from 'framer-motion';
import { exportToExcel } from '../lib/exportToExcel'; // <-- 1. IMPORT FUNGSI EXPORT

// Ikon sederhana
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>;


export default function ConsultantHomePage({ supabase, user, setActiveDashboardPage }) {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloadingId, setDownloadingId] = useState(null); // <-- 2. State untuk melacak proses download

    useEffect(() => {
        const fetchDestinationsWithProgress = async () => {
            setLoading(true);
            const { data: profiles, error: profileError } = await supabase
                .from('profiles').select('id, destination_name, admin_province')
                .eq('role', 'destination').order('destination_name');
            if (profileError) {
                setError(`Gagal memuat data destinasi: ${profileError.message}`);
                setLoading(false);
                return;
            }
            const destinationsWithProgress = await Promise.all(
                profiles.map(async (profile) => {
                    const { data: progress, error: progressError } = await supabase.rpc('get_compliance_progress', { p_destination_id: profile.id });
                    return { ...profile, progress: progressError ? 0 : progress };
                })
            );
            setDestinations(destinationsWithProgress);
            setLoading(false);
        };
        fetchDestinationsWithProgress();
    }, [supabase]);

    // <-- 3. FUNGSI BARU UNTUK HANDLE DOWNLOAD
    const handleDownloadReport = async (destination) => {
        setDownloadingId(destination.id); // Mulai loading
        
        const { data, error } = await supabase.rpc('get_destination_report', {
            p_destination_id: destination.id
        });

        if (error) {
            alert(`Gagal mengambil data laporan: ${error.message}`);
        } else if (data) {
            // Panggil helper export dengan data yang didapat
            exportToExcel(data, destination.destination_name);
        }

        setDownloadingId(null); // Hentikan loading
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-slate-800">Dasbor Konsultan</h1>
                <p className="mt-2 text-lg text-slate-600">Selamat datang! Pantau semua aktivitas destinasi dari sini.</p>
            </div>
            {user && <ConsultantNotificationCenter supabase={supabase} user={user} setActiveDashboardPage={setActiveDashboardPage} />}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                 <h3 className="font-bold text-xl text-slate-800 p-6">Manajemen Destinasi</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Destinasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lokasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Progress Kepatuhan</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Memuat destinasi...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-red-500">{error}</td></tr>
                            ) : destinations.map(dest => (
                                <tr key={dest.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="font-semibold text-slate-900">{dest.destination_name}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-slate-500">{dest.admin_province || 'N/A'}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                                                <motion.div className="bg-cyan-500 h-2.5 rounded-full" initial={{ width: 0 }} animate={{ width: `${dest.progress || 0}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-600 w-12 text-right">{Math.round(dest.progress || 0)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* --- 4. PERBARUI TOMBOL DOWNLOAD --- */}
                                            <button 
                                                onClick={() => handleDownloadReport(dest)}
                                                disabled={downloadingId === dest.id}
                                                className="p-2 text-slate-500 hover:bg-slate-200 rounded-md disabled:animate-spin" 
                                                title="Download Laporan Excel"
                                            >
                                                {downloadingId === dest.id ? "..." : <DownloadIcon />}
                                            </button>
                                            <button onClick={() => setActiveDashboardPage({ page: 'admin-destination-detail', destinationId: dest.id })} className="px-4 py-2 text-xs font-semibold text-white rounded-lg flex items-center gap-1" style={{backgroundColor: '#1c3d52'}}>
                                                Review <ChevronRightIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}