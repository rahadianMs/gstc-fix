"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- IKON ---
const ChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>;
const ChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>;
const ClockIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default function TaskGanttChart({ tasks, onTaskClick }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; 

    // 1. Filter tugas valid (harus ada due_date & created_at yang valid)
    const validTasks = useMemo(() => {
        return tasks.filter(t => {
            if (!t.due_date || !t.created_at) return false;
            const due = new Date(t.due_date);
            const created = new Date(t.created_at);
            return !isNaN(due.getTime()) && !isNaN(created.getTime());
        }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    }, [tasks]);

    // 2. Pagination Logic
    const totalPages = Math.max(1, Math.ceil(validTasks.length / itemsPerPage));
    
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(1);
    }, [validTasks.length, totalPages, currentPage]);

    const currentTasks = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return validTasks.slice(start, start + itemsPerPage);
    }, [validTasks, currentPage]);

    // 3. Kalkulasi Rentang Waktu Global (untuk header bulan)
    const timelineData = useMemo(() => {
        if (validTasks.length === 0) return { months: [], totalDuration: 0, minDate: new Date() };

        // Cari rentang dari SEMUA tugas valid agar skala konsisten
        const minTs = Math.min(...validTasks.map(t => new Date(t.created_at).getTime()));
        const maxTs = Math.max(...validTasks.map(t => new Date(t.due_date).getTime()));

        let startDate = new Date(minTs);
        let endDate = new Date(maxTs);

        // Rapikan ke awal bulan dan akhir bulan + buffer
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 2, 0); 

        const totalDuration = endDate.getTime() - startDate.getTime();
        
        // Generate Header Bulan
        const months = [];
        let iter = new Date(startDate);
        while (iter <= endDate) {
            months.push(new Date(iter));
            iter.setMonth(iter.getMonth() + 1);
        }

        return { months, totalDuration, minDate: startDate };
    }, [validTasks]);

    // Helper: Hitung Posisi Bar (Left %) dan Lebar (Width %)
    const getPositionStyles = (startStr, endStr) => {
        const start = new Date(startStr);
        const end = new Date(endStr);
        const { minDate, totalDuration } = timelineData;

        if (totalDuration === 0) return { left: '0%', width: '0%' };

        const left = ((start.getTime() - minDate.getTime()) / totalDuration) * 100;
        let width = ((end.getTime() - start.getTime()) / totalDuration) * 100;
        
        // Minimal lebar visual agar tetap terlihat
        width = Math.max(width, 1.5); 

        return { left: `${left}%`, width: `${width}%` };
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Done': return 'bg-green-500 hover:bg-green-600'; 
            case 'In Progress': return 'bg-blue-500 hover:bg-blue-600';
            case 'Waiting Verification': return 'bg-amber-500 hover:bg-amber-600'; 
            default: return 'bg-slate-400 hover:bg-slate-500'; 
        }
    };

    // Tampilan Kosong
    if (validTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10 text-center bg-white rounded-2xl border border-slate-200">
                <ClockIcon className="w-10 h-10 mb-3 text-slate-300" />
                <p className="font-medium text-slate-600">Timeline Kosong</p>
                <p className="text-xs mt-1 text-slate-400 max-w-[200px]">Pastikan tugas Anda memiliki <strong>Batas Waktu (Due Date)</strong> yang valid.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            
            {/* Header: Kolom Bulan */}
            <div className="flex border-b border-slate-200 bg-slate-50/80">
                {/* Kolom Judul (Sticky Kiri) */}
                <div className="w-48 flex-shrink-0 p-3 text-xs font-bold text-slate-500 uppercase border-r border-slate-200 bg-white z-20 sticky left-0 shadow-sm">
                    Daftar Tugas
                </div>
                
                {/* Area Timeline (Scrollable secara horizontal jika overflow) */}
                <div className="flex-1 relative overflow-hidden">
                    <div className="flex h-full w-full">
                        {timelineData.months.map((month, idx) => (
                            <div key={idx} className="flex-1 min-w-[60px] p-2 text-center border-r border-slate-200 last:border-r-0 flex flex-col justify-center">
                                <span className="text-xs font-semibold text-slate-600">
                                    {month.toLocaleDateString('id-ID', { month: 'short' })}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                    {month.getFullYear()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Body: Grid & Task Bars */}
            <div className="flex-1 relative overflow-y-auto">
                {/* Grid Garis Belakang */}
                <div className="absolute inset-0 flex pl-48 w-full h-full pointer-events-none">
                    {timelineData.months.map((_, idx) => (
                        <div key={idx} className="flex-1 border-r border-dashed border-slate-100 last:border-r-0 h-full"></div>
                    ))}
                </div>

                {/* Daftar Bar Tugas */}
                <div className="relative z-10">
                    <AnimatePresence mode='wait'>
                        {currentTasks.map((task, index) => {
                            const { left, width } = getPositionStyles(task.created_at, task.due_date);
                            const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'Done';

                            return (
                                <motion.div 
                                    key={task.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center border-b border-slate-50 hover:bg-blue-50/30 transition-colors h-14 group relative"
                                >
                                    {/* Nama Tugas (Sticky Kiri) */}
                                    <div className="w-48 flex-shrink-0 px-4 py-2 border-r border-slate-100 bg-white sticky left-0 z-20 group-hover:bg-blue-50/20">
                                        <p className="text-sm font-semibold text-slate-700 truncate" title={task.task_title}>
                                            {task.task_title}
                                        </p>
                                        <p className={`text-[10px] ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                            Due: {new Date(task.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>

                                    {/* Area Bar */}
                                    <div className="flex-1 relative h-full w-full">
                                        <div className="absolute top-1/2 -translate-y-1/2 w-full pr-2 h-6 pointer-events-none"> 
                                            {/* pointer-events-none di container, auto di tombol agar akurat */}
                                            <motion.button
                                                onClick={() => onTaskClick(task)} // <-- KLIK DISINI
                                                initial={{ scaleX: 0 }}
                                                animate={{ scaleX: 1 }}
                                                className={`h-full rounded-full absolute shadow-sm transition-all hover:shadow-md hover:scale-y-110 cursor-pointer pointer-events-auto ${getStatusColor(task.status)}`}
                                                style={{ left, width }}
                                                title={`Klik untuk detail: ${task.task_title}`}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-white flex justify-between items-center z-30 relative">
                <div className="text-xs text-slate-500 font-medium">
                    Halaman {currentPage} dari {totalPages} <span className="text-slate-400">({validTasks.length} Tugas)</span>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft />
                    </button>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
}