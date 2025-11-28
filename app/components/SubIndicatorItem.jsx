"use client";

// Komponen untuk setiap baris sub-indikator
export default function SubIndicatorItem({ sub, evidence, onLinkEvidence, onViewReview }) {
    // Peta untuk gaya visual status
    const statusMap = {
        'To Do': { label: 'To Do', style: 'bg-slate-100 text-slate-600' },
        'In Progress': { label: 'In Progress', style: 'bg-blue-100 text-blue-700' },
        'In Review': { label: 'In Review', style: 'bg-yellow-100 text-yellow-800' },
        'Revision': { label: 'Revision', style: 'bg-purple-100 text-purple-800' },
        'Done': { label: 'Done', style: 'bg-green-100 text-green-800' },
        'Rejected': { label: 'Rejected', style: 'bg-red-100 text-red-800' },
    };

    const currentStatus = evidence?.status || 'To Do';
    const statusInfo = statusMap[currentStatus] || statusMap['To Do'];
    
    // --- PERBAIKAN LOGIKA: Tampilkan tombol review jika status Done/Rejected/Revision 
    // ATAU jika ada komentar konsultan (misal saat In Review) ---
    const hasComment = evidence?.consultant_comment && evidence.consultant_comment.trim() !== '';
    const isReviewed = currentStatus === 'Done' || currentStatus === 'Rejected' || currentStatus === 'Revision' || hasComment;
    
    const isUnderReview = currentStatus === 'In Review'; 

    // Tombol aksi (Link Evidence) disembunyikan hanya jika status 'Done' (sudah selesai)
    // Jika 'In Review', disable tombol (tunggu review)
    // Jika 'Revision' atau 'Rejected', enable tombol (untuk perbaikan)
    const showActionButton = currentStatus !== 'Done';
    const isActionDisabled = currentStatus === 'In Review'; // Disable saat sedang direview

    return (
        <div className="border-b border-slate-200/80 py-5">
            <p className="font-semibold text-slate-800">{sub.indicator_letter}. {sub.indicator_text}</p>
            {sub.guidance_text && (
                <p className="text-xs text-slate-500 mt-1 pl-5">
                    <span className="font-semibold">Panduan:</span> {sub.guidance_text}
                </p>
            )}

            <div className="mt-4 flex items-center gap-4 pl-5">
                {showActionButton && (
                    <button 
                        onClick={onLinkEvidence}
                        disabled={isActionDisabled}
                        className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{backgroundColor: '#3f545f'}}
                    >
                        {(currentStatus === 'Rejected' || currentStatus === 'Revision') ? 'Perbaiki Bukti' : 'Link Evidence'}
                    </button>
                )}

                {isReviewed && (
                    <button 
                        onClick={onViewReview}
                        className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                    >
                        Lihat Review
                        {/* Indikator kecil jika ada komentar */}
                        {hasComment && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                    </button>
                )}

                <div className={`px-3 py-1 text-xs font-bold rounded-full ${statusInfo.style}`}>
                    {statusInfo.label}
                </div>
            </div>
        </div>
    );
};