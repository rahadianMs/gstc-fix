"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Komponen Ikon ---
const StarIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10.868 2.884c.321-.662 1.215-.662 1.536 0l1.681 3.468a1 1 0 00.951.692h3.642c.713 0 1.005.934.46 1.412l-2.94 2.14a1 1 0 00-.364 1.118l1.11 4.043c.214.783-.584 1.425-1.284.944l-2.934-2.134a1 1 0 00-1.176 0l-2.934 2.134c-.7.481-1.5-.16-1.284-.944l1.11-4.043a1 1 0 00-.364-1.118L2.05 8.456c-.546-.478-.253-1.412.46-1.412h3.642a1 1 0 00.95-.692l1.681-3.468z" clipRule="evenodd" /></svg>;
const DocumentArrowDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const PlayCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;


// --- Data Kursus ---
const courses = [
  {
    type: 'pdf',
    category: 'Policy',
    title: 'Tourism Sector Decarbonization Roadmap',
    description: 'Panduan komprehensif untuk mengurangi emisi karbon di industri pariwisata.',
    rating: 4.8,
    imageUrl: 'https://wisestepsconsulting.id/wp-content/uploads/2023/10/Indonesias-Tourism-Decarbonization-Roadmap.png',
    pdfUrl: 'https://drive.google.com/file/d/1X1XG2wXIz4Q1UVSDsuny93bAHMfo0NKb/view?usp=sharing',
    details: (
        <>
            <h3 className="text-xl font-bold mb-4">Overview</h3>
            <p className="mb-4">Bersamaan dengan pertumbuhan pariwisata global, dampak negatif terkait pemanasan global mulai muncul. Kenaikan suhu global, perubahan iklim, dan ancaman terhadap lingkungan alam menghadirkan tantangan serius bagi industri pariwisata secara global. Oleh karena itu, upaya bersama untuk mengurangi emisi Gas Rumah Kaca (GRK) dari sektor pariwisata merupakan langkah positif dalam mengurangi dampak pemanasan global pada industri pariwisata dan ekosistem yang menjadi dasarnya.</p>
            <p className="mb-4">Penandatanganan Deklarasi Glasgow oleh Kementerian Pariwisata dan Ekonomi Kreatif pada tahun 2022 merupakan inisiatif positif yang merepresentasikan komitmen pariwisata Indonesia dalam berkontribusi pada mitigasi perubahan iklim. Deklarasi ini merupakan tonggak penting bagi pariwisata Indonesia, yang menunjukkan tekadnya dalam mengurangi emisi Gas Rumah Kaca (GRK). Oleh karena itu, UNDP, Kemenparekraf, dan Wise Steps Consulting merumuskan Rencana Aksi Dekarbonisasi dalam sektor pariwisata untuk Indonesia.</p>
            <p className="mb-4">Mengenai aspek-aspek tertentu, roadmap awal ini utamanya difokuskan pada sub-sektor akomodasi, tempat wisata, dan perjalanan wisata, dengan penekanan pada energi (termasuk bahan bakar dan listrik) serta limbah (pembuatan limbah padat).</p>
            <h3 className="text-xl font-bold mt-6 mb-4">4 Fase Menuju Net-Zero</h3>
            <ol className="list-decimal list-inside space-y-2">
                <li><strong>Build Foundation (2024 & 2025):</strong> Membentuk dasar dan target awal.</li>
                <li><strong>Early Phase (2026-2030):</strong> Implementasi dengan skema sukarela.</li>
                {/* --- PERBAIKAN DI SINI --- */}
                <li><strong>Compliance Phase ({'>'}2030):</strong> Pelaporan dan upaya pengurangan emisi menjadi wajib.</li>
                <li><strong>Net-Zero Achievement:</strong> Pencapaian target emisi net-zero sesuai komitmen nasional.</li>
            </ol>
        </>
    )
  },
  {
    type: 'pdf',
    category: 'Methodology',
    title: 'Hotel Carbon Measurement Initiative (HCMI)',
    description: 'Pengantar metodologi untuk mengukur jejak karbon perhotelan secara standar.',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    pdfUrl: 'https://greensquareconcept.com/fileadmin/inhalte/GSC_Dokumente/HCMI_methodology_v1.2_-_June_2020.pdf',
    details: (
        <>
            <h3 className="text-xl font-bold mb-4">Tentang HCMI</h3>
            <p>Hotel Carbon Measurement Initiative (HCMI) adalah sebuah metodologi yang dirancang khusus untuk industri perhotelan guna mengukur dan melaporkan jejak karbon secara konsisten. Inisiatif ini menyediakan kerangka kerja standar untuk menghitung emisi dari penginapan tamu dan ruang pertemuan, memungkinkan hotel untuk membandingkan kinerja lingkungannya, mengidentifikasi area untuk perbaikan, dan melaporkan data emisi kepada klien korporat dengan transparan. Mengadopsi HCMI membantu hotel mengambil langkah nyata menuju operasional yang lebih berkelanjutan.</p>
        </>
    )
  },
  {
    type: 'video',
    category: 'Praktik Terbaik',
    title: 'Cara Menghitung Jejak Karbon',
    description: 'Pelajari dasar dan metode praktis untuk menghitung jejak karbon untuk bisnis Anda.',
    rating: 4.9,
    duration: '12 min',
    videoId: 'aj2npG432zc',
    imageUrl: 'https://pettonature.id/wp-content/uploads/2024/11/WhatsApp-Image-2024-11-15-at-15.26.20-1.jpeg'
  },
  {
    type: 'video',
    category: 'Praktik Terbaik',
    title: 'Mengenal Pariwisata Inklusif',
    description: 'Pahami pentingnya pariwisata yang inklusif dan ramah lingkungan untuk masa depan.',
    rating: 4.9,
    duration: '45 min',
    videoId: 'vB2wvW4tAx4',
    imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
];

// --- Komponen Halaman Pembelajaran ---
export default function PembelajaranPage() {
  const [modalContent, setModalContent] = useState(null);

  const openModal = (content) => {
    setModalContent(content);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
        <div className="mb-12">
            <h1 className="text-4xl font-bold text-slate-800">Portal E-Learning</h1>
            <p className="mt-2 text-lg text-slate-600">Akses materi pembelajaran tentang dekarbonisasi pariwisata dan praktik berkelanjutan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md border overflow-hidden flex flex-col group">
                    <div className="relative">
                        <img src={course.imageUrl} alt={course.title} className="h-48 w-full object-cover" />
                        {course.type === 'video' && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <button onClick={() => openModal({ type: 'video', videoId: course.videoId })} className="transform transition-transform duration-300 group-hover:scale-110">
                                    <PlayCircleIcon />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                        <p className="text-sm font-semibold" style={{color: '#22543d'}}>{course.category}</p>
                        <h3 className="text-lg font-bold text-slate-800 mt-1">{course.title}</h3>
                        <p className="text-sm text-slate-500 mt-2 flex-grow">{course.description}</p>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-1">
                                <StarIcon className="w-5 h-5 text-amber-400" />
                                <span className="font-bold text-slate-700">{course.rating}</span>
                            </div>
                            {course.duration && <span className="text-sm text-slate-500 flex items-center"><ClockIcon /> {course.duration}</span>}
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 flex gap-2">
                        {course.type === 'pdf' && (
                            <a href={course.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-100 flex items-center justify-center gap-2">
                                <DocumentArrowDownIcon /> Unduh PDF
                            </a>
                        )}
                        <button onClick={() => openModal(course.type === 'video' ? { type: 'video', videoId: course.videoId } : { type: 'details', content: course.details, title: course.title })} className="flex-1 text-sm font-semibold text-white rounded-lg px-4 py-2 transition-colors" style={{backgroundColor: '#22543d'}}>
                            Lihat Detail
                        </button>
                    </div>
                </div>
            ))}
        </div>

        <AnimatePresence>
            {modalContent && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeModal}
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8"
                >
                    {modalContent.type === 'video' ? (
                         <motion.div 
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-black w-full max-w-4xl aspect-video rounded-lg shadow-2xl overflow-hidden"
                        >
                            <iframe
                                src={`https://www.youtube.com/embed/${modalContent.videoId}?autoplay=1`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
                        >
                             <header className="flex items-center justify-between p-6 border-b border-slate-200">
                                <h2 className="text-2xl font-bold text-slate-800">{modalContent.title}</h2>
                                <button onClick={closeModal} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"><CloseIcon /></button>
                            </header>
                            <main className="flex-1 p-8 overflow-y-auto prose prose-slate max-w-none">
                                {modalContent.content}
                            </main>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}