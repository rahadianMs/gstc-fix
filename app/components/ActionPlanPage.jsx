"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskModal from './TaskModal';
import TaskDetailPanel from './TaskDetailPanel';
import StatusSelector from './StatusSelector';
import TaskGanttChart from './TaskGanttChart';

// --- IKON ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>;

export default function ActionPlanPage({ supabase, user, userRole }) {
    const [tasks, setTasks] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    
    // State Filter
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPillar, setFilterPillar] = useState('all'); 

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
        // FETCH DATA LENGKAP: creator & criteria_tags sudah ada di '*'
        const { data, error } = await supabase
            .from('action_plan_tasks')
            .select(`*, creator:profiles!action_plan_tasks_created_by_fkey(full_name, role)`) 
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
            fetchTasks(selectedClientId);
        }
    };

    const handleTaskUpserted = (upsertedTask) => {
        // Refresh data agar relasi creator & tags ter-load sempurna
        fetchTasks(selectedClientId);
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        if (selectedTask && selectedTask.id === upsertedTask.id) {
            // Update detail view jika sedang dibuka
            setSelectedTask(upsertedTask); 
        }
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

    // --- LOGIKA FILTER GANDA (Status & Multi-Pilar) ---
    const filteredTasks = tasks.filter(t => {
        const statusKey = t.status.toLowerCase().replace(/\s+/g, ''); // Hapus spasi
        
        // Filter Status
        const statusMatch = filterStatus === 'all' || statusKey === filterStatus;
        
        // Filter Pilar (Cek di dalam array criteria_tags)
        let pillarMatch = true;
        if (filterPillar !== 'all') {
            const tags = t.criteria_tags || [];
            // True jika minimal SATU tag memiliki pilar yang sesuai
            pillarMatch = tags.some(tag => tag.pillar === filterPillar);
        }
        
        return statusMatch && pillarMatch;
    });

    const stats = {
        total: tasks.length,
        done: tasks.filter(t => t.status === 'Done').length,
        waiting: tasks.filter(t => t.status === 'Waiting Verification').length
    };

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col pb-4">
            
            {/* HEADER SECTION */}
            <div className="flex-shrink-0 mb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Action Plan</h1>
                        <p className="text-slate-500 mt-1">
                            {userRole === 'consultant' 
                                ? 'Kelola dan verifikasi rencana aksi klien.' 
                                : 'Kelola rencana aksi dan ajukan verifikasi.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {userRole === 'consultant' && (
                            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                                <div className="p-2 bg-blue-50 rounded-md text-blue-600"><UserGroupIcon /></div>
                                <select value={selectedClientId || ''} onChange={(e) => setSelectedClientId(e.target.value)} className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer min-w-[200px]">
                                    <option value="" disabled>Pilih Klien...</option>
                                    {clients.map(client => (<option key={client.id} value={client.id}>{client.destination_name}</option>))}
                                </select>
                            </div>
                        )}

                        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-5 py-3 font-semibold text-white rounded-lg shadow-md transition-transform active:scale-95 hover:opacity-90" style={{ backgroundColor: '#1c3d52' }}>
                            <PlusIcon /> Tambah Tugas
                        </button>
                    </div>
                </div>

                {/* FILTER BAR */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 overflow-x-auto p-1">
                        {/* Filter Status */}
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                            {[
                                { key: 'all', label: 'Semua' },
                                { key: 'todo', label: 'To Do' },
                                { key: 'inprogress', label: 'In Progress' },
                                { key: 'waitingverification', label: 'Done (Waiting)' }, 
                                { key: 'done', label: 'Done' }
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => setFilterStatus(item.key)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all capitalize whitespace-nowrap ${
                                        filterStatus === item.key 
                                        ? 'bg-white text-[#1c3d52] shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Filter Pilar */}
                        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                            <FilterIcon className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pilar:</span>
                            <div className="flex gap-1">
                                {['all', 'A', 'B', 'C', 'D'].map((pillar) => (
                                    <button
                                        key={pillar}
                                        onClick={() => setFilterPillar(pillar)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                            filterPillar === pillar
                                            ? 'bg-[#1c3d52] text-white shadow-md'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                    >
                                        {pillar === 'all' ? 'All' : pillar}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 px-4 text-sm font-medium text-slate-500 border-l border-slate-100 pl-6 hidden md:flex">
                        <span>Total: {stats.total}</span>
                        {stats.waiting > 0 && <span className="text-amber-600 flex items-center gap-1 font-bold">Verifikasi: {stats.waiting}</span>}
                        <span className="text-green-600 flex items-center gap-1"><CheckCircleIcon /> Selesai: {stats.done}</span>
                    </div>
                </div>
            </div>

            {/* CONTENT SECTION */}
            <div className="flex-1 min-h-0 flex gap-6 overflow-hidden">
                
                {/* Task List (Left) */}
                <div className={`flex-1 overflow-y-auto pr-2 space-y-3 pb-20 ${selectedTask ? 'hidden md:block' : ''}`}>
                    {loading ? (
                        <div className="text-center py-20 text-slate-400">Memuat tugas...</div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-500 font-medium">Tidak ada tugas ditemukan.</p>
                            <p className="text-xs text-slate-400 mt-1">Coba ubah filter atau tambah tugas baru.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredTasks.map(task => {
                                const isConsultantTask = task.creator?.role === 'consultant';
                                const isDestinationUser = userRole === 'destination';
                                
                                // LOGIKA RESTRITKSI STATUS (User tidak bisa langsung Done jika tugas dari Konsultan)
                                let restrictedStatus = [];
                                if (isDestinationUser && isConsultantTask) {
                                    restrictedStatus = ['Done']; 
                                }

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
                                                    restrictedOptions={restrictedStatus}
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
                                        
                                        {/* TAMPILAN MULTI-TAGS DI CARD */}
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {task.criteria_tags && task.criteria_tags.slice(0, 3).map((tag, idx) => (
                                                <span key={idx} className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                    {tag.criterion_code}
                                                </span>
                                            ))}
                                            {task.criteria_tags && task.criteria_tags.length > 3 && (
                                                <span className="text-[10px] text-slate-400 self-center">+{task.criteria_tags.length - 3}</span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-1">
                                            {task.assigned_to ? (
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                                                        {task.assigned_to.charAt(0)}
                                                    </span>
                                                    {task.assigned_to}
                                                </p>
                                            ) : <span></span>}
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

                {/* Task Detail / Gantt Chart (Right) */}
                <div className={`flex-1 md:flex-[1.2] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full ${!selectedTask ? 'hidden md:flex' : ''}`}>
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
                        <div className="flex-1 bg-slate-50 p-4 h-full overflow-hidden">
                            {/* Gantt Chart (Klik bar -> Buka Detail) */}
                            <TaskGanttChart 
                                tasks={filteredTasks} 
                                onTaskClick={handleTaskClick} 
                            />
                        </div>
                    )}
                </div>
            </div>

            {isAddModalOpen && <TaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onTaskUpserted={handleTaskUpserted} supabase={supabase} currentUser={user} selectedDestination={{id: selectedClientId}} />}
            {isEditModalOpen && selectedTask && <TaskModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onTaskUpserted={handleTaskUpserted} supabase={supabase} currentUser={user} taskToEdit={selectedTask} selectedDestination={{id: selectedClientId}} />}
        </div>
    );
}