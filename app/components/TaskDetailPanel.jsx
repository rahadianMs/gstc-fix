"use client";

import { motion, AnimatePresence } from 'framer-motion';

// --- Ikon ---
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0h18M5.25 12h13.5h-13.5zm0 3.75h13.5h-13.5z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;

export default function TaskDetailPanel({ task, onClose, onEdit, onDelete, user, userRole }) {
    if (!task) return null;

    // Helper warna status
    const getStatusColor = (s) => {
        if (s === 'Done') return 'bg-green-100 text-green-800 border-green-200';
        if (s === 'In Progress') return 'bg-blue-100 text-blue-800 border-blue-200';
        if (s === 'Waiting Verification') return 'bg-amber-100 text-amber-800 border-amber-200';
        return 'bg-slate-100 text-slate-800 border-slate-200';
    };

    const statusLabel = task.status === 'Waiting Verification' ? 'Menunggu Verifikasi' : task.status;

    // Cek izin edit/hapus
    // Konsultan: Bisa edit/hapus semua.
    // User: Hanya bisa edit/hapus tugas buatan sendiri.
    const isCreator = task.created_by === user.id;
    const canModify = userRole === 'consultant' || isCreator;

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex justify-between items-start p-6 border-b border-slate-100">
                <div>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mb-3 ${getStatusColor(task.status)}`}>
                        {statusLabel}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 leading-tight">{task.task_title}</h2>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                    <CloseIcon />
                </button>
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Description */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Deskripsi</h3>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {task.task_description || <span className="text-slate-400 italic">Tidak ada deskripsi.</span>}
                    </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                        <CalendarIcon />
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Batas Waktu</p>
                            <p className="text-sm font-medium text-slate-800 mt-0.5">
                                {task.due_date ? new Date(task.due_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <UserIcon />
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Ditugaskan Kepada</p>
                            <p className="text-sm font-medium text-slate-800 mt-0.5">{task.assigned_to || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* --- BAGIAN MULTI TAGS --- */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <TagIcon />
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Kriteria Terkait</h3>
                    </div>
                    
                    {task.criteria_tags && task.criteria_tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {task.criteria_tags.map((tag, idx) => (
                                <div key={idx} className="flex flex-col bg-slate-50 border border-slate-200 rounded-lg p-3 w-full sm:w-auto min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`w-2 h-2 rounded-full ${
                                            tag.pillar === 'A' ? 'bg-orange-400' : 
                                            tag.pillar === 'B' ? 'bg-lime-500' : 
                                            tag.pillar === 'C' ? 'bg-blue-500' : 'bg-emerald-500'
                                        }`}></span>
                                        <span className="text-xs font-bold text-slate-500 uppercase">Pilar {tag.pillar}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800">
                                        <span className="text-[#3f545f] mr-1">{tag.criterion_code}</span> 
                                        {tag.criterion_title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic pl-8">Tidak ada kriteria yang dihubungkan.</p>
                    )}
                </div>

                {/* Creator Info */}
                <div className="pt-6 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                        Dibuat oleh: <span className="font-semibold text-slate-600">{task.creator?.full_name || 'System'}</span> 
                        <span className="mx-1">•</span>
                        {new Date(task.created_at).toLocaleDateString('id-ID')}
                    </p>
                </div>
            </div>

            {/* Footer Actions */}
            {canModify && (
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
                    <button 
                        onClick={onDelete} 
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <TrashIcon /> Hapus
                    </button>
                    <button 
                        onClick={onEdit} 
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#1c3d52' }}
                    >
                        <PencilIcon /> Edit Tugas
                    </button>
                </div>
            )}
        </div>
    );
}