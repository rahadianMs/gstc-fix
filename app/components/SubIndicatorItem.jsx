"use client";

// Komponen untuk setiap baris sub-indikator
export default function SubIndicatorItem({ sub, evidence, onLinkEvidence, onViewReview }) {
    const statusMap = {
        'To Do': { label: 'To Do', style: 'bg-slate-100 text-slate-600' },
        'In Progress': { label: 'In Progress', style: 'bg-blue-100 text-blue-700' },
        'In Review': { label: 'In Review', style: 'bg-yellow-100 text-yellow-800' },
        'Revision': { label: 'Revision', style: 'bg-purple-100 text-purple-800' },
        'Done': { label: 'Done', style: 'bg-green-100 text-green-600' },
        'Rejected': { label: 'Rejected', style: 'bg-red-100 text-red-800' },
    };

    const currentStatus = evidence?.status || 'To Do';
    const statusInfo = statusMap[currentStatus] || statusMap['To Do'];
    
    const hasComment = evidence?.consultant_comment && evidence.consultant_comment.trim() !== '';
    const isReviewed = currentStatus === 'Done' || currentStatus === 'Rejected' || currentStatus === 'Revision' || hasComment;
    
    // --- PERUBAHAN LOGIKA DI SINI ---
    // Kita hapus pengecekan 'Done' agar user tetap bisa melihat bukti yang sudah disetujui (opsional)
    // Tapi fokus utamanya: Tombol tidak didisable saat 'In Review'
    const showActionButton = true; // Selalu tampilkan tombol aksi utama

    // Tentukan teks tombol berdasarkan status
    let buttonText = 'Link Evidence';
    if (currentStatus === 'In Review') buttonText = 'Lihat / Batalkan';
    else if (currentStatus === 'Done') buttonText = 'Lihat Bukti';
    else if (currentStatus === 'Rejected' || currentStatus === 'Revision') buttonText = 'Perbaiki Bukti';
    else if (currentStatus === 'In Progress') buttonText = 'Lanjutkan Draft';

    return (
        <div className="border-b border-slate-200/80 py-5">
            <p className="font-semibold text-slate-800">{sub.indicator_letter}. {sub.indicator_text}</p>
            {sub.guidance_text && (
                <p className="text-xs text-slate-500 mt-1 pl-5">
                    <span className="font-semibold">Panduan:</span> {sub.guidance_text}
                </p>
            )}

            <div className="mt-4 flex items-center gap-4 pl-5">
                <button 
                    onClick={onLinkEvidence}
                    // Tombol sekarang selalu aktif (kecuali mungkin saat loading, tapi di sini kita biarkan aktif)
                    className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90 shadow-sm"
                    style={{backgroundColor: '#3f545f'}}
                >
                    {buttonText}
                </button>

                {isReviewed && (
                    <button 
                        onClick={onViewReview}
                        className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                    >
                        Lihat Review
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