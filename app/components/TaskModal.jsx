"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default function TaskModal({ isOpen, onClose, supabase, currentUser, onTaskUpserted, taskToEdit, selectedDestination }) {
    const isEditMode = Boolean(taskToEdit);

    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [relatedCriterionId, setRelatedCriterionId] = useState('');
    
    // State Filter Pilar
    const [selectedPillarFilter, setSelectedPillarFilter] = useState('All'); 
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [criteriaList, setCriteriaList] = useState([]);

    // --- PERBAIKAN 1: SORTING NATURAL ---
    useEffect(() => {
        const fetchCriteria = async () => {
            const { data } = await supabase
                .from('gstc_criteria')
                .select('id, criterion_code, criterion_title, pillar'); // Hapus .order() dari DB
            
            if (data) {
                // Lakukan sorting di sisi client agar A1, A2, A10 berurutan benar
                const sortedData = data.sort((a, b) => {
                    return a.criterion_code.localeCompare(b.criterion_code, undefined, { numeric: true, sensitivity: 'base' });
                });
                setCriteriaList(sortedData);
            }
        };
        if (isOpen) fetchCriteria();
    }, [isOpen, supabase]);

    useEffect(() => {
        if (isEditMode && taskToEdit) {
            setTaskTitle(taskToEdit.task_title || '');
            setTaskDescription(taskToEdit.task_description || '');
            setAssignedTo(taskToEdit.assigned_to || '');
            setDueDate(taskToEdit.due_date || '');
            setRelatedCriterionId(taskToEdit.related_criterion_id || '');
            
            if (taskToEdit.related_criterion_id && criteriaList.length > 0) {
                const savedCriterion = criteriaList.find(c => c.id === taskToEdit.related_criterion_id);
                if (savedCriterion) {
                    setSelectedPillarFilter(savedCriterion.pillar);
                }
            }
        }
    }, [taskToEdit, isEditMode, criteriaList]);

    const resetForm = () => {
        setTaskTitle('');
        setTaskDescription('');
        setAssignedTo('');
        setDueDate('');
        setRelatedCriterionId('');
        setSelectedPillarFilter('All');
        setMessage('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const taskData = {
            task_title: taskTitle,
            task_description: taskDescription,
            assigned_to: assignedTo,
            due_date: dueDate || null,
            related_criterion_id: relatedCriterionId || null,
        };

        let response;
        if (isEditMode) {
            response = await supabase.from('action_plan_tasks').update(taskData).eq('id', taskToEdit.id).select().single();
        } else {
            const destinationId = selectedDestination ? selectedDestination.id : currentUser.id;
            response = await supabase.from('action_plan_tasks').insert({
                ...taskData,
                destination_id: destinationId,
                created_by: currentUser.id,
            }).select().single();
        }

        const { data, error } = response;

        if (error) {
            setMessage(`Gagal menyimpan tugas: ${error.message}`);
        } else {
            onTaskUpserted(data);
            handleClose();
        }
        setLoading(false);
    };

    const filteredCriteria = selectedPillarFilter === 'All' 
        ? criteriaList 
        : criteriaList.filter(c => c.pillar === selectedPillarFilter);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
                <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-auto max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <header className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Tugas' : 'Tambah Tugas Baru'}</h3>
                        <button onClick={handleClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100"><CloseIcon /></button>
                    </header>
                    
                    <div className="overflow-y-auto">
                        <form onSubmit={handleSubmit}>
                            <main className="p-8 space-y-4">
                                <div>
                                    <label htmlFor="taskTitle" className="block text-sm font-semibold text-slate-700 mb-1">Judul Tugas *</label>
                                    <input id="taskTitle" type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3f545f]" placeholder="Contoh: Membuat SOP pengelolaan sampah..." />
                                </div>
                                
                                <div>
                                    <label htmlFor="taskDescription" className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi (Opsional)</label>
                                    <textarea id="taskDescription" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} rows="3" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3f545f]" placeholder="Jelaskan detail tugas yang perlu dilakukan..."></textarea>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label htmlFor="assignedTo" className="block text-sm font-semibold text-slate-700 mb-1">Ditugaskan Kepada</label><input id="assignedTo" type="text" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Nama orang atau departemen"/></div>
                                    <div><label htmlFor="dueDate" className="block text-sm font-semibold text-slate-700 mb-1">Batas Waktu</label><input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" /></div>
                                </div>
                                
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Hubungkan dengan Kriteria GSTC (Opsional)</label>
                                    
                                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                                        {['All', 'A', 'B', 'C', 'D'].map(pillar => (
                                            <button
                                                key={pillar}
                                                type="button"
                                                onClick={() => setSelectedPillarFilter(pillar)}
                                                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors border ${
                                                    selectedPillarFilter === pillar
                                                        ? 'bg-[#1c3d52] text-white border-[#1c3d52]'
                                                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                                }`}
                                            >
                                                {pillar === 'All' ? 'Semua' : `Pilar ${pillar}`}
                                            </button>
                                        ))}
                                    </div>

                                    <select 
                                        id="relatedCriterion" 
                                        value={relatedCriterionId} 
                                        onChange={(e) => setRelatedCriterionId(e.target.value)} 
                                        className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#3f545f]"
                                    >
                                        <option value="">-- Tidak terhubung dengan kriteria --</option>
                                        {filteredCriteria.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.criterion_code}: {c.criterion_title}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1 ml-1">
                                        Menampilkan {filteredCriteria.length} kriteria {selectedPillarFilter !== 'All' ? `dari Pilar ${selectedPillarFilter}` : ''}.
                                    </p>
                                </div>

                                {message && <p className="text-sm text-red-600 mt-2">{message}</p>}
                            </main>

                            <footer className="flex-shrink-0 p-6 bg-slate-50 border-t flex justify-end items-center gap-4 sticky bottom-0">
                                <button type="button" onClick={handleClose} className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">Batal</button>
                                <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50" style={{backgroundColor: '#1c3d52'}}>{loading ? 'Menyimpan...' : 'Simpan Tugas'}</button>
                            </footer>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}