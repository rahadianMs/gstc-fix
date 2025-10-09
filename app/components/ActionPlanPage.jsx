// app/components/ActionPlanPage.jsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskModal from './TaskModal';
import StatusSelector from './StatusSelector';
import TaskDiscussionModal from './TaskDiscussionModal';
import TaskDetailPanel from './TaskDetailPanel';
import CalendarView from './CalendarView'; // <-- Impor komponen kalender baru
import { ChatBubbleIcon, CalendarDaysIcon } from './Icons'; // <-- Impor ikon kalender

// --- Komponen Ikon ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const ViewIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const TableIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h.008v.008h-.008v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;


export default function ActionPlanPage({ supabase, user, userRole }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State untuk Modal dan Panel
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
    const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // State untuk Alur Konsultan
    const [destinations, setDestinations] = useState([]);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [loadingDestinations, setLoadingDestinations] = useState(false);
    
    // State baru untuk mode tampilan
    const [viewMode, setViewMode] = useState('table'); 

    // Fungsi untuk mengambil data tugas
    const fetchTasks = async (destinationId) => {
        if (!user || !destinationId) return;
        setLoading(true);
        let { data, error } = await supabase
            .from('action_plan_tasks')
            .select(`
                *,
                gstc_criteria ( criterion_code ),
                creator:profiles!action_plan_tasks_created_by_fkey( role )
            `)
            .eq('destination_id', destinationId)
            .order('due_date', { ascending: true, nullsFirst: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching action plan:", error);
            setError('Gagal memuat data rencana aksi.');
        } else {
            setTasks(data || []);
        }
        setLoading(false);
    };

    // Efek utama untuk menentukan alur
    useEffect(() => {
        if (userRole === 'consultant') {
            setLoadingDestinations(true);
            supabase.from('profiles').select('id, destination_name').eq('role', 'destination')
                .then(({ data, error }) => {
                    if (data) setDestinations(data);
                    setLoadingDestinations(false);
                });
        } else if (userRole === 'destination') {
            setSelectedDestination({ id: user.id, destination_name: 'Action Plan Anda' });
        }
    }, [userRole, user, supabase]);

    // Efek untuk memuat tugas ketika destinasi dipilih
    useEffect(() => {
        if (selectedDestination) {
            fetchTasks(selectedDestination.id);
        }
    }, [selectedDestination]);

    // Handler setelah tugas ditambahkan atau diubah
    const handleTaskUpserted = () => {
        fetchTasks(selectedDestination.id);
    };
    
    // Handler untuk mengubah status
    const handleStatusChange = async (taskId, newStatus) => {
        setTasks(currentTasks => currentTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        const { error } = await supabase.from('action_plan_tasks').update({ status: newStatus }).eq('id', taskId);
        if (error) {
            console.error("Gagal mengubah status:", error);
            alert("Gagal memperbarui status. Memuat ulang data...");
            fetchTasks(selectedDestination.id);
        }
    };
    
    // Handler untuk menghapus tugas
    const handleDelete = async () => {
        if (!selectedTask) return;
        setTasks(currentTasks => currentTasks.filter(t => t.id !== selectedTask.id));
        const { error } = await supabase.from('action_plan_tasks').delete().eq('id', selectedTask.id);
        if (error) {
            console.error("Gagal menghapus tugas:", error);
            alert("Gagal menghapus tugas. Memuat ulang data...");
            fetchTasks(selectedDestination.id);
        }
        setIsDeleteConfirmOpen(false);
        setSelectedTask(null);
        setIsDetailPanelOpen(false); // Tutup panel detail setelah hapus
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return <span className="text-slate-400">N/A</span>;
        const date = new Date(dateString + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isPast = date < today;
        return <span className={isPast ? 'text-red-500 font-semibold' : ''}>{new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)}</span>;
    };


    // Tampilan Pemilihan Destinasi untuk Konsultan
    if (userRole === 'consultant' && !selectedDestination) {
         return (
             <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-slate-800">Pilih Destinasi</h1>
                <p className="mt-2 text-lg text-slate-600">Pilih destinasi untuk melihat atau mengelola Action Plan mereka.</p>
                {loadingDestinations ? <p className="mt-8">Memuat daftar destinasi...</p> : (
                    <div className="mt-8 space-y-4">
                        {destinations.map(dest => (
                            <button key={dest.id} onClick={() => setSelectedDestination(dest)} className="w-full text-left p-6 bg-white rounded-xl shadow-sm border hover:border-emerald-600 transition-colors">
                                <h3 className="font-semibold text-lg">{dest.destination_name}</h3>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-800">{selectedDestination?.destination_name || 'Action Plan'}</h1>
                        <p className="mt-2 text-lg text-slate-600">Kelola dan lacak tugas-tugas untuk mencapai kepatuhan standar.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center p-1 rounded-lg bg-slate-200">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-white shadow-sm' : ''}`}
                                title="Table View"
                            >
                                <TableIcon />
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`p-2 rounded-md ${viewMode === 'calendar' ? 'bg-white shadow-sm' : ''}`}
                                title="Calendar View"
                            >
                                <CalendarDaysIcon />
                            </button>
                        </div>
                        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-5 py-3 font-semibold text-white rounded-lg shadow-md transition-transform active:scale-95" style={{backgroundColor: '#1c3d52'}}>
                            <PlusIcon />
                            Tambah Tugas Baru
                        </button>
                    </div>
                </div>
                
                {viewMode === 'table' ? (
                    <div className="bg-white rounded-xl shadow-md border overflow-hidden">
                        {loading ? <p className="p-8 text-center text-slate-500">Memuat tugas...</p> : error ? <p className="p-8 text-center text-red-500">{error}</p> : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tugas</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ditugaskan Oleh</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Batas Waktu</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Diskusi</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        <AnimatePresence>
                                            {tasks.length > 0 ? tasks.map(task => (
                                                <motion.tr key={task.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4 whitespace-nowrap"><StatusSelector currentStatus={task.status} onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)} /></td>
                                                    <td className="px-6 py-4 max-w-sm">
                                                        <div className="text-sm font-semibold text-slate-900 truncate">{task.task_title}</div>
                                                        {task.gstc_criteria && <div className="text-xs text-slate-500">Kriteria: {task.gstc_criteria.criterion_code}</div>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${task.creator?.role === 'consultant' ? 'bg-cyan-100 text-cyan-800' : 'bg-gray-100 text-gray-800'}`}>{task.creator?.role === 'consultant' ? 'Konsultan' : 'Pribadi'}</span></td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(task.due_date)}</td>
                                                    <td className="px-6 py-4 text-center"><button onClick={() => { setSelectedTask(task); setIsDiscussionOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-full"><ChatBubbleIcon className="w-5 h-5"/></button></td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                                        <button onClick={() => { setSelectedTask(task); setIsDetailPanelOpen(true); }} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-md"><ViewIcon className="w-5 h-5"/></button>
                                                    </td>
                                                </motion.tr>
                                            )) : (
                                                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Belum ada tugas. Klik "Tambah Tugas Baru" untuk memulai.</td></tr>
                                            )}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                     <CalendarView 
                        tasks={tasks}
                        onTaskClick={(task) => {
                            setSelectedTask(task);
                            setIsDetailPanelOpen(true);
                        }}
                    />
                )}
            </div>

            <TaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} supabase={supabase} currentUser={user} selectedDestination={selectedDestination} onTaskUpserted={handleTaskUpserted} />
            <TaskModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedTask(null); }} supabase={supabase} currentUser={user} selectedDestination={selectedDestination} onTaskUpserted={handleTaskUpserted} taskToEdit={selectedTask} />
            <TaskDiscussionModal isOpen={isDiscussionOpen} onClose={() => { setIsDiscussionOpen(false); setSelectedTask(null); }} task={selectedTask} user={user} supabase={supabase} />
            
            <TaskDetailPanel 
                isOpen={isDetailPanelOpen}
                onClose={() => { setIsDetailPanelOpen(false); setSelectedTask(null); }}
                task={selectedTask}
                user={user}
                userRole={userRole}
                onEdit={() => { setIsDetailPanelOpen(false); setIsEditModalOpen(true); }}
                onDelete={() => { setIsDetailPanelOpen(false); setIsDeleteConfirmOpen(true); }}
            />

            <AnimatePresence>
                {isDeleteConfirmOpen && selectedTask && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
                            <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
                            <p className="text-slate-600 mb-6">Apakah Anda yakin ingin menghapus tugas <span className="font-semibold">"{selectedTask.task_title}"</span>?</p>
                            <div className="flex justify-end gap-4"><button onClick={() => setIsDeleteConfirmOpen(false)} className="px-4 py-2 text-sm font-medium">Batal</button><button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg">Ya, Hapus</button></div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}