"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Import Router
import { motion, AnimatePresence } from 'framer-motion';

// ... (Komponen Ikon dan CommentThread TETAP SAMA, salin dari file lama) ...
// Saya singkat di sini untuk fokus ke perubahan:

const PaperAirplaneIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>;

const CommentThread = ({ comment, user, userRole, onDelete, onReply, level = 0 }) => {
    // ... (Isi sama persis seperti file sebelumnya) ...
    const canDelete = user.id === comment.sender_id || userRole === 'consultant';
    const senderName = comment.sender_role === 'consultant' ? (comment.sender_name || 'Konsultan') : (comment.sender_name || 'Destinasi');
    const isConsultant = comment.sender_role === 'consultant';

    return (
        <div>
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${isConsultant ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-200 text-slate-500'}`}>
                    {senderName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 group">
                    <div className="bg-slate-100 rounded-lg px-4 py-2">
                        <div className="flex justify-between items-center">
                            <span className={`font-bold text-sm ${isConsultant ? 'text-cyan-800' : 'text-slate-800'}`}>{senderName}</span>
                            <span className="text-xs text-slate-400">{new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{comment.message}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1 ml-2">
                        {level === 0 && (
                            <button onClick={() => onReply({ id: comment.id, name: senderName })} className="text-xs text-slate-500 font-semibold hover:text-slate-800">
                                Balas
                            </button>
                        )}
                        {canDelete && (
                            <button onClick={() => onDelete(comment.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-red-500 font-semibold">
                                Hapus
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 mt-4 pl-4 border-l-2 space-y-4">
                    {comment.replies.map(reply => (
                        <CommentThread key={reply.id} comment={reply} user={user} userRole={userRole} onDelete={onDelete} onReply={onReply} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

// Hapus prop setActiveDashboardPage
export default function VideoDetailPage({ resourceId, supabase, user, userRole }) {
    const router = useRouter(); // Init Router
    const [resource, setResource] = useState(null);
    const [comments, setComments] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const commentInputRef = useRef(null);

    const getYouTubeVideoId = (url) => {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') return urlObj.pathname.slice(1);
            if (urlObj.hostname.includes('youtube.com')) return urlObj.searchParams.get('v');
        } catch (e) { console.error("Invalid URL:", url); }
        return null;
    };
    
    const fetchVideoData = async () => {
        setLoading(true);
        const [resourceRes, commentsRes] = await Promise.all([
            supabase.from('learning_resources').select('*').eq('id', resourceId).single(),
            supabase.rpc('get_learning_resource_comments', { p_resource_id: resourceId })
        ]);

        if (resourceRes.data) setResource(resourceRes.data);
        if (commentsRes.data) {
            const commentsMap = {};
            const topLevelComments = [];
            commentsRes.data.forEach(comment => {
                commentsMap[comment.id] = { ...comment, replies: [] };
            });
            commentsRes.data.forEach(comment => {
                if (comment.parent_comment_id && commentsMap[comment.parent_comment_id]) {
                    commentsMap[comment.parent_comment_id].replies.push(commentsMap[comment.id]);
                } else {
                    topLevelComments.push(commentsMap[comment.id]);
                }
            });
            setComments(topLevelComments);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (resourceId) fetchVideoData();
    }, [resourceId, supabase]);

    const handlePostComment = async () => {
        if (newMessage.trim() === '') return;
        setIsSending(true);
        const { error } = await supabase.from('learning_resource_comments').insert({
            resource_id: resourceId,
            sender_id: user.id,
            message: newMessage.trim(),
            parent_comment_id: replyingTo ? replyingTo.id : null,
        });
        if (!error) {
            setNewMessage('');
            setReplyingTo(null);
            await fetchVideoData();
        } else {
            alert(`Gagal mengirim komentar: ${error.message}`);
        }
        setIsSending(false);
    };
    
    const handleDeleteComment = async (commentId) => {
        const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus komentar ini?");
        if (!isConfirmed) return;
        const { error } = await supabase.from('learning_resource_comments').delete().eq('id', commentId);
        if (!error) fetchVideoData();
        else alert(`Gagal menghapus komentar: ${error.message}`);
    };

    const handleReplyClick = (comment) => {
        setReplyingTo(comment);
        commentInputRef.current?.focus();
    };

    if (loading) return <div className="text-center py-20">Memuat video...</div>;
    if (!resource) return <div className="text-center py-20">Materi tidak ditemukan.</div>;

    const videoId = getYouTubeVideoId(resource.resource_url);
    const descriptionToShow = resource.full_description || resource.description;

    return (
        <div className="max-w-4xl mx-auto">
            {/* PERBAIKAN: Gunakan router.push */}
            <button onClick={() => router.push('/dashboard/resources')} className="font-semibold text-sm mb-6" style={{color: '#1c3d52'}}>
                &larr; Kembali ke Daftar Materi
            </button>
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                {videoId ? <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`} title={resource.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="w-full h-full"></iframe> : <div className="w-full h-full flex items-center justify-center text-white">URL Video tidak valid.</div>}
            </div>
            <div className="mt-8">
                <p className="font-semibold" style={{color: '#e8c458'}}>{resource.category}</p>
                <h1 className="text-3xl font-bold text-slate-800 mt-1">{resource.title}</h1>
                <div className="mt-6 prose prose-slate max-w-none border-t pt-6">
                    <div className={!showFullDescription ? 'relative max-h-28 overflow-hidden' : ''}>
                        <p className="whitespace-pre-wrap">{descriptionToShow || "Tidak ada deskripsi."}</p>
                        {!showFullDescription && descriptionToShow && descriptionToShow.length > 250 &&
                            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-100 to-transparent" />
                        }
                    </div>
                    {descriptionToShow && descriptionToShow.length > 250 && (
                        <button onClick={() => setShowFullDescription(!showFullDescription)} className="font-semibold mt-2" style={{color: '#1c3d52'}}>
                            {showFullDescription ? 'Tampilkan lebih sedikit' : 'Lihat selengkapnya'}
                        </button>
                    )}
                </div>
            </div>
            <div className="mt-12 pt-8 border-t">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">{comments.reduce((acc, c) => acc + 1 + c.replies.length, 0)} Komentar</h2>
                <div className="flex items-start gap-3 mb-8">
                     <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0"></div>
                     <div className="flex-1">
                        {replyingTo && (
                            <div className="text-sm mb-2 p-2 bg-slate-100 rounded-md">
                                Membalas kepada <span className="font-bold">{replyingTo.name}</span>
                                <button onClick={() => setReplyingTo(null)} className="font-semibold ml-2 text-red-500 text-xs">(Batal)</button>
                            </div>
                        )}
                        <textarea ref={commentInputRef} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows="2" placeholder="Tulis komentar publik..." className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1c3d52] transition" />
                        <div className="flex justify-end mt-2">
                             <button onClick={handlePostComment} disabled={isSending || newMessage.trim() === ''} className="px-5 py-2 text-sm font-semibold text-white rounded-lg flex items-center gap-2 disabled:opacity-50" style={{backgroundColor: '#1c3d52'}}>
                                <PaperAirplaneIcon className="w-4 h-4" />
                                {isSending ? 'Mengirim...' : 'Kirim'}
                            </button>
                        </div>
                     </div>
                </div>
                <div className="space-y-6">
                    {comments.map(comment => (
                        <CommentThread key={comment.id} comment={comment} user={user} userRole={userRole} onDelete={handleDeleteComment} onReply={handleReplyClick} level={0} />
                    ))}
                </div>
            </div>
        </div>
    );
}