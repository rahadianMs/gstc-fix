"use client";

// --- Komponen Ikon untuk Panduan ---
const NumberCircle = ({ number }) => (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1c3d52] text-white flex items-center justify-center font-bold">
        {number}
    </div>
);

const GuideSection = ({ title, children }) => (
    <section className="mb-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-6 pb-2 border-b-2 border-slate-300">{title}</h2>
        <div className="space-y-6 text-slate-600 leading-relaxed">
            {children}
        </div>
    </section>
);

// --- Komponen Utama Halaman Panduan ---
export default function PanduanPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-800">Panduan Pengguna</h1>
                <p className="mt-2 text-lg text-slate-600">Panduan lengkap untuk memulai, mengelola, dan memaksimalkan platform asesmen mandiri GSTC.</p>
            </div>

            <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-md border">
                <GuideSection title="Selamat Datang di Platform Asesmen Mandiri GSTC!">
                    <p>
                        Platform ini dirancang untuk memandu destinasi pariwisata di Indonesia melalui proses evaluasi kepatuhan terhadap <strong>Kriteria Destinasi dari Global Sustainable Tourism Council (GSTC)</strong>.
                    </p>
                    <p>
                        Gunakan platform ini sebagai ruang kerja kolaboratif antara Anda sebagai <strong>Pengelola Destinasi</strong> dan <strong>Konsultan Ahli</strong> untuk mengumpulkan bukti, mendapatkan umpan balik, dan mencapai standar pariwisata berkelanjutan kelas dunia.
                    </p>
                </GuideSection>

                <GuideSection title="Memulai Proses Kepatuhan">
                    <div className="flex items-start gap-4">
                        <NumberCircle number="1" />
                        <div>
                            <h4 className="font-bold text-lg text-slate-700">Pahami Dasbor Utama</h4>
                            <p>Halaman <strong>"Home"</strong> adalah pusat pantauan Anda. Di sini Anda akan melihat ringkasan progres kepatuhan untuk setiap pilar GSTC (A, B, C, D) dan area fokus yang perlu menjadi prioritas perbaikan.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <NumberCircle number="2" />
                        <div>
                            <h4 className="font-bold text-lg text-slate-700">Navigasi ke Standard Compliance</h4>
                            <p>Klik menu <strong>"Standard Compliance"</strong>. Di sini Anda akan menemukan empat pilar utama Kriteria Destinasi GSTC. Pilih salah satu pilar (misalnya, PILAR A: Pengelolaan Berkelanjutan) untuk melihat detail kriteria di dalamnya.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <NumberCircle number="3" />
                        <div>
                            <h4 className="font-bold text-lg text-slate-700">Unggah Bukti Kepatuhan</h4>
                            <p>Untuk setiap kriteria, terdapat beberapa indikator yang perlu Anda penuhi. Klik tombol <strong>"Link Evidence"</strong> pada setiap indikator untuk mengunggah bukti kepatuhan berupa tautan (contoh: link Google Drive, Dropbox, atau dokumen publik).</p>
                             <ul className="list-disc list-inside mt-2 space-y-2 pl-2">
                                <li>
                                    <strong>Simpan sebagai Draf:</strong> Gunakan opsi ini jika Anda belum siap mengirimkan bukti untuk ditinjau. Status akan menjadi `In Progress`.
                                </li>
                                <li>
                                    <strong>Ajukan untuk Review:</strong> Jika bukti sudah lengkap dan siap, ajukan untuk ditinjau oleh konsultan. Status akan berubah menjadi `In Review`, dan Anda tidak dapat mengubahnya hingga proses review selesai.
                                </li>
                            </ul>
                        </div>
                    </div>
                </GuideSection>

                <GuideSection title="Berinteraksi dengan Konsultan">
                    <p>
                        Setiap kriteria memiliki fitur <strong>"Diskusi"</strong>. Gunakan fitur ini untuk berkomunikasi langsung dengan konsultan ahli. Anda bisa bertanya, meminta klarifikasi, atau memberikan konteks tambahan terkait bukti yang Anda unggah.
                    </p>
                    <p>
                        Setelah konsultan mereview bukti Anda, statusnya akan berubah menjadi <strong>`Done`</strong> (Disetujui), <strong>`Rejected`</strong> (Ditolak), atau <strong>`Revision`</strong> (Perlu Revisi). Periksa komentar dari konsultan untuk tindak lanjut.
                    </p>
                </GuideSection>

                <GuideSection title="Fitur Pendukung Lainnya">
                     <ul className="list-disc list-inside space-y-3">
                        <li>
                            <strong>Self-Assessment:</strong> Alat ini membantu Anda melakukan evaluasi awal secara mandiri untuk mendapatkan gambaran umum skor kepatuhan dan area prioritas sebelum terlibat lebih dalam dengan konsultan.
                        </li>
                        <li>
                            <strong>Action Plan:</strong> Buat dan kelola daftar tugas atau rencana aksi untuk memenuhi kriteria yang belum tercapai. Fitur ini membantu Anda tetap terorganisir dalam upaya perbaikan.
                        </li>
                         <li>
                            <strong>Pusat Pembelajaran:</strong> Kunjungi halaman <strong>"Pembelajaran"</strong> untuk mengakses dokumen, video, dan sumber daya lain yang relevan dengan pariwisata berkelanjutan dan Kriteria GSTC.
                        </li>
                    </ul>
                </GuideSection>
            </div>
        </div>
    );
}