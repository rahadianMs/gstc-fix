"use client";

import { useState } from 'react';

// Komponen untuk menampilkan setiap kartu review di sisi konsultan
export default function AdminReviewCard({ indicator, evidence, subSectionTitle, onUpdate, supabase }) {
    const [comment, setComment] = useState(evidence?.consultant_comment || '');
    const [loading, setLoading] = useState(false);

    const handleStatusUpdate = async (newStatus) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('compliance_evidence')
            .update({ 
                status: newStatus, 
                consultant_comment: comment 
            })
            .eq('id', evidence.id)
            .select()
            .single();

        if (error) {
            alert(`Gagal memperbarui status: ${error.message}`);
        } else if (data) {
            onUpdate(data);
        }
        setLoading(false);
    };

    const statusStyles = {
        pending: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Belum Diisi' },
        on_review: { bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'On Review' },
        approved: { bg: 'bg-green-100', text: 'text-green-600', label: 'Approved' },
        rejected: { bg: 'bg-red-100', text: 'text-red-600', label: 'Rejected' },
    };
    
    const currentStatus = evidence?.status || 'pending';

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-start gap-4 border-b pb-4">
                <div>
                    <p className="text-sm font-semibold text-emerald-700">{indicator.indicator_code} | {subSectionTitle}</p>
                    <h4 className="text-lg font-bold text-slate-800 mt-1">{indicator.indicator_text}</h4>
                </div>
                <div className={`flex-shrink-0 px-3 py-1 text-xs font-bold rounded-full ${statusStyles[currentStatus].bg} ${statusStyles[currentStatus].text}`}>
                    {statusStyles[currentStatus].label}
                </div>
            </div>

            {currentStatus === 'pending' ? (
                <p className="text-center text-slate-500 py-8">Belum ada bukti yang disubmit oleh destinasi.</p>
            ) : (
                <div className="pt-4">
                    <div>
                        <h5 className="text-sm font-semibold text-slate-600 mb-2">Tautan Bukti yang Disubmit:</h5>
                        <ul className="space-y-2">
                            {/* --- PERUBAHAN DI SINI: Menambahkan pengecekan Array.isArray --- */}
                            {Array.isArray(evidence?.evidence_link) && evidence.evidence_link.map((link, index) => (
                                <li key={index}>
                                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="mt-6">
                         <label className="block text-sm font-semibold text-slate-600 mb-2">Komentar / Review</label>
                         <textarea
                            placeholder="Berikan masukan atau alasan persetujuan/penolakan..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                            rows={3}
                         />
                    </div>

                    <div className="mt-4 flex justify-end items-center gap-3">
                        <button onClick={() => handleStatusUpdate('rejected')} disabled={loading} className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50">Tolak</button>
                        <button onClick={() => handleStatusUpdate('approved')} disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50">Setujui</button>
                    </div>
                </div>
            )}
        </div>
    );
}