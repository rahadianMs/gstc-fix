"use client";

import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function TaskGanttChart({ tasks }) {
    // Filter tugas yang memiliki due_date valid
    const validTasks = useMemo(() => {
        return tasks.filter(t => t.due_date && t.created_at).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    }, [tasks]);

    if (validTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10 text-center">
                <p className="font-medium">Visualisasi Gantt Chart</p>
                <p className="text-sm mt-2">Belum ada tugas dengan tenggat waktu yang valid untuk ditampilkan.</p>
            </div>
        );
    }

    // Tentukan rentang waktu global
    const minDate = new Date(Math.min(...validTasks.map(t => new Date(t.created_at))));
    const maxDate = new Date(Math.max(...validTasks.map(t => new Date(t.due_date))));
    
    // Tambahkan buffer hari agar grafik tidak terlalu mepet
    minDate.setDate(minDate.getDate() - 2);
    maxDate.setDate(maxDate.getDate() + 5);

    const totalDuration = maxDate - minDate;

    const getPosition = (dateStr) => {
        const date = new Date(dateStr);
        return ((date - minDate) / totalDuration) * 100;
    };

    const getDurationPercent = (startStr, endStr) => {
        const start = new Date(startStr);
        const end = new Date(endStr);
        return ((end - start) / totalDuration) * 100;
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Done': return '#10B981'; // Green
            case 'In Progress': return '#3B82F6'; // Blue
            default: return '#94A3B8'; // Slate (To Do)
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">Timeline Tugas</h3>
                <div className="flex gap-3 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span> To Do</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> On Progress</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Selesai</div>
                </div>
            </div>
            
            <div className="flex-1 overflow-auto p-6 relative">
                {/* Grid Garis Waktu (Opsional, sederhana saja) */}
                <div className="absolute inset-0 top-6 px-6 flex justify-between pointer-events-none opacity-10">
                    {[...Array(5)].map((_, i) => <div key={i} className="w-px h-full bg-slate-900"></div>)}
                </div>

                <div className="space-y-6 relative z-10">
                    {validTasks.map(task => {
                        const left = getPosition(task.created_at);
                        const width = Math.max(getDurationPercent(task.created_at, task.due_date), 1); // Min width 1%
                        const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'Done';

                        return (
                            <div key={task.id} className="relative">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-semibold text-slate-700 truncate max-w-[200px]" title={task.task_title}>
                                        {task.task_title}
                                    </span>
                                    <span className={`${isOverdue ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                        {new Date(task.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
                                    <motion.div
                                        className="h-full rounded-full absolute"
                                        style={{ 
                                            left: `${left}%`, 
                                            width: `${width}%`,
                                            backgroundColor: getStatusColor(task.status)
                                        }}
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}