"use client";

import { useState } from 'react';

// --- KOMPONEN IKON ---
const NoteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
);

export default function AdminReviewCard({ indicator, evidence, subSectionTitle, onUpdate, supabase }) {
    const [comment, setComment] = useState(evidence?.consultant_comment || '');
    const [loading, setLoading] = useState(false);

    // Fungsi update status (Approve/Reject)
    const handleStatusUpdate = async (newStatus) => {
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

    // Fungsi simpan komentar saja (tanpa ubah status)
    const handleSaveComment = async () => {
        if (!evidence) return;
        setLoading(true);
        
        const { data, error } = await supabase
            .from('evidence_submissions')
            .update({ consultant_comment: comment })
            .eq('id', evidence.id)
            .select()
            .single();

        if (error) {
            alert(`Gagal menyimpan komentar: ${error.message}`);
        } else if (data) {
            onUpdate(data);
            alert("Komentar berhasil disimpan.");
        }
        setLoading(false);
    };

    const statusStyles = { 
        'To Do': { label: 'To Do', badge: 'bg-slate-100 text-slate-600', bar: 'bg-slate-300' }, 
        'In Progress': { label: 'In Progress', badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-400' }, 
        'In Review': { label: 'In Review', badge: 'bg-yellow-100 text-yellow-800', bar: 'bg-yellow-400' }, 
        'Revision': { label: 'Revision', badge: 'bg-purple-100 text-purple-800', bar: 'bg-purple-400' }, 
        'Done': { label: 'Disetujui', badge: 'bg-green-100 text-green-800', bar: 'bg-green-400' }, 
        'Rejected': { label: 'Ditolak', badge: 'bg-red-100 text-red-800', bar: 'bg-red-400' }
    };
    
    const currentStatus = evidence?.status || 'To Do';
    const statusInfo = statusStyles[currentStatus] || statusStyles['To Do'];
    const criterionCode = indicator?.gstc_criteria?.criterion_code || 'N/A';

    return (
        <div className="relative bg-white p-6 pl-8 rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
            {/* Status Bar Indikator di Kiri */}
            <div className={`absolute top-0 left-0 h-full w-2 ${statusInfo.bar}`}></div>

            <div className="flex justify-between items-start gap-4">
                <div>
                    <p className="text-sm font-semibold" style={{color: '#3f545f'}}>{criterionCode} | {subSectionTitle}</p>
                    <h4 className="text-lg font-bold text-slate-800 mt-1">{indicator.indicator_letter}. {indicator.indicator_text}</h4>
                </div>
                <div className={`flex-shrink-0 px-3 py-1 text-xs font-bold rounded-full ${statusInfo.badge}`}>
                    {statusInfo.label}
                </div>
            </div>

            {(currentStatus !== 'To Do' && currentStatus !== 'In Progress') && (
                <div className="pt-5 mt-5 border-t border-slate-100">
                    
                    {/* --- FITUR BARU: TAMPILAN CATATAN USER --- */}
                    {evidence?.submission_note && (
                        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 items-start shadow-sm">
                            <div className="mt-0.5 flex-shrink-0 bg-amber-100 p-1 rounded">
                                <NoteIcon />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-amber-800 uppercase mb-1 tracking-wide">Catatan dari Destinasi:</p>
                                <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
                                    {evidence.submission_note}
                                </p>
                            </div>
                        </div>
                    )}
                    {/* ----------------------------------------- */}

                    <div className="mb-6">
                        <h5 className="text-sm font-semibold text-slate-600 mb-2">Tautan Bukti:</h5>
                        <ul className="space-y-2">
                            {Array.isArray(evidence?.links) && evidence.links.length > 0 ? (
                                evidence.links.map((link, index) => (
                                    <li key={index}>
                                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block bg-blue-50 p-2 rounded border border-blue-100 hover:bg-blue-100 transition-colors">
                                            🔗 {link}
                                        </a>
                                    </li>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">Tidak ada tautan bukti.</p>
                            )}
                        </ul>
                    </div>
                    
                    <div className="mt-6">
                         <label className="block text-sm font-semibold text-slate-600 mb-2">Komentar / Review Anda (Opsional)</label>
                         <textarea 
                            placeholder="Berikan masukan atau alasan penolakan..." 
                            value={comment} 
                            onChange={(e) => setComment(e.target.value)} 
                            className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3f545f] focus:border-transparent outline-none transition-all" 
                            rows={3}
                         />
                    </div>

                    <div className="mt-4 flex flex-wrap justify-end items-center gap-3 pt-4 border-t border-slate-100">
                        <button 
                            onClick={handleSaveComment} 
                            disabled={loading} 
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Simpan Komentar
                        </button>

                        <button 
                            onClick={() => handleStatusUpdate('Rejected')} 
                            disabled={loading} 
                            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            Tolak (Revisi)
                        </button>
                        
                        <button 
                            onClick={() => handleStatusUpdate('Done')} 
                            disabled={loading} 
                            className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm" 
                            style={{backgroundColor: '#3f545f'}}
                        >
                            Setujui
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}