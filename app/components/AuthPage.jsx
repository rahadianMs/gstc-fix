"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// --- Komponen Progress Bar ---
const ProgressBar = ({ step, totalSteps }) => {
    const progress = (step / totalSteps) * 100;
    return (
        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-8">
            <motion.div
                className="h-2.5 rounded-full"
                style={{ backgroundColor: '#e8c458' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            ></motion.div>
        </div>
    );
};

// --- Komponen Sukses ---
const RegistrationSuccess = ({ onContinue }) => (
    <motion.div
        key="success"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="text-center"
    >
        <h3 className="text-2xl font-bold text-green-600 mb-4">Registrasi Berhasil!</h3>
        <p className="text-slate-600 mb-6">
            Satu langkah terakhir! Kami telah mengirimkan email verifikasi ke alamat Anda. Silakan klik tautan di dalamnya untuk mengaktifkan akun Anda.
        </p>
        <button
            onClick={onContinue}
            style={{ backgroundColor: '#e8c458' }}
            className="w-full py-3 font-semibold text-white rounded-lg hover:opacity-90"
        >
            Lanjutkan ke Login
        </button>
    </motion.div>
);

// --- Komponen Utama AuthPage ---
export default function AuthPage({ supabase }) {
    const router = useRouter();
    
    // State UI
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const [step, setStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    // State Data Form (Lengkap sesuai Profil)
    const [formData, setFormData] = useState({
        email: '', password: '', destination_name: '', managing_organization_name: '',
        organization_type: '', other_organization_type: '', management_area: '', other_management_area: '',
        admin_province: '', admin_regency: '', admin_district: '', destination_area_size: '',
        
        // Profil Data
        village_count: '', population_count: '', visitor_count_last_year: '',
        
        // Inventarisasi
        main_attraction_types: [], other_main_attraction_type: '',
        hotel_count: '', homestay_count: '', restaurant_count: '', tour_operator_count: '',
        sme_count: '', certified_entity_count: '', followed_certifications: '',
        
        // Isu Keberlanjutan
        special_area_status: [], other_special_area_status: '',
        natural_disaster_risks: [], other_natural_disaster_risk: '',
        sensitive_sites: '', religious_sites: '', monitored_kpis: '', renewable_energy_usage: '',
    });

    const colors = { brand: '#e8c458', brandHover: '#d4b350' };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked 
                    ? [...(prev[name] || []), value]
                    : (prev[name] || []).filter(item => item !== value)
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleGoBackToLanding = () => {
        router.push('/');
    };

    const handleNextStep = async () => {
        setMessage({ type: '', content: '' });

        if (step === 1) {
            if (!formData.email || !formData.password || !formData.destination_name) {
                setMessage({ type: 'error', content: 'Harap lengkapi kolom wajib (Email, Password, Nama Destinasi).' });
                return;
            }
            if (formData.password.length < 6) {
                setMessage({ type: 'error', content: 'Password minimal harus 6 karakter.' });
                return;
            }
        }
        
        setStep(prev => prev + 1);
    };
    
    const handlePrevStep = () => setStep(prev => prev - 1);

    const handleAuthAction = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setMessage({ type: '', content: '' });

        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
            if (error) {
                setMessage({ type: 'error', content: error.message });
            } else {
                router.push('/dashboard');
            }
        } else {
            // Logika Register
            const profileData = { ...formData };
            delete profileData.email;
            delete profileData.password;
            
            // Konversi string ke integer untuk field angka
            const integerFields = [
                'village_count', 'population_count', 'visitor_count_last_year', 
                'hotel_count', 'homestay_count', 'restaurant_count', 'tour_operator_count', 
                'sme_count', 'certified_entity_count', 'renewable_energy_usage'
            ];
            
            integerFields.forEach(field => {
                if (profileData[field] === '' || profileData[field] === null) {
                    profileData[field] = null;
                } else {
                    profileData[field] = parseInt(profileData[field], 10);
                }
            });

            const { error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: profileData
                }
            });

            if (signUpError) {
                setMessage({ type: 'error', content: signUpError.message });
            } else {
                setShowSuccess(true);
            }
        }
        setLoading(false);
    };

    const handleContinueToLogin = () => {
        setShowSuccess(false);
        setIsLogin(true);
        setStep(1);
    };

    // --- FUNGSI RENDER FORM REGISTER LENGKAP ---
    const renderRegisterForm = () => {
        const inputClass = "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#e8c458] focus:outline-none";
        const labelClass = "block mb-1 text-sm font-medium text-zinc-600";

        switch (step) {
            case 1:
                return (
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-slate-700">Section 1: Identitas Destinasi</h3>
                        <div className="space-y-4">
                            <div><label className={labelClass}>Email *</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} /></div>
                            <div><label className={labelClass}>Password *</label><input type="password" name="password" placeholder="Minimal 6 karakter" value={formData.password} onChange={handleChange} required className={inputClass} /></div>
                            <div><label className={labelClass}>Nama Destinasi Wisata *</label><input type="text" name="destination_name" value={formData.destination_name} onChange={handleChange} required className={inputClass} /></div>
                            <div><label className={labelClass}>Nama Lembaga Pengelola *</label><input type="text" name="managing_organization_name" value={formData.managing_organization_name} onChange={handleChange} required className={inputClass} /></div>
                            <div>
                                <label className={labelClass}>Tipe Organisasi</label>
                                <select name="organization_type" value={formData.organization_type} onChange={handleChange} className={inputClass}>
                                    <option value="">Pilih Tipe</option>
                                    <option>Dinas Pariwisata Kabupaten/Kota/Provinsi</option>
                                    <option>Badan Otorita Kawasan Pariwisata</option>
                                    <option>Badan Usaha Milik Daerah (BUMD) / Badan Usaha Milik Negara (BUMN) bidang pariwisata</option>
                                    <option>Badan Pengelola Kawasan (taman wisata, geopark, dll)</option>
                                    <option>Lembaga Swadaya Masyarakat / Yayasan / Asosiasi</option>
                                    <option>Kelompok Sadar Wisata (Pokdarwis) / Komunitas</option>
                                    <option>BUMDes / Pengelola Desa Wisata</option>
                                    <option>Asosiasi Industri Pariwisata (PHRI, ASITA, dll)</option>
                                    <option>Forum/DMO (Destination Management Organization)</option>
                                    <option value="other">Lainnya</option>
                                </select>
                            </div>
                            {formData.organization_type === 'other' && <input type="text" name="other_organization_type" placeholder="Sebutkan tipe lainnya" value={formData.other_organization_type} onChange={handleChange} className={`${inputClass} mt-2`} />}
                            <div>
                                <label className={labelClass}>Area Manajemen</label>
                                <select name="management_area" value={formData.management_area} onChange={handleChange} className={inputClass}>
                                    <option value="">Pilih Area</option>
                                    <option>Negara</option>
                                    <option>Provinsi</option>
                                    <option>Kabupaten/Kota</option>
                                    <option>Kawasan/Regional</option>
                                    <option value="other">Lainnya</option>
                                </select>
                            </div>
                            {formData.management_area === 'other' && <input type="text" name="other_management_area" placeholder="Sebutkan area manajemen lainnya" value={formData.other_management_area} onChange={handleChange} className={`${inputClass} mt-2`} />}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-slate-700">Section 2: Profil Destinasi</h3>
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div><label className={labelClass}>Provinsi</label><input type="text" name="admin_province" value={formData.admin_province} onChange={handleChange} className={inputClass}/></div>
                                <div><label className={labelClass}>Kabupaten/Kota</label><input type="text" name="admin_regency" value={formData.admin_regency} onChange={handleChange} className={inputClass}/></div>
                            </div>
                            <div><label className={labelClass}>Kecamatan</label><input type="text" name="admin_district" value={formData.admin_district} onChange={handleChange} className={inputClass}/></div>
                            {/* PERBAIKAN: Tambah min="0" */}
                            <div><label className={labelClass}>Luas Area (km²)</label><input type="number" min="0" name="destination_area_size" value={formData.destination_area_size} onChange={handleChange} className={inputClass}/></div>
                            <div className="grid md:grid-cols-3 gap-4">
                                {/* PERBAIKAN: Tambah min="0" */}
                                <div><label className={labelClass}>Jumlah Desa</label><input type="number" min="0" name="village_count" value={formData.village_count} onChange={handleChange} className={inputClass}/></div>
                                <div><label className={labelClass}>Jumlah Populasi</label><input type="number" min="0" name="population_count" value={formData.population_count} onChange={handleChange} className={inputClass}/></div>
                                <div><label className={labelClass}>Pengunjung (thn lalu)</label><input type="number" min="0" name="visitor_count_last_year" value={formData.visitor_count_last_year} onChange={handleChange} className={inputClass}/></div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                     <div>
                        <h3 className="text-xl font-semibold mb-4 text-slate-700">Section 3: Inventarisasi Aset</h3>
                        <div className="space-y-4">
                             <div>
                                <label className={labelClass}>Tipe Atraksi Utama</label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {['Alam', 'Budaya', 'Buatan', 'Event', 'Kuliner', 'Wellness'].map(type => (
                                        <label key={type} className="flex items-center space-x-2"><input type="checkbox" name="main_attraction_types" value={type} checked={formData.main_attraction_types.includes(type)} onChange={handleChange} /><span>{type}</span></label>
                                    ))}
                                    <label className="flex items-center space-x-2"><input type="checkbox" name="main_attraction_types" value="other" checked={formData.main_attraction_types.includes('other')} onChange={handleChange} /><span>Lainnya</span></label>
                                </div>
                                {formData.main_attraction_types.includes('other') && <input type="text" name="other_main_attraction_type" placeholder="Sebutkan lainnya" value={formData.other_main_attraction_type} onChange={handleChange} className={`${inputClass} mt-2`} />}
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* PERBAIKAN: Tambah min="0" */}
                                <div><label className={labelClass}>Jumlah Hotel</label><input type="number" min="0" name="hotel_count" value={formData.hotel_count} onChange={handleChange} className={inputClass}/></div>
                                <div><label className={labelClass}>Jumlah Homestay</label><input type="number" min="0" name="homestay_count" value={formData.homestay_count} onChange={handleChange} className={inputClass}/></div>
                                <div><label className={labelClass}>Jumlah Restoran</label><input type="number" min="0" name="restaurant_count" value={formData.restaurant_count} onChange={handleChange} className={inputClass}/></div>
                                <div><label className={labelClass}>Jumlah Tour Operator</label><input type="number" min="0" name="tour_operator_count" value={formData.tour_operator_count} onChange={handleChange} className={inputClass}/></div>
                                <div><label className={labelClass}>Jumlah UMKM</label><input type="number" min="0" name="sme_count" value={formData.sme_count} onChange={handleChange} className={inputClass}/></div>
                                <div><label className={labelClass}>Entitas Tersertifikasi</label><input type="number" min="0" name="certified_entity_count" value={formData.certified_entity_count} onChange={handleChange} className={inputClass}/></div>
                            </div>
                            <div><label className={labelClass}>Sertifikasi yang Pernah Diikuti</label><input type="text" name="followed_certifications" value={formData.followed_certifications} onChange={handleChange} className={inputClass}/></div>
                        </div>
                    </div>
                );
            case 4:
                return (
                     <div>
                        <h3 className="text-xl font-semibold mb-4 text-slate-700">Section 4: Isu Keberlanjutan</h3>
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Status Kawasan Khusus</label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {['Taman Nasional', 'Cagar Biosfer', 'Geopark', 'Kawasan Konservasi', 'Situs Warisan Dunia'].map(type => (
                                        <label key={type} className="flex items-center space-x-2"><input type="checkbox" name="special_area_status" value={type} checked={formData.special_area_status.includes(type)} onChange={handleChange} /><span>{type}</span></label>
                                    ))}
                                    <label className="flex items-center space-x-2"><input type="checkbox" name="special_area_status" value="other" checked={formData.special_area_status.includes('other')} onChange={handleChange} /><span>Lainnya</span></label>
                                </div>
                                {formData.special_area_status.includes('other') && <input type="text" name="other_special_area_status" placeholder="Sebutkan lainnya" value={formData.other_special_area_status} onChange={handleChange} className={`${inputClass} mt-2`} />}
                            </div>
                            <div>
                                <label className={labelClass}>Risiko Bencana Alam</label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {['Banjir', 'Tanah Longsor', 'Gempa Bumi', 'Tsunami', 'Kekeringan', 'Letusan Gunung Api'].map(type => (
                                        <label key={type} className="flex items-center space-x-2"><input type="checkbox" name="natural_disaster_risks" value={type} checked={formData.natural_disaster_risks.includes(type)} onChange={handleChange} /><span>{type}</span></label>
                                    ))}
                                </div>
                            </div>
                            <div><label className={labelClass}>Situs Sensitif (Alam/Budaya)</label><textarea name="sensitive_sites" value={formData.sensitive_sites} onChange={handleChange} className={inputClass} rows="2"></textarea></div>
                            <div><label className={labelClass}>Situs Keagamaan</label><textarea name="religious_sites" value={formData.religious_sites} onChange={handleChange} className={inputClass} rows="2"></textarea></div>
                            <div><label className={labelClass}>KPI yang dimonitor</label><input type="text" name="monitored_kpis" value={formData.monitored_kpis} onChange={handleChange} className={inputClass}/></div>
                            {/* PERBAIKAN: Tambah min="0" max="100" */}
                            <div><label className={labelClass}>Energi Terbarukan (%)</label><input type="number" min="0" max="100" name="renewable_energy_usage" placeholder="0-100" value={formData.renewable_energy_usage} onChange={handleChange} className={inputClass}/></div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div 
            className="flex items-center justify-center min-h-screen bg-cover bg-center px-4 py-8"
            style={{ backgroundImage: "url('https://indonesia.travel/contentassets/ad62b2d07c3b463694923e90a9701331/borobudur_2.jpg')" }}
        >
            <motion.div 
                className="relative w-full max-w-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <motion.div 
                    layout 
                    className="relative bg-white/95 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-2xl overflow-hidden"
                >
                     <button onClick={handleGoBackToLanding} className="absolute top-6 left-6 text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors z-10">
                        ← Kembali ke Beranda
                    </button>
                    
                    <AnimatePresence mode="wait">
                        {showSuccess ? (
                            <RegistrationSuccess onContinue={handleContinueToLogin} />
                        ) : (
                            <motion.div key="auth-form" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                                <div className="text-center mb-6 pt-8">
                                    <h2 className="text-3xl font-bold" style={{color: colors.brand}}>{isLogin ? "Login Akun" : "Registrasi Destinasi"}</h2>
                                </div>
                                {isLogin ? (
                                    <form onSubmit={handleAuthAction} className="space-y-5">
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-zinc-600">Email</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8c458]"/>
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-zinc-600">Password</label>
                                            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8c458]"/>
                                        </div>
                                        <button type="submit" disabled={loading} style={{backgroundColor: colors.brand}} className="w-full py-3 font-semibold text-white rounded-lg hover:bg-[#d4b350] disabled:bg-slate-400">
                                            {loading ? 'Memproses...' : 'Masuk'}
                                        </button>
                                    </form>
                                ) : (
                                    <div>
                                        <ProgressBar step={step} totalSteps={4} />
                                        <div className="max-h-[60vh] overflow-y-auto pr-4 -mr-4">
                                            {renderRegisterForm()}
                                        </div>
                                        <div className="flex justify-between items-center mt-8">
                                            {step > 1 ? (
                                                <button type="button" onClick={handlePrevStep} className="px-6 py-2 font-semibold text-slate-600 bg-slate-200 rounded-lg hover:bg-slate-300">
                                                    Kembali
                                                </button>
                                            ) : <div></div>}
                                            {step < 4 ? (
                                                <button type="button" onClick={handleNextStep} disabled={loading} style={{backgroundColor: colors.brand}} className="px-6 py-2 font-semibold text-white rounded-lg hover:bg-[#d4b350] disabled:opacity-50">
                                                    Lanjut
                                                </button>
                                            ) : (
                                                <button type="button" onClick={() => handleAuthAction()} disabled={loading} style={{backgroundColor: colors.brand}} className="w-full md:w-auto px-6 py-2 font-semibold text-white rounded-lg hover:bg-[#d4b350] disabled:bg-slate-400">
                                                    {loading ? 'Mendaftarkan...' : 'Selesai'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <p className="mt-6 text-sm text-center">
                                    {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
                                    <button onClick={() => { setIsLogin(!isLogin); setStep(1); setMessage({ type: '', content: '' }); }} className="font-semibold ml-1" style={{color: colors.brand}}>
                                        {isLogin ? "Daftar di sini" : "Masuk di sini"}
                                    </button>
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                     {message.content && !showSuccess && (
                        <p className={`mt-6 text-sm text-center p-3 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                            {message.content}
                        </p>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}