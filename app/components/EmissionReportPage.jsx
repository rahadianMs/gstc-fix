"use client";

import { useState, useEffect } from 'react';
import CarbonCalculator from './CarbonCalculator';
import EmissionHistory from './EmissionHistory';
import ReportDetailModal from './ReportDetailModal'; // Impor komponen modal baru
import { AnimatePresence } from 'framer-motion';

export default function EmissionReportPage({ supabase, user, onDataUpdate }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State baru untuk mengelola modal detail
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);

    // State untuk modal konfirmasi hapus
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    useEffect(() => {
        const fetchEntries = async () => {
            if (!user) return;
            setLoading(true);
            setError('');
            const { data, error } = await supabase
                .from('carbon_entries')
                .select('*')
                .eq('user_id', user.id)
                .order('report_month', { ascending: false });

            if (error) {
                console.error('Error fetching carbon entries:', error);
                setError(`Gagal memuat riwayat: ${error.message}`);
            } else {
                setEntries(data);
            }
            setLoading(false);
        };
        fetchEntries();
    }, [user, supabase, onDataUpdate]);

    // --- Fungsi baru untuk mengelola modal detail ---
    const handleReportClick = (entry) => {
        setSelectedEntry(entry);
        setIsDetailModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsDetailModalOpen(false);
        // Beri sedikit jeda agar animasi exit selesai sebelum data hilang
        setTimeout(() => setSelectedEntry(null), 300);
    };

    // --- Fungsi untuk menghapus, dipanggil dari modal ---
    const handleDeleteRequest = () => {
        // Tutup modal detail, buka modal konfirmasi
        setIsDetailModalOpen(false);
        setShowDeleteConfirm(true);
    };
    
    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
        setSelectedEntry(null); // Clear selected entry
    };

    const handleConfirmDelete = async () => {
        if (!selectedEntry) return;
        const { error } = await supabase
            .from('carbon_entries')
            .delete()
            .match({ id: selectedEntry.id });
        if (error) {
            setError(`Gagal menghapus laporan: ${error.message}`);
        } else {
            if (onDataUpdate) onDataUpdate(); 
        }
        handleCancelDelete(); // Tutup modal konfirmasi
    };

    return (
        <div className="space-y-10">
            <CarbonCalculator
                supabase={supabase}
                user={user}
                onReportSubmitted={onDataUpdate}
            />
            
            <EmissionHistory
                entries={entries}
                loading={loading}
                error={error}
                onReportClick={handleReportClick} // Prop baru
            />

            {/* Render Modal Detail dengan Animasi */}
            <AnimatePresence>
                {isDetailModalOpen && selectedEntry && (
                    <ReportDetailModal 
                        entry={selectedEntry}
                        onClose={handleCloseModal}
                        onDelete={handleDeleteRequest} // Teruskan fungsi untuk meminta hapus
                    />
                )}
            </AnimatePresence>

            {/* Modal Konfirmasi Hapus */}
            {showDeleteConfirm && selectedEntry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
                        <p className="text-slate-600 mb-6">
                            Apakah Anda yakin ingin menghapus laporan untuk
                            <span className="font-semibold"> {selectedEntry.calculation_title}?</span> 
                            Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button onClick={handleCancelDelete} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Batal</button>
                            <button onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}