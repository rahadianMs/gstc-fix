"use client";

import { motion, AnimatePresence } from 'framer-motion';

// --- Ikon Status ---
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ExclamationCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ChatBubbleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
);

// --- Komponen Utama Modal Review ---
export default function ReviewModal({ isOpen, onClose, evidence }) {
    if (!isOpen || !evidence) return null;

    // Tentukan tampilan berdasarkan status
    const getStatusDisplay = (status) => {
        switch (status) {
            case 'Done':
                return { icon: <CheckCircleIcon />, title: 'Disetujui (Done)', color: 'text-green-700' };
            case 'Rejected':
                return { icon: <XCircleIcon />, title: 'Ditolak (Rejected)', color: 'text-red-700' };
            case 'Revision':
                return { icon: <ExclamationCircleIcon />, title: 'Perlu Revisi (Revision)', color: 'text-purple-700' };
            default:
                return { icon: <ChatBubbleIcon />, title: `Status: ${status}`, color: 'text-blue-700' };
        }
    };

    const statusDisplay = getStatusDisplay(evidence.status);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <header className="p-6 border-b text-center bg-slate-50/50">
                        <div className="flex justify-center mb-3">
                            {statusDisplay.icon}
                        </div>
                        <h3 className={`text-xl font-bold ${statusDisplay.color}`}>
                            {statusDisplay.title}
                        </h3>
                    </header>
                    
                    <main className="p-6 space-y-4">
                        <div>
                            <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                💬 Komentar Konsultan:
                            </h4>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 min-h-[80px] whitespace-pre-wrap leading-relaxed">
                                {evidence.consultant_comment ? evidence.consultant_comment : <span className="text-slate-400 italic">Tidak ada komentar yang diberikan.</span>}
                            </div>
                        </div>
                    </main>

                    <footer className="p-5 bg-slate-50 border-t flex justify-end">
                        <button 
                            onClick={onClose} 
                            className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            Tutup
                        </button>
                    </footer>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}