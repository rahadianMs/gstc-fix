"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskModal from './TaskModal';
import TaskDetailPanel from './TaskDetailPanel';
import StatusSelector from './StatusSelector';

// --- IKON ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>;
const ChatBubbleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-2.138a.562.562 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.397 48.397 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>;
const ViewIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export default function ActionPlanPage({ supabase, user, userRole }) {
    const [tasks, setTasks] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    // State KHUSUS KONSULTAN
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState(null); 

    useEffect(() => {
        if (userRole === 'consultant') {
            fetchClients();
        } else if (user) {
            setSelectedClientId(user.id);
        }
    }, [user, userRole, supabase]);

    useEffect(() => {
        if (selectedClientId) {
            fetchTasks(selectedClientId);
        } else {
            setTasks([]); 
            setLoading(false);
        }
    }, [selectedClientId, supabase]);

    const fetchClients = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('id, destination_name, role')
            .neq('role', 'consultant') 
            .order('destination_name');
        
        if (!error && data) {
            setClients(data);
            if (data.length > 0) setSelectedClientId(data[0].id); 
        }
        setLoading(false);
    };

    const fetchTasks = async (targetUserId) => {
        setLoading(true);
        // PERBAIKAN: Gunakan alias 'creator' agar lebih jelas
        const { data, error } = await supabase
            .from('action_plan_tasks')
            .select('*, creator:profiles!action_plan_tasks_created_by_fkey(full_name, role)') 
            .eq('destination_id', targetUserId)
            .order('created_at', { ascending: false });

        if (error) console.error("Error fetching tasks:", error);
        else setTasks(data || []);
        setLoading(false);
    };

    const handleStatusChange = async (taskId, newStatus) => {
        setTasks(currentTasks => currentTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        const { error } = await supabase.from('action_plan_tasks').update({ status: newStatus }).eq('id', taskId);
        if (error) {
            console.error("Gagal mengubah status:", error);
            alert("Gagal memperbarui status.");
            fetchTasks(selectedClientId); // Revert jika gagal
        }
    };

    const handleTaskUpserted = (upsertedTask) => {
        setTasks(prevTasks => {
            const exists = prevTasks.find(t => t.id === upsertedTask.id);
            if (exists) {
                return prevTasks.map(t => t.id === upsertedTask.id ? upsertedTask : t);
            } else {
                return [upsertedTask, ...prevTasks];
            }
        });
        if (selectedTask && selectedTask.id === upsertedTask.id) {
            setSelectedTask(upsertedTask);
        }
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        // Refresh data agar relasi creator ter-load ulang dengan benar
        fetchTasks(selectedClientId);
    };

    const handleDeleteTask = async () => {
        if (!selectedTask) return;
        const { error } = await supabase.from('action_plan_tasks').delete().eq('id', selectedTask.id);
        if (error) {
            alert(`Gagal menghapus: ${error.message}`);
        } else {
            setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
            setSelectedTask(null);
        }
    };

    const handleTaskClick = (task) => setSelectedTask(task);
    const handleEditClick = () => setIsEditModalOpen(true);

    const filteredTasks = filterStatus === 'all' 
        ? tasks 
        : tasks.filter(t => t.status.replace(' ', '').toLowerCase() === filterStatus);

    const stats = {
        total: tasks.length,
        done: tasks.filter(t => t.status === 'Done').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length
    };

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            
            {/* HEADER SECTION */}
            <div className="flex-shrink-0 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Action Plan</h1>
                        <p className="text-slate-500 mt-1">
                            {userRole === 'consultant' 
                                ? 'Kelola rencana aksi untuk klien Anda.' 
                                : 'Kelola rencana aksi keberlanjutan Anda.'}
                        </p>
                    </div>

                    {userRole === 'consultant' && (
                        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                            <div className="p-2 bg-blue-50 rounded-md text-blue-600">
                                <UserGroupIcon />
                            </div>
                            <select 
                                value={selectedClientId || ''} 
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer min-w-[200px]"
                            >
                                <option value="" disabled>Pilih Klien...</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.destination_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button 
                        onClick={() => setIsAddModalOpen(true)} 
                        className="flex items-center gap-2 px-5 py-3 font-semibold text-white rounded-lg shadow-md transition-transform active:scale-95 hover:opacity-90"
                        style={{ backgroundColor: '#1c3d52' }}
                    >
                        <PlusIcon /> Tambah Tugas
                    </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex gap-2 overflow-x-auto p-1">
                        {['all', 'todo', 'inprogress', 'done'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                                    filterStatus === status 
                                    ? 'bg-[#1c3d52] text-white shadow-md' 
                                    : 'text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                {status === 'todo' ? 'To Do' : status === 'inprogress' ? 'In Progress' : status}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 px-4 text-sm font-medium text-slate-500 border-l border-slate-100 pl-6">
                        <span>Total: {stats.total}</span>
                        <span className="text-green-600 flex items-center gap-1"><CheckCircleIcon /> Selesai: {stats.done}</span>
                    </div>
                </div>
            </div>

            {/* CONTENT SECTION */}
            <div className="flex-1 min-h-0 flex gap-6">
                
                {/* Task List (Left) */}
                <div className={`flex-1 overflow-y-auto pr-2 space-y-3 ${selectedTask ? 'hidden md:block' : ''}`}>
                    {loading ? (
                        <div className="text-center py-20 text-slate-400">Memuat tugas...</div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-500 font-medium">Belum ada tugas.</p>
                            <p className="text-xs text-slate-400 mt-1">Buat rencana aksi baru untuk memulai.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredTasks.map(task => {
                                // --- LOGIKA IZIN EDIT STATUS ---
                                const isConsultantTask = task.creator?.role === 'consultant';
                                const isDestinationUser = userRole === 'destination';
                                
                                // Kunci (Disabled) jika: User adalah Destinasi DAN Task dibuat oleh Konsultan
                                const isStatusDisabled = isDestinationUser && isConsultantTask;

                                return (
                                    <motion.div
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        onClick={() => handleTaskClick(task)}
                                        className={`group p-5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                                            selectedTask?.id === task.id 
                                            ? 'bg-blue-50 border-blue-200 shadow-md ring-1 ring-blue-200' 
                                            : 'bg-white border-slate-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <StatusSelector 
                                                    currentStatus={task.status} 
                                                    onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                                                    disabled={isStatusDisabled} // <-- TERAPKAN LOGIKA DI SINI
                                                />
                                            </div>
                                            
                                            {task.due_date && (
                                                <span className={`text-xs font-semibold ${
                                                    new Date(task.due_date) < new Date() && task.status !== 'Done' ? 'text-red-500' : 'text-slate-400'
                                                }`}>
                                                    Due: {new Date(task.due_date).toLocaleDateString('id-ID')}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className={`font-bold text-lg mb-1 group-hover:text-blue-700 transition-colors ${selectedTask?.id === task.id ? 'text-blue-800' : 'text-slate-800'}`}>
                                            {task.task_title}
                                        </h3>
                                        <div className="flex items-center justify-between mt-2">
                                            {task.assigned_to && (
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                                                        {task.assigned_to.charAt(0)}
                                                    </span>
                                                    {task.assigned_to}
                                                </p>
                                            )}
                                            {/* Indikator Pembuat Tugas */}
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${task.creator?.role === 'consultant' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                Oleh: {task.creator?.role === 'consultant' ? 'Konsultan' : 'Anda'}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>

                {/* Task Detail Panel */}
                <div className={`flex-1 md:flex-[1.2] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${!selectedTask ? 'hidden md:flex' : ''}`}>
                    {selectedTask ? (
                        <TaskDetailPanel 
                            isOpen={true} 
                            task={selectedTask} 
                            onClose={() => setSelectedTask(null)} 
                            onEdit={handleEditClick} 
                            onDelete={handleDeleteTask}
                            supabase={supabase}
                            user={user}
                            userRole={userRole}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            </div>
                            <p className="font-medium">Pilih tugas untuk melihat detail</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {isAddModalOpen && (
                <TaskModal 
                    isOpen={isAddModalOpen} 
                    onClose={() => setIsAddModalOpen(false)} 
                    onTaskUpserted={handleTaskUpserted} 
                    supabase={supabase}
                    currentUser={user}
                    selectedDestination={{id: selectedClientId}} 
                />
            )}

            {isEditModalOpen && selectedTask && (
                <TaskModal 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)} 
                    onTaskUpserted={handleTaskUpserted} 
                    supabase={supabase}
                    currentUser={user}
                    taskToEdit={selectedTask} 
                    selectedDestination={{id: selectedClientId}} 
                />
            )}
        </div>
    );
}