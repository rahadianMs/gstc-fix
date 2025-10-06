"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Komponen Progress Bar
const ProgressBar = ({ step, totalSteps }) => {
    const progress = (step / totalSteps) * 100;
    return (
        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-8">
            <motion.div
                className="bg-[#22543d] h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            ></motion.div>
        </div>
    );
};


// Komponen utama AuthPage
export default function AuthPage({ supabase, setActivePage, isLogin, setIsLogin }) {
    // State untuk UI
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const [step, setStep] = useState(1); // Mengatur langkah registrasi
    const [isExiting, setIsExiting] = useState(false);

    // State untuk semua data form
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        destination_name: '',
        managing_organization_name: '',
        organization_type: '',
        other_organization_type: '',
        management_area: '',
        other_management_area: '',
        admin_province: '',
        admin_regency: '',
        admin_district: '',
        destination_area_size: '',
        boundary_north: '',
        boundary_south: '',
        boundary_east: '',
        boundary_west: '',
        village_count: '',
        population_count: '',
        visitor_count_last_year: '',
        main_attraction_types: [],
        other_main_attraction_type: '',
        hotel_count: '',
        homestay_count: '',
        restaurant_count: '',
        tour_operator_count: '',
        sme_count: '',
        certified_entity_count: '',
        followed_certifications: '',
        special_area_status: [],
        other_special_area_status: '',
        natural_disaster_risks: [],
        other_natural_disaster_risk: '',
        sensitive_sites: '',
        religious_sites: '',
        monitored_kpis: '',
        renewable_energy_usage: '',
    });
    
    // Palet Warna
    const colors = {
        brand: '#22543d',
        brandHover: '#1c4532',
    };

    // Handler untuk perubahan input form
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked 
                    ? [...prev[name], value]
                    : prev[name].filter(item => item !== value)
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    // Fungsi untuk kembali ke halaman landing
    const handleGoBackToLanding = () => {
        setIsExiting(true);
    };

    const handleNextStep = () => {
        // Validasi sederhana sebelum lanjut
        if (step === 1 && (!formData.destination_name || !formData.managing_organization_name || !formData.organization_type || !formData.management_area)) {
             setMessage({ type: 'error', content: 'Harap lengkapi semua kolom yang ditandai *.' });
             return;
        }
        setMessage({ type: '', content: '' });
        setStep(prev => prev + 1);
    };
    
    const handlePrevStep = () => {
        setStep(prev => prev - 1);
    };
    
    // Fungsi untuk handle Login dan Registrasi
    const handleAuthAction = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', content: '' });

        if (isLogin) {
            // Logika Login
            const { error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
            if (error) {
                setMessage({ type: 'error', content: error.message });
            }
        } else {
            // Logika Registrasi - terjadi di akhir
            const { data: { user }, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        destination_name: formData.destination_name
                    }
                }
            });

            if (signUpError) {
                setMessage({ type: 'error', content: signUpError.message });
                setLoading(false);
                return;
            }

            if (user) {
                // Hapus email dan password dari data yang akan diupdate ke profil
                const profileData = { ...formData };
                delete profileData.email;
                delete profileData.password;
                
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update(profileData)
                    .eq('id', user.id);
                
                if (updateError) {
                     setMessage({ type: 'error', content: `Gagal menyimpan detail profil: ${updateError.message}` });
                } else {
                     setMessage({ type: 'success', content: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi.' });
                }
            }
        }
        setLoading(false);
    };
    

    const renderRegisterForm = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-slate-700">Section 1: Identitas Destinasi</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-zinc-600">Email *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]" />
                            </div>
                             <div>
                                <label className="block mb-1 text-sm font-medium text-zinc-600">Password *</label>
                                <input type="password" name="password" placeholder="Minimal 6 karakter" value={formData.password} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]" />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-zinc-600">Nama Destinasi Wisata *</label>
                                <input type="text" name="destination_name" value={formData.destination_name} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]" />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-zinc-600">Nama Lembaga/Organisasi Pengelola *</label>
                                <input type="text" name="managing_organization_name" value={formData.managing_organization_name} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]" />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-zinc-600">Tipe Organisasi *</label>
                                <select name="organization_type" value={formData.organization_type} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]">
                                    <option value="">Pilih Tipe</option>
                                    <option>Dinas Pariwisata Kabupaten/Kota/Provinsi</option>
                                    <option>Badan Otorita Kawasan Pariwisata</option>
                                    <option>Badan Usaha Milik Daerah (BUMD) bidang pariwisata</option>
                                    <option>Badan Pengelola Kawasan (misalnya taman wisata, geopark, kawasan konservasi)</option>
                                    <option>Lembaga Swadaya Masyarakat / Yayasan / Asosiasi Pariwisata</option>
                                    <option>Kelompok Sadar Wisata (Pokdarwis) atau komunitas pariwisata</option>
                                    <option>BUMDes atau lembaga pengelola desa wisata</option>
                                    <option>Asosiasi Industri Pariwisata (PHRI, ASITA, HPI, dsb.)</option>
                                    <option>Forum/Organisasi Pengelola Destinasi (Destination Management Organization / DMO)</option>
                                    <option>Unit kerja di bawah Kementerian/Lembaga</option>
                                    <option value="other">Yang lain</option>
                                </select>
                            </div>
                             {formData.organization_type === 'other' && (
                                <input type="text" name="other_organization_type" placeholder="Sebutkan tipe organisasi Anda" value={formData.other_organization_type} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg mt-2" />
                            )}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-zinc-600">Area Manajemen *</label>
                                 <select name="management_area" value={formData.management_area} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]">
                                    <option value="">Pilih Area</option>
                                    <option>Negara</option>
                                    <option>Provinsi</option>
                                    <option>Kabupaten/Kota</option>
                                    <option>Kawasan/Regional</option>
                                    <option value="other">Yang lain</option>
                                </select>
                            </div>
                             {formData.management_area === 'other' && (
                                <input type="text" name="other_management_area" placeholder="Sebutkan area manajemen Anda" value={formData.other_management_area} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg mt-2" />
                            )}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-slate-700">Section 2: Profil Destinasi</h3>
                        <div className="space-y-4">
                           {/* Tambahkan semua input untuk Section 2 di sini */}
                            <p className='text-center p-4 bg-slate-100 rounded-lg'>Form untuk Section 2 akan ditambahkan di sini...</p>
                        </div>
                    </div>
                );
            case 3:
                return (
                     <div>
                        <h3 className="text-xl font-semibold mb-4 text-slate-700">Section 3: Risk Screening Awal</h3>
                        <div className="space-y-4">
                            <p className='text-center p-4 bg-slate-100 rounded-lg'>Form untuk Section 3 akan ditambahkan di sini...</p>
                        </div>
                    </div>
                );
            case 4:
                return (
                     <div>
                        <h3 className="text-xl font-semibold mb-4 text-slate-700">Section 4: Praktik Keberlanjutan</h3>
                        <div className="space-y-4">
                           <p className='text-center p-4 bg-slate-100 rounded-lg'>Form untuk Section 4 akan ditambahkan di sini...</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div 
            id="auth-page" 
            className="flex items-center justify-center min-h-screen bg-cover bg-center px-4 py-8"
            style={{ backgroundImage: "url('https://indonesia.travel/contentassets/ad62b2d07c3b463694923e90a9701331/borobudur_2.jpg')" }}
        >
            <motion.div 
                className="relative w-full max-w-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isExiting ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                onAnimationComplete={() => {
                    if (isExiting) setActivePage('landing');
                }}
            >
                <motion.div 
                    layout 
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="relative bg-white/95 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-2xl overflow-hidden"
                >
                     <button onClick={handleGoBackToLanding} className="absolute top-6 left-6 text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors z-10">
                        ← Kembali ke Beranda
                    </button>
                    
                    <div className="text-center mb-6 pt-8">
                        <h2 className="text-3xl font-bold" style={{color: colors.brand}}>{isLogin ? "Login Akun" : "Registrasi Destinasi"}</h2>
                    </div>

                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <motion.div key="login" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                                <form onSubmit={handleAuthAction} className="space-y-5">
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-zinc-600">Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg"/>
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-zinc-600">Password</label>
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg"/>
                                    </div>
                                    <button type="submit" disabled={loading} style={{backgroundColor: colors.brand}} className="w-full py-3 font-semibold text-white rounded-lg hover:bg-[#1c4532] disabled:bg-slate-400">
                                        {loading ? 'Memproses...' : 'Masuk'}
                                    </button>
                                </form>
                                <p className="mt-6 text-sm text-center">Belum punya akun? <button onClick={() => setIsLogin(false)} className="font-semibold" style={{color: colors.brand}}>Daftar di sini</button></p>
                            </motion.div>
                        ) : (
                            <motion.div key="register" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                                <ProgressBar step={step} totalSteps={4} />
                                <form onSubmit={handleAuthAction}>
                                    {renderRegisterForm()}
                                    <div className="flex justify-between items-center mt-8">
                                        {step > 1 && (
                                            <button type="button" onClick={handlePrevStep} className="px-6 py-2 font-semibold text-slate-600 bg-slate-200 rounded-lg hover:bg-slate-300">
                                                Kembali
                                            </button>
                                        )}
                                        <div className="flex-grow"></div> {/* Spacer */}
                                        {step < 4 ? (
                                            <button type="button" onClick={handleNextStep} style={{backgroundColor: colors.brand}} className="px-6 py-2 font-semibold text-white rounded-lg hover:bg-[#1c4532]">
                                                Lanjutkan
                                            </button>
                                        ) : (
                                            <button type="submit" disabled={loading} style={{backgroundColor: colors.brand}} className="w-full md:w-auto px-6 py-2 font-semibold text-white rounded-lg hover:bg-[#1c4532] disabled:bg-slate-400">
                                                {loading ? 'Mendaftarkan...' : 'Selesaikan Pendaftaran'}
                                            </button>
                                        )}
                                    </div>
                                </form>
                                <p className="mt-6 text-sm text-center">Sudah punya akun? <button onClick={() => { setIsLogin(true); setStep(1); }} className="font-semibold" style={{color: colors.brand}}>Masuk di sini</button></p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                     {message.content && (
                        <p className={`mt-6 text-sm text-center p-3 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                            {message.content}
                        </p>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}