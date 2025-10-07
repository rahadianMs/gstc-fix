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
    const statusInfo = statusMap[currentStatus];
    const isReviewed = currentStatus === 'Done' || currentStatus === 'Rejected';
    const isUnderReview = currentStatus === 'In Review' || currentStatus === 'Revision';

    // --- LOGIKA BARU: Tentukan apakah tombol aksi utama harus ditampilkan ---
    const showActionButton = currentStatus !== 'Done';

    return (
        <div className="border-b border-slate-200/80 py-5">
            <p className="font-semibold text-slate-800">{sub.indicator_letter}. {sub.indicator_text}</p>
            {sub.guidance_text && (
                <p className="text-xs text-slate-500 mt-1 pl-5">
                    <span className="font-semibold">Panduan:</span> {sub.guidance_text}
                </p>
            )}

            <div className="mt-4 flex items-center gap-4 pl-5">
                {/* --- PERBAIKAN: Tombol ini sekarang disembunyikan jika status 'Done' --- */}
                {showActionButton && (
                    <button 
                        onClick={onLinkEvidence}
                        disabled={isUnderReview}
                        className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{backgroundColor: '#3f545f'}}
                    >
                        {currentStatus === 'Rejected' ? 'Ajukan Ulang' : 'Link Evidence'}
                    </button>
                )}

                {isReviewed && (
                    <button 
                        onClick={onViewReview}
                        className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                        Lihat Review
                    </button>
                )}

                <div className={`px-3 py-1 text-xs font-bold rounded-full ${statusInfo.style}`}>
                    {statusInfo.label}
                </div>
            </div>
        </div>
    );
};