"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- IKON ---
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default function TaskModal({ isOpen, onClose, supabase, currentUser, onTaskUpserted, taskToEdit, selectedDestination }) {
    const isEditMode = Boolean(taskToEdit);

    // State Form Utama
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [dueDate, setDueDate] = useState('');
    
    // State untuk Multi-Kriteria & Filter
    const [selectedCriteriaList, setSelectedCriteriaList] = useState([]); // Array kriteria yang dipilih
    const [tempCriterionId, setTempCriterionId] = useState(''); // Nilai dropdown sementara
    const [selectedPillarFilter, setSelectedPillarFilter] = useState('All'); // Filter Pilar (All, A, B, C, D)
    
    // State UI
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [criteriaList, setCriteriaList] = useState([]);

    // 1. Fetch Data Kriteria saat Modal Dibuka (dengan Sorting Natural)
    useEffect(() => {
        const fetchCriteria = async () => {
            const { data } = await supabase
                .from('gstc_criteria')
                .select('id, criterion_code, criterion_title, pillar');
            
            if (data) {
                // Sorting Natural agar urutan A1, A2, A10 benar
                const sortedData = data.sort((a, b) => {
                    return a.criterion_code.localeCompare(b.criterion_code, undefined, { numeric: true, sensitivity: 'base' });
                });
                setCriteriaList(sortedData);
            }
        };
        if (isOpen) fetchCriteria();
    }, [isOpen, supabase]);

    // 2. Isi Form saat Mode Edit
    useEffect(() => {
        if (isEditMode && taskToEdit) {
            setTaskTitle(taskToEdit.task_title || '');
            setTaskDescription(taskToEdit.task_description || '');
            setAssignedTo(taskToEdit.assigned_to || '');
            setDueDate(taskToEdit.due_date || '');
            
            // Load kriteria dari kolom JSONB (criteria_tags)
            // Fallback ke kolom lama (related_criterion_id) jika data lama
            if (taskToEdit.criteria_tags && Array.isArray(taskToEdit.criteria_tags) && taskToEdit.criteria_tags.length > 0) {
                setSelectedCriteriaList(taskToEdit.criteria_tags);
            } else if (taskToEdit.related_criterion_id && criteriaList.length > 0) {
                const oldCriterion = criteriaList.find(c => c.id === taskToEdit.related_criterion_id);
                if (oldCriterion) setSelectedCriteriaList([oldCriterion]);
            } else {
                setSelectedCriteriaList([]);
            }
        }
    }, [taskToEdit, isEditMode, criteriaList]);

    // Helper: Tambah Kriteria ke List
    const handleAddCriterion = () => {
        if (!tempCriterionId) return;
        
        // Cek duplikasi
        const exists = selectedCriteriaList.some(c => c.id.toString() === tempCriterionId.toString());
        if (exists) {
            alert("Kriteria ini sudah ditambahkan.");
            return;
        }

        const criterionToAdd = criteriaList.find(c => c.id.toString() === tempCriterionId.toString());
        if (criterionToAdd) {
            setSelectedCriteriaList([...selectedCriteriaList, criterionToAdd]);
            setTempCriterionId(''); // Reset dropdown setelah tambah
        }
    };

    // Helper: Hapus Kriteria dari List
    const handleRemoveCriterion = (idToRemove) => {
        setSelectedCriteriaList(selectedCriteriaList.filter(c => c.id !== idToRemove));
    };

    const resetForm = () => {
        setTaskTitle('');
        setTaskDescription('');
        setAssignedTo('');
        setDueDate('');
        setSelectedCriteriaList([]);
        setTempCriterionId('');
        setSelectedPillarFilter('All');
        setMessage('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // 3. Fungsi Submit (Perbaikan Logika Response)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const taskData = {
            task_title: taskTitle,
            task_description: taskDescription,
            assigned_to: assignedTo,
            due_date: dueDate || null,
            // Simpan sebagai array JSONB
            criteria_tags: selectedCriteriaList, 
            related_criterion_id: null // Kosongkan kolom lama
        };

        let data, error;

        // Gunakan .select() tanpa .single() untuk menghindari error RLS
        if (isEditMode) {
            const response = await supabase
                .from('action_plan_tasks')
                .update(taskData)
                .eq('id', taskToEdit.id)
                .select();
            
            data = response.data;
            error = response.error;
        } else {
            const destinationId = selectedDestination ? selectedDestination.id : currentUser.id;
            const response = await supabase
                .from('action_plan_tasks')
                .insert({
                    ...taskData,
                    destination_id: destinationId,
                    created_by: currentUser.id,
                })
                .select();
            
            data = response.data;
            error = response.error;
        }

        if (error) {
            setMessage(`Gagal menyimpan tugas: ${error.message}`);
        } else {
            // Cek apakah data berhasil dikembalikan
            if (data && data.length > 0) {
                if (onTaskUpserted) onTaskUpserted(data[0]); // Kirim data terbaru ke parent
                handleClose();
            } else {
                // Sukses tapi tidak ada data balik (biasanya karena RLS)
                handleClose();
                // Trigger refresh manual di parent jika perlu
                if (onTaskUpserted) onTaskUpserted({ ...taskData, id: isEditMode ? taskToEdit.id : 'temp' });
            }
        }
        setLoading(false);
    };

    // Filter Kriteria di Dropdown berdasarkan Pilar
    const filteredCriteria = selectedPillarFilter === 'All' 
        ? criteriaList 
        : criteriaList.filter(c => c.pillar === selectedPillarFilter);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" 
                onClick={handleClose}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 30 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.9, y: 30 }} 
                    transition={{ type: "spring", stiffness: 300, damping: 30 }} 
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-auto max-h-[90vh] flex flex-col" 
                    onClick={(e) => e.stopPropagation()}
                >
                    <header className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Tugas' : 'Tambah Tugas Baru'}</h3>
                        <button onClick={handleClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100"><CloseIcon /></button>
                    </header>
                    
                    <div className="overflow-y-auto">
                        <form onSubmit={handleSubmit}>
                            <main className="p-8 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Judul Tugas *</label>
                                    <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3f545f]" placeholder="Contoh: Membuat SOP pengelolaan sampah..." />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi (Opsional)</label>
                                    <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} rows="3" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3f545f]" placeholder="Jelaskan detail tugas..."></textarea>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-1">Ditugaskan Kepada</label><input type="text" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Nama orang/divisi"/></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-1">Batas Waktu</label><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" /></div>
                                </div>
                                
                                {/* --- AREA MULTI-SELECT KRITERIA --- */}
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Hubungkan dengan Kriteria GSTC</label>
                                    
                                    {/* Tombol Filter Pilar */}
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

                                    {/* Dropdown & Tombol Tambah */}
                                    <div className="flex gap-2 mb-3">
                                        <select 
                                            value={tempCriterionId} 
                                            onChange={(e) => setTempCriterionId(e.target.value)} 
                                            className="flex-1 p-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#3f545f]"
                                        >
                                            <option value="">-- Pilih Kriteria --</option>
                                            {filteredCriteria.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.criterion_code}: {c.criterion_title}
                                                </option>
                                            ))}
                                        </select>
                                        <button 
                                            type="button"
                                            onClick={handleAddCriterion}
                                            disabled={!tempCriterionId}
                                            className="px-4 py-2 bg-[#3f545f] text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
                                        >
                                            + Tambah
                                        </button>
                                    </div>

                                    {/* Daftar Kriteria Terpilih (Chips) */}
                                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                                        {selectedCriteriaList.length === 0 && <p className="text-xs text-slate-400 italic py-2">Belum ada kriteria yang dipilih.</p>}
                                        {selectedCriteriaList.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-1 pl-3 pr-2 py-1 bg-white border border-slate-300 rounded-full text-xs font-medium text-slate-700 shadow-sm animate-fadeIn">
                                                <span>
                                                    <strong className="text-[#3f545f] mr-1">{item.criterion_code}</strong> 
                                                    {item.criterion_title.length > 20 ? item.criterion_title.substring(0, 20) + '...' : item.criterion_title}
                                                </span>
                                                <button type="button" onClick={() => handleRemoveCriterion(item.id)} className="p-1 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors">
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {message && <p className="text-sm text-red-600 mt-2 text-center bg-red-50 p-2 rounded">{message}</p>}
                            </main>

                            <footer className="flex-shrink-0 p-6 bg-slate-50 border-t flex justify-end items-center gap-4 sticky bottom-0">
                                <button type="button" onClick={handleClose} className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors">Batal</button>
                                <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50" style={{backgroundColor: '#1c3d52'}}>
                                    {loading ? 'Menyimpan...' : 'Simpan Tugas'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}