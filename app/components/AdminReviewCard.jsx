"use client";

import { useState } from 'react';

// Komponen untuk menampilkan setiap kartu review di sisi konsultan
export default function AdminReviewCard({ indicator, evidence, subSectionTitle, onUpdate, supabase }) {
    const [comment, setComment] = useState(evidence?.consultant_comment || '');
    const [loading, setLoading] = useState(false);

    const handleStatusUpdate = async (newStatus) => {
        // ... (fungsi handleStatusUpdate tidak berubah)
        if (!evidence) {
            alert("Tidak ada data submisi untuk diperbarui.");
            return;
        }
        setLoading(true);
        const { data, error } = await supabase
            .from('evidence_submissions')
            .update({ status: newStatus, consultant_comment: comment })
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

    // Objek untuk styling status
    const statusStyles = {
        'To Do': { label: 'To Do', badge: 'bg-slate-100 text-slate-600', bar: 'bg-slate-300' },
        'In Progress': { label: 'In Progress', badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-400' },
        'In Review': { label: 'In Review', badge: 'bg-yellow-100 text-yellow-800', bar: 'bg-yellow-400' },
        'Revision': { label: 'Revision', badge: 'bg-purple-100 text-purple-800', bar: 'bg-purple-400' }, // <-- STATUS BARU
        'Done': { label: 'Disetujui', badge: 'bg-green-100 text-green-800', bar: 'bg-green-400' },
        'Rejected': { label: 'Ditolak', badge: 'bg-red-100 text-red-800', bar: 'bg-red-400' },
    };
    
    const currentStatus = evidence?.status || 'To Do';
    const statusInfo = statusStyles[currentStatus];
    const criterionCode = indicator?.gstc_criteria?.criterion_code || 'N/A';

    return (
        <div className="relative bg-white p-6 pl-8 rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
            {/* --- STATUS BAR VISUAL BARU --- */}
            <div className={`absolute top-0 left-0 h-full w-2 ${statusInfo.bar}`}></div>

            <div className="flex justify-between items-start gap-4 border-b pb-4">
                <div>
                    <p className="text-sm font-semibold" style={{color: '#3f545f'}}>{criterionCode} | {subSectionTitle}</p>
                    <h4 className="text-lg font-bold text-slate-800 mt-1">{indicator.indicator_letter}. {indicator.indicator_text}</h4>
                </div>
                <div className={`flex-shrink-0 px-3 py-1 text-xs font-bold rounded-full ${statusInfo.badge}`}>
                    {statusInfo.label}
                </div>
            </div>

            {currentStatus === 'To Do' || currentStatus === 'In Progress' ? (
                <p className="text-center text-slate-500 py-10">Destinasi belum mengajukan bukti untuk direview.</p>
            ) : (
                <div className="pt-5">
                    <div>
                        <h5 className="text-sm font-semibold text-slate-600 mb-2">Tautan Bukti yang Diajukan:</h5>
                        <ul className="space-y-2">
                            {Array.isArray(evidence?.links) && evidence.links.length > 0 ? (
                                evidence.links.map((link, index) => (
                                    <li key={index}><a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">{link}</a></li>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400">Tidak ada tautan yang dilampirkan.</p>
                            )}
                        </ul>
                    </div>
                    
                    <div className="mt-6">
                         <label className="block text-sm font-semibold text-slate-600 mb-2">Komentar / Review Anda</label>
                         <textarea
                            placeholder="Berikan masukan atau alasan persetujuan/penolakan..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3f545f]"
                            rows={3}
                         />
                    </div>

                    <div className="mt-4 flex justify-end items-center gap-3">
                        <button onClick={() => handleStatusUpdate('Rejected')} disabled={loading} className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50">
                            {loading ? 'Menyimpan...' : 'Tolak'}
                        </button>
                        <button onClick={() => handleStatusUpdate('Done')} disabled={loading} className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-50" style={{backgroundColor: '#3f545f'}}>
                            {loading ? 'Menyimpan...' : 'Setujui'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}