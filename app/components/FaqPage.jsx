"use client";

// Komponen untuk Halaman FAQ
export default function FaqPage() {
    const faqs = [
        { 
            q: "Apa itu Kriteria Destinasi GSTC?", 
            a: "Kriteria Destinasi Global Sustainable Tourism Council (GSTC) adalah standar global yang menetapkan praktik terbaik dalam pariwisata berkelanjutan untuk destinasi. Kriteria ini berfungsi sebagai kerangka kerja untuk membantu destinasi mengelola dampak lingkungan, sosial-ekonomi, dan budaya dari pariwisata." 
        },
        { 
            q: "Mengapa destinasi saya perlu mengikuti asesmen ini?", 
            a: "Mengikuti asesmen ini membantu destinasi Anda mengidentifikasi kekuatan dan kelemahan dalam praktik keberlanjutan. Ini adalah langkah pertama untuk meningkatkan daya saing, menarik wisatawan yang sadar lingkungan, dan mempersiapkan diri untuk sertifikasi internasional yang dapat meningkatkan kredibilitas destinasi Anda di mata dunia." 
        },
        { 
            q: "Apa saja empat pilar utama dalam Kriteria GSTC?", 
            a: "Empat pilar tersebut adalah: (A) Pengelolaan Berkelanjutan, (B) Keberlanjutan Sosial-Ekonomi, (C) Keberlanjutan Budaya, dan (D) Keberlanjutan Lingkungan. Platform ini disusun berdasarkan keempat pilar tersebut." 
        },
        { 
            q: "Apa jenis bukti yang perlu saya unggah?", 
            a: "Anda perlu mengunggah bukti dalam bentuk tautan (URL) yang dapat diakses oleh konsultan. Contohnya termasuk tautan ke dokumen kebijakan, laporan, foto, video, atau halaman web yang relevan yang tersimpan di layanan seperti Google Drive, Dropbox, atau situs web resmi Anda." 
        },
        {
            q: "Apa yang terjadi setelah saya mengajukan bukti untuk direview?",
            a: "Setelah Anda mengajukan bukti (status 'In Review'), Anda tidak dapat mengubahnya sampai konsultan selesai memberikan ulasan. Konsultan akan meninjau bukti Anda dan mengubah statusnya menjadi 'Done' (Disetujui), 'Rejected' (Ditolak), atau 'Revision' (Perlu Revisi) dengan memberikan komentar. Anda akan dapat melihat umpan balik ini untuk melakukan perbaikan jika diperlukan."
        }
    ];
    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-slate-800">Frequently Asked Questions (FAQ)</h2>
            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <details key={index} className="bg-white p-6 rounded-xl shadow-sm border group" open={index === 0}>
                        <summary className="font-bold text-lg cursor-pointer list-none flex justify-between items-center text-slate-800">
                            {faq.q}
                            <div className="transition-transform duration-300 group-open:rotate-180">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </div>
                        </summary>
                        <p className="text-slate-600 mt-4">{faq.a}</p>
                    </details>
                ))}
            </div>
        </div>
    );
};