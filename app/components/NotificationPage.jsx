"use client";

import { useState } from 'react';

// Komponen untuk Halaman Notifikasi
export default function NotificationPage() {
    const [selectedMessage, setSelectedMessage] = useState(0);
    const messages = [
        {
            from: "Tim WINZ Hub",
            subject: "Selamat Datang di Wonderful Indonesia Net Zero Hub!",
            date: "Baru saja",
            read: false,
            body: (
                <>
                    <p className="mb-4">Selamat datang dan terima kasih telah bergabung dengan kami di Wonderful Indonesia Net Zero Hub! Anda telah mengambil langkah penting untuk menjadi bagian dari transformasi pariwisata Indonesia yang lebih hijau dan berkelanjutan.</p>
                    <p className="mb-4">Platform ini dirancang untuk membantu Anda dalam:</p>
                    <ul className="list-disc list-inside space-y-2 mb-4">
                        <li><strong>Mengukur Jejak Karbon:</strong> Hitung emisi dari operasional bisnis Anda dengan kalkulator kami yang mudah digunakan.</li>
                        <li><strong>Memantau Kemajuan:</strong> Lacak dan analisis data emisi Anda dari waktu ke waktu melalui dasbor interaktif.</li>
                        <li><strong>Mendapatkan Wawasan:</strong> Akses pusat pembelajaran untuk mendapatkan pengetahuan dan praktik terbaik dalam mengurangi emisi.</li>
                        <li><strong>Berkontribusi pada Aksi Global:</strong> Jadilah bagian dari komitmen Indonesia dalam Deklarasi Glasgow untuk pariwisata berkelanjutan.</li>
                    </ul>
                    <p>Kami sangat antusias untuk memulai perjalanan ini bersama Anda. Silakan jelajahi fitur-fitur yang tersedia dan mulailah membuat laporan emisi pertama Anda!</p>
                </>
            )
        },
        // Pesan-pesan di masa depan dapat ditambahkan di sini
    ];

    return (
        <div className="h-[calc(100vh-10rem)] bg-white rounded-xl shadow-md border flex">
            <div className="w-1/3 border-r border-slate-200 overflow-y-auto">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="font-bold text-lg">Kotak Masuk</h3>
                </div>
                <div className="divide-y divide-slate-200">
                    {messages.map((msg, index) => (
                        <button 
                            key={index} 
                            onClick={() => setSelectedMessage(index)}
                            className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${selectedMessage === index ? 'bg-emerald-50' : ''}`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    {!msg.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                    <span className="font-bold text-slate-800">{msg.from}</span>
                                </div>
                                <span className="text-xs text-slate-400">{msg.date}</span>
                            </div>
                            <p className={`truncate text-sm ${selectedMessage === index ? 'text-slate-600' : 'text-slate-500'}`}>{msg.subject}</p>
                        </button>
                    ))}
                </div>
            </div>
            <div className="w-2/3 overflow-y-auto">
                {messages[selectedMessage] && (
                    <>
                        <div className="p-4 border-b border-slate-200">
                            <h2 className="font-bold text-xl text-slate-800">{messages[selectedMessage].subject}</h2>
                            <p className="text-sm text-slate-500">Dari: {messages[selectedMessage].from}</p>
                        </div>
                        <div className="p-6 prose prose-slate max-w-none">
                            {messages[selectedMessage].body}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};