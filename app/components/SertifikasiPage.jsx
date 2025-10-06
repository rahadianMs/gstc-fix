"use client";
import { useState, useEffect } from 'react';
import { generateCertificatePdf } from '../lib/generateCertificatePdf'; // Impor fungsi PDF

// --- Komponen Halaman Sertifikasi ---
export default function SertifikasiPage({ supabase, user }) {
    const [isEligible, setIsEligible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [businessName, setBusinessName] = useState("Nama Bisnis Anda");

    // Cek kelayakan pengguna
    useEffect(() => {
        const checkEligibility = async () => {
            if (!user) return;
            
            const { data: { user: userData } } = await supabase.auth.getUser();
            setBusinessName(userData?.user_metadata?.business_name || "Nama Bisnis Anda");

            const { data: entries, error } = await supabase
                .from('carbon_entries')
                .select('electricity_co2e, waste_co2e, transport_co2e')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error || !entries || entries.length === 0) {
                setIsEligible(false);
            } else {
                const lastEntry = entries[0];
                if (lastEntry.electricity_co2e > 0 && lastEntry.waste_co2e > 0 && lastEntry.transport_co2e > 0) {
                    setIsEligible(true);
                } else {
                    setIsEligible(false);
                }
            }
            setIsLoading(false);
        };

        checkEligibility();
    }, [supabase, user]);

    // Fungsi untuk memanggil pembuatan PDF
    const handleDownload = async () => {
        if (!isEligible || isDownloading) return;
        setIsDownloading(true);
        await generateCertificatePdf(businessName);
        setIsDownloading(false);
    };

    // Fungsi untuk membuat nomor sertifikat dinamis (hanya untuk pratinjau)
    const generateCertNumber = () => {
        const date = new Date();
        const ddmmyyyy = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear()}`;
        const randomChars = "BVGFHRY"; // Contoh statis untuk konsistensi pratinjau
        return `${randomChars}-${ddmmyyyy}`;
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-12">
                <h1 className="text-4xl font-bold text-slate-800">Sertifikat Apresiasi</h1>
                <p className="mt-2 text-lg text-slate-600">Dapatkan pengakuan atas komitmen Anda terhadap pariwisata ramah lingkungan.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                {/* Kolom Kiri: Pratinjau Sertifikat (Visual JSX) */}
                <div className="bg-white p-4 aspect-[1/1.414] shadow-lg flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-12 bg-[#00A79D]"></div>
                    <div className="absolute top-0 right-0 h-16 w-full bg-[#E0F2F1]"></div>
                    
                    <div className="relative z-10 p-8 flex-grow flex flex-col">
                        <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/f/fc/Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.png" 
                            alt="Logo Kemenparekraf"
                            className="h-20 w-auto self-end"
                        />

                        <div className="mt-8">
                            <p className="text-sm text-slate-500">Nomor Sertifikat: {generateCertNumber()}</p>
                            <h2 className="text-2xl font-bold text-[#00695C] mt-4">DEKARBONISASI PARIWISATA</h2>
                            <h1 className="text-4xl font-extrabold text-slate-800">SERTIFIKAT APRESIASI</h1>
                        </div>

                        <div className="mt-8">
                            <p className="text-slate-600">Sertifikat ini dengan bangga diberikan kepada</p>
                            <p className="text-3xl font-bold text-slate-900 my-4">{businessName}</p>
                            <p className="text-sm max-w-md text-slate-600">
                                atas komitmennya terhadap keberlanjutan dengan mengukur jejak karbonnya. Dedikasi Anda berkontribusi untuk masa depan yang lebih hijau dan mendukung perjalanan Indonesia menuju Pariwisata Net Zero.
                            </p>
                        </div>
                        
                        <div className="mt-auto text-sm text-slate-500">
                             <p>Terima kasih telah menjadi bagian yang bertanggung jawab dari pariwisata berkelanjutan.</p>
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: Informasi dan Tombol Aksi */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-slate-800">Unduh Sertifikat Anda</h2>
                    <p className="text-slate-600">
                        Sertifikat ini adalah bukti nyata dari partisipasi dan komitmen Anda dalam program dekarbonisasi pariwisata. Untuk dapat mengunduh, Anda harus terlebih dahulu melengkapi laporan emisi bulanan untuk ketiga kategori: Listrik, Transportasi, dan Limbah.
                    </p>
                    
                    <div className="relative w-full group">
                        {/* --- PERUBAHAN DI SINI --- */}
                        <button 
                            onClick={handleDownload}
                            disabled={!isEligible || isLoading || isDownloading}
                            className="w-full py-4 text-lg font-semibold text-white bg-slate-400 rounded-lg transition-colors enabled:hover:bg-[#22543d] disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Memeriksa Kelayakan...' : (isDownloading ? 'Membuat PDF...' : 'Unduh Sertifikat (.pdf)')}
                        </button>
                        
                        {!isEligible && !isLoading && (
                            <div className="absolute bottom-full mb-2 w-full px-4 py-2 bg-slate-800 text-white text-sm rounded-lg text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                Harap lengkapi laporan emisi (Listrik, Transportasi, dan Limbah) terlebih dahulu.
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}