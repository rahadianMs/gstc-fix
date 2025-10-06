"use client";

import { motion, AnimatePresence } from 'framer-motion';

// --- Ikon untuk status review ---
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


// --- Komponen Utama Modal Review ---
export default function ReviewModal({ isOpen, onClose, evidence }) {
    if (!isOpen || !evidence) return null;

    const isApproved = evidence.status === 'Done';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <header className="p-6 border-b text-center">
                        <div className="flex justify-center mb-2">
                            {isApproved ? <CheckCircleIcon /> : <XCircleIcon />}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">
                            Status Bukti: {isApproved ? 'Disetujui' : 'Ditolak'}
                        </h3>
                    </header>
                    
                    <main className="p-6 space-y-4">
                        <h4 className="font-semibold text-slate-700">Komentar dari Konsultan:</h4>
                        <div className="bg-slate-50 p-4 rounded-lg border text-slate-600">
                            <p>{evidence.consultant_comment || "Tidak ada komentar yang diberikan."}</p>
                        </div>
                    </main>

                    <footer className="p-6 bg-slate-50 border-t flex justify-end">
                        <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">
                            Tutup
                        </button>
                    </footer>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}