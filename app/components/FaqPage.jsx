"use client";

// Komponen untuk Halaman FAQ
export default function FaqPage() {
    const faqs = [
        { q: "Apa itu Jejak Karbon?", a: "Jejak karbon adalah jumlah total emisi gas rumah kaca (seperti CO₂) yang dihasilkan secara langsung maupun tidak langsung oleh sebuah individu, organisasi, acara, atau produk. Dalam konteks ini, kita mengukur jejak karbon dari operasional bisnis pariwisata Anda." },
        { q: "Mengapa bisnis saya perlu menghitung jejak karbon?", a: "Menghitung jejak karbon adalah langkah pertama untuk memahami dampak lingkungan dari bisnis Anda. Dengan data ini, Anda dapat mengidentifikasi area inefisiensi, mengurangi biaya operasional (misalnya, energi), meningkatkan citra merek, menarik wisatawan yang sadar lingkungan, dan berkontribusi pada komitmen nasional menuju Net Zero Emissions." },
        { q: "Apakah data yang saya masukkan aman?", a: "Tentu. Platform ini menggunakan standar keamanan modern untuk melindungi semua data yang Anda masukkan. Data Anda hanya akan digunakan untuk keperluan analisis agregat dan pelaporan sesuai kebijakan privasi, serta tidak akan dibagikan ke pihak lain tanpa persetujuan Anda." },
        { q: "Apa itu Deklarasi Glasgow tentang Aksi Iklim di Sektor Pariwisata?", a: "Ini adalah sebuah komitmen global yang menyatukan sektor pariwisata untuk mengurangi separuh emisi karbon pada tahun 2030 dan mencapai Net Zero selambat-lambatnya pada tahun 2050. Dengan menggunakan platform ini, Anda menjadi bagian dari gerakan global tersebut." },
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