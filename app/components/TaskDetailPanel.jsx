"use client";

import { motion, AnimatePresence } from 'framer-motion';

// --- Komponen Ikon ---
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const PencilIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const TrashIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;

export default function TaskDetailPanel({ isOpen, onClose, task, user, userRole, onEdit, onDelete }) {
    
    if (!isOpen || !task) return null;

    // --- LOGIKA PERIZINAN ---
    const canModify = userRole === 'consultant' || task.created_by === user.id;
    
    const formatDate = (dateString) => {
        if (!dateString) return <span className="text-slate-400">N/A</span>;
        const date = new Date(dateString + 'T00:00:00');
        return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
    };
    
    const DetailItem = ({ label, value }) => (
        <div>
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="text-md text-slate-800">{value || '-'}</p>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />
                    {/* Panel Samping */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col"
                    >
                        <header className="flex-shrink-0 flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-slate-800">Detail Tugas</h2>
                            <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100"><CloseIcon /></button>
                        </header>

                        <main className="flex-1 p-8 overflow-y-auto space-y-6">
                            <h3 className="text-2xl font-bold text-slate-900">{task.task_title}</h3>
                            
                            {task.task_description && (
                                <div className="p-4 bg-slate-50 rounded-lg border">
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{task.task_description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                <DetailItem label="Status" value={task.status} />
                                <DetailItem label="Batas Waktu" value={formatDate(task.due_date)} />
                                <DetailItem label="Ditugaskan Oleh" value={task.creator?.role === 'consultant' ? 'Konsultan' : 'Pribadi'} />
                                <DetailItem label="Ditugaskan Kepada" value={task.assigned_to} />
                            </div>

                            {task.gstc_criteria && (
                                <DetailItem label="Terkait Kriteria" value={`${task.gstc_criteria.criterion_code}`} />
                            )}
                        </main>

                        {/* Tombol Aksi hanya muncul jika ada izin */}
                        {canModify && (
                            <footer className="flex-shrink-0 p-6 bg-slate-50 border-t flex justify-end items-center gap-4">
                                <button
                                    onClick={onEdit}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg"
                                    style={{backgroundColor: '#e8c45820', color: '#3f545f'}}
                                >
                                    <PencilIcon className="w-4 h-4" /> Edit
                                </button>
                                <button
                                    onClick={onDelete}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
                                >
                                    <TrashIcon className="w-4 h-4" /> Hapus
                                </button>
                            </footer>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}