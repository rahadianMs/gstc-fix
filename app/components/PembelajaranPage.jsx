// app/components/PembelajaranPage.jsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Komponen Ikon ---
const PlayIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>;
const BookOpenIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const GlobeAltIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.953 11.953 0 0112 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 013 12c0-.778.099-1.533.284-2.253" /></svg>;
const ClockIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const colors = { brandDark: '#1c3d52', brandYellow: '#e8c458' };

const DocumentCard = ({ course, onOpen }) => (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200/80 overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="relative w-full aspect-[4/5] overflow-hidden">
            <img src={course.image_url || 'https://images.unsplash.com/photo-1517480448885-d5c53555ba8c?q=80&w=899&auto=format&fit=crop'} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 backdrop-blur-sm">
                {course.type === 'pdf' ? <BookOpenIcon className="w-5 h-5 text-white" /> : <GlobeAltIcon className="w-5 h-5 text-white" />}
            </div>
        </div>
        <div className="p-5 flex-grow flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.brandYellow }}>{course.category || 'General'}</span>
            <h3 className="text-base font-bold text-slate-800 mt-1 flex-grow">{course.title}</h3>
            <p className="text-xs text-slate-500 mt-2 line-clamp-2">{course.description}</p>
        </div>
        <div className="bg-slate-50/70 p-3 border-t mt-auto">
            <button onClick={() => onOpen(course)} className="w-full text-sm font-semibold text-white rounded-md px-4 py-2 transition-colors" style={{ backgroundColor: colors.brandDark }}>Buka Materi</button>
        </div>
    </div>
);

const VideoListItem = ({ course, onOpen }) => (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200/80 flex flex-col md:flex-row group transition-all duration-300 hover:shadow-xl hover:border-slate-300">
        <button onClick={() => onOpen(course)} className="relative md:w-56 lg:w-64 xl:w-72 flex-shrink-0 aspect-video md:aspect-auto overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-t-none">
            <img src={course.image_url || 'https://images.unsplash.com/photo-1517480448885-d5c53555ba8c?q=80&w=899&auto-format&fit=crop'} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full transform transition-transform hover:scale-110">
                    <PlayIcon className="w-6 h-6 text-white" />
                </div>
            </div>
        </button>
        <div className="p-5 flex-grow flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.brandYellow }}>{course.category || 'Video'}</span>
            <h3 className="text-lg font-bold text-slate-800 mt-1">{course.title}</h3>
            {/* --- PERUBAHAN DI SINI: line-clamp untuk deskripsi singkat --- */}
            <p className="text-sm text-slate-500 mt-2 flex-grow line-clamp-2">{course.description}</p>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200/80">
                <button onClick={() => onOpen(course)} className="text-sm font-semibold text-white rounded-md px-5 py-2 transition-colors" style={{ backgroundColor: colors.brandDark }}>
                    Tonton Video
                </button>
                {course.duration && <span className="text-sm font-semibold text-slate-500 flex items-center"><ClockIcon className="w-4 h-4 mr-1.5" /> {course.duration}</span>}
            </div>
        </div>
    </div>
);


export default function PembelajaranPage({ supabase, user, userRole, setActiveDashboardPage }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            const { data } = await supabase.from('learning_resources').select('*').eq('is_published', true).order('created_at', { ascending: false });
            if (data) setCourses(data);
            setLoading(false);
        };
        fetchCourses();
    }, [supabase]);

    const handleOpen = (course) => {
        if (course.type === 'video') {
            setActiveDashboardPage({ page: 'video-detail', resourceId: course.id });
        } else {
            window.open(course.resource_url, '_blank', 'noopener,noreferrer');
        }
    };

    const videos = courses.filter(course => course.type === 'video');
    const documents = courses.filter(course => course.type === 'pdf' || course.type === 'website');

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12 pb-6 border-b-2">
                <div>
                    <h1 className="text-4xl font-bold" style={{color: colors.brandDark}}>Resource Center</h1>
                    <p className="mt-2 text-lg text-slate-600">Perkaya pengetahuan Anda dengan materi pilihan dari para ahli.</p>
                </div>
                {userRole === 'consultant' && (
                    <button onClick={() => setActiveDashboardPage('resource-admin')} className="px-5 py-3 font-semibold text-white rounded-lg shadow-md transition-transform active:scale-95" style={{backgroundColor: colors.brandDark}}>
                        Kelola Materi
                    </button>
                )}
            </div>
            {loading ? <div className="text-center py-10 text-slate-500">Memuat materi...</div> : courses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border"><h3 className="text-xl font-semibold text-slate-700">Belum Ada Materi Pembelajaran</h3><p className="text-slate-500 mt-2">Silakan cek kembali nanti.</p></div>
            ) : (
                <div className="space-y-16">
                    {videos.length > 0 && (
                        <section>
                            <h2 className="text-3xl font-bold text-slate-800 mb-6">Video Pembelajaran</h2>
                            <div className="space-y-6">
                                {videos.map(course => <VideoListItem key={course.id} course={course} onOpen={handleOpen} />)}
                            </div>
                        </section>
                    )}
                    {documents.length > 0 && (
                         <section>
                            <h2 className="text-3xl font-bold text-slate-800 mb-6">Dokumen & Panduan</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {documents.map(course => <DocumentCard key={course.id} course={course} onOpen={handleOpen} />)}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}