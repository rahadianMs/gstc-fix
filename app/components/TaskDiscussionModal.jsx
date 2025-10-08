"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default function TaskDiscussionModal({ isOpen, onClose, task, user, supabase }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchMessages = async () => {
        if (!task) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('action_plan_comments')
            .select(`*, sender:profiles(full_name, destination_name, role)`)
            .eq('task_id', task.id)
            .order('created_at', { ascending: true });

        if (data) setMessages(data);
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
        }
    }, [isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const { data, error } = await supabase
            .from('action_plan_comments')
            .insert({ task_id: task.id, sender_id: user.id, message: newMessage.trim() })
            .select(`*, sender:profiles(full_name, destination_name, role)`)
            .single();
        
        if (data) {
            setMessages(currentMessages => [...currentMessages, data]);
            setNewMessage('');
        }
    };

    const getSenderName = (sender) => {
        if (!sender) return 'Pengguna';
        if (sender.role === 'consultant') return sender.full_name || 'Konsultan';
        return sender.destination_name || 'Destinasi';
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <header className="p-6 border-b">
                        <h3 className="text-lg font-bold text-slate-800">Diskusi: {task.task_title}</h3>
                        <p className="text-sm text-slate-500">Diskusikan progres dan kendala terkait tugas ini.</p>
                    </header>
                    
                    <main className="flex-1 p-6 space-y-4 overflow-y-auto">
                        {loading ? <p>Memuat pesan...</p> : messages.map(msg => {
                            const isMyMessage = msg.sender_id === user.id;
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                    <div className={`relative p-3 rounded-lg max-w-md ${isMyMessage ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                        <div className="font-bold text-sm text-slate-800">{getSenderName(msg.sender)}</div>
                                        <p className="text-sm text-slate-700">{msg.message}</p>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">{new Date(msg.created_at).toLocaleString('id-ID')}</p>
                                </div>
                            );
                        })}
                        {messages.length === 0 && !loading && <p className="text-center text-slate-500 py-10">Belum ada diskusi.</p>}
                    </main>

                    <footer className="p-4 bg-slate-50 border-t">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Tulis balasan..." className="flex-1 p-2 border border-slate-300 rounded-lg"/>
                            <button type="submit" className="px-5 py-2 font-semibold text-white rounded-lg" style={{backgroundColor: '#1c3d52'}}>Kirim</button>
                        </form>
                    </footer>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}