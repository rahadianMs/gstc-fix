"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // <-- Import Router
import ResourceModal from './ResourceModal';

// Ikon
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;

export default function ResourceAdminPage({ supabase, user }) {
    const router = useRouter(); // <-- Init Router
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resourceToEdit, setResourceToEdit] = useState(null);

    const fetchResources = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('learning_resources')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setResources(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchResources();
    }, [supabase]);

    const handleEdit = (resource) => {
        setResourceToEdit(resource);
        setIsModalOpen(true);
    };

    const handleDelete = async (resourceId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus materi ini?")) {
            const { error } = await supabase
                .from('learning_resources')
                .delete()
                .eq('id', resourceId);
            
            if (!error) fetchResources(); 
            else alert(`Gagal menghapus: ${error.message}`);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setResourceToEdit(null);
    };

    const handleSave = () => {
        fetchResources();
        handleModalClose();
    };
    
    const getTypeBadge = (type) => {
        switch(type) {
            case 'pdf': return <span className="text-xs font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">PDF</span>;
            case 'video': return <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Video</span>;
            case 'website': return <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Website</span>;
            default: return null;
        }
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-slate-800">Kelola Materi Pembelajaran</h1>
                    <p className="mt-2 text-lg text-slate-600">Tambah, ubah, atau hapus konten untuk portal e-learning.</p>
                </div>
                <div className="flex items-center gap-4">
                     {/* PERBAIKAN: Gunakan router.push untuk kembali ke list view */}
                     <button 
                        onClick={() => router.push('/dashboard/resources')}
                        className="font-semibold text-slate-600 hover:text-slate-900"
                    >
                        Lihat Halaman User →
                    </button>
                    <button 
                        onClick={() => { setResourceToEdit(null); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-5 py-3 font-semibold text-white rounded-lg shadow-md transition-transform active:scale-95" 
                        style={{backgroundColor: '#1c3d52'}}
                    >
                        <PlusIcon />
                        Tambah Materi Baru
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Judul</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tipe</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Kategori</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-500">Memuat materi...</td></tr>
                        ) : resources.map(resource => (
                            <tr key={resource.id}>
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-800">{resource.title}</div>
                                    <p className="text-sm text-slate-500 max-w-md truncate">{resource.description}</p>
                                </td>
                                <td className="px-6 py-4">
                                    {resource.is_published 
                                        ? <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Published</span>
                                        : <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Draft</span>
                                    }
                                </td>
                                <td className="px-6 py-4">{getTypeBadge(resource.type)}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{resource.category}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => handleEdit(resource)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"><PencilIcon /></button>
                                        <button onClick={() => handleDelete(resource.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-md"><TrashIcon /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                         {resources.length === 0 && !loading && (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-500">Belum ada materi.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <ResourceModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onSave={handleSave}
                    supabase={supabase}
                    user={user}
                    resourceToEdit={resourceToEdit}
                />
            )}
        </div>
    );
}