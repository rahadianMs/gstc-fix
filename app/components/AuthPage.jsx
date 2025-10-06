"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage({ supabase, setActivePage, isLogin, setIsLogin }) {
    // State untuk form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [businessType, setBusinessType] = useState('');
    
    // State untuk UI
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const [registrationStep, setRegistrationStep] = useState(1);
    const [isExiting, setIsExiting] = useState(false); // State baru untuk animasi keluar

    // Palet Warna
     const colors = {
        brand: '#22543d',
        brandHover: '#1c4532',
    };

    const businessTypeCards = [
        { title: "Akomodasi", imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?fm=jpg&q=60&w=3000&ixlib=rb-4-1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmFsaSUyMGhvdGVsfGVufDB8fDB8fHww" },
        { title: "Operator Jasa Perjalanan", imageUrl: "https://images.unsplash.com/photo-1616895727759-dd84a2690433?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
        { title: "Pengelola Atraksi Wisata", imageUrl: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }
    ];

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', content: '' });

        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setMessage({ type: 'error', content: error.message });
            }
        } else {
            if (registrationStep === 1) {
                if (businessName.trim() === '' || email.trim() === '' || password.trim() === '') {
                    setMessage({ type: 'error', content: 'Harap isi semua kolom.' });
                    setLoading(false);
                    return;
                }
                setRegistrationStep(2);
            } else {
                if (businessType === '') {
                    setMessage({ type: 'error', content: 'Harap pilih tipe usaha Anda.' });
                    setLoading(false);
                    return;
                }
                const { error } = await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: {
                        data: {
                            business_name: businessName,
                            business_type: businessType
                        }
                    }
                });
                if (error) {
                    setMessage({ type: 'error', content: error.message });
                } else {
                    setMessage({ type: 'success', content: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi.' });
                }
            }
        }
        setLoading(false);
    };
    
    // Varian animasi disempurnakan
    const formVariants = {
        hidden: (direction) => ({
            opacity: 0,
            x: direction > 0 ? 50 : -50,
        }),
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        },
        exit: (direction) => ({
            opacity: 0,
            x: direction > 0 ? -50 : 50,
            transition: { duration: 0.3, ease: "easeIn" }
        })
    };
    
    // Menentukan arah animasi
    const [direction, setDirection] = useState(0);

    const handleSetIsLogin = (value) => {
        setDirection(value ? -1 : 1);
        setIsLogin(value);
    }

    const handleSetRegStep = (value) => {
        setDirection(value > registrationStep ? 1 : -1);
        setRegistrationStep(value);
    }
    
    // Fungsi baru untuk menangani klik tombol "Kembali"
    const handleGoBack = () => {
        if (!isLogin && registrationStep === 2) {
            handleSetRegStep(1);
        } else {
            setIsExiting(true); // Memulai animasi keluar
        }
    };


    return (
        <div 
            id="auth-page" 
            className="flex items-center justify-center min-h-screen bg-cover bg-center px-4"
            style={{ backgroundImage: "url('https://indonesia.travel/contentassets/ad62b2d07c3b463694923e90a9701331/borobudur_2.jpg')" }}
        >
            <motion.div 
                className="relative w-full max-w-md"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isExiting ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                onAnimationComplete={() => {
                    if (isExiting) {
                        setActivePage('landing');
                    }
                }}
            >
                <motion.div 
                    layout 
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="relative bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-2xl overflow-hidden"
                >
                    <button onClick={handleGoBack} className="absolute top-6 left-6 text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors z-10">
                        ← Kembali
                    </button>

                    <AnimatePresence mode="wait" custom={direction}>
                        {isLogin ? (
                            <motion.div key="login" custom={direction} variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                <h2 className="text-center text-3xl font-bold mb-2 pt-8" style={{color: colors.brand}}>Selamat Datang</h2>
                                <p className="text-center text-zinc-500 mb-8">Masuk untuk melanjutkan ke dasbor Anda.</p>
                                <form onSubmit={handleAuthAction} className="space-y-5">
                                    <div>
                                        <label htmlFor="login-email" className="block mb-2 text-sm font-medium text-zinc-600">Email</label>
                                        <input type="email" id="login-email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]" />
                                    </div>
                                    <div>
                                        <label htmlFor="login-password" className="block mb-2 text-sm font-medium text-zinc-600">Password</label>
                                        <input type="password" id="login-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]" />
                                    </div>
                                    <button type="submit" disabled={loading} style={{backgroundColor: colors.brand}} className="w-full py-3 text-base font-semibold text-white rounded-lg hover:bg-[#1c4532] transition-colors disabled:bg-slate-400">
                                        {loading ? 'Memproses...' : 'Masuk'}
                                    </button>
                                </form>
                                <p className="mt-6 text-sm text-center text-zinc-500">Belum punya akun? <button onClick={() => handleSetIsLogin(false)} className="font-semibold" style={{color: colors.brand}}>Daftar di sini</button></p>
                            </motion.div>
                        ) : (
                            <motion.div key="register">
                                <AnimatePresence mode="wait" custom={direction}>
                                    {registrationStep === 1 ? (
                                        <motion.div key="step1" custom={direction} variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                            <h2 className="text-center text-3xl font-bold mb-2 pt-8" style={{color: colors.brand}}>Buat Akun Baru</h2>
                                            <p className="text-center text-zinc-500 mb-8">Mulai perjalanan bisnis berkelanjutan Anda.</p>
                                            <form onSubmit={handleAuthAction} className="space-y-5">
                                                <div>
                                                    <label htmlFor="register-name" className="block mb-2 text-sm font-medium text-zinc-600">Nama Bisnis</label>
                                                    <input type="text" id="register-name" placeholder="Contoh: Pesona Alam Resort" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]" />
                                                </div>
                                                <div>
                                                    <label htmlFor="register-email" className="block mb-2 text-sm font-medium text-zinc-600">Email</label>
                                                    <input type="email" id="register-email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]" />
                                                </div>
                                                <div>
                                                    <label htmlFor="register-password" className="block mb-2 text-sm font-medium text-zinc-600">Password</label>
                                                    <input type="password" id="register-password" placeholder="Minimal 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]" />
                                                </div>
                                                <button type="submit" disabled={loading} style={{backgroundColor: colors.brand}} className="w-full py-3 text-base font-semibold text-white rounded-lg hover:bg-[#1c4532] transition-colors disabled:bg-slate-400">
                                                    {loading ? 'Memproses...' : 'Lanjutkan'}
                                                </button>
                                            </form>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="step2" custom={direction} variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                            <h2 className="text-center text-3xl font-bold mb-2 pt-8" style={{color: colors.brand}}>Pilih Tipe Usaha</h2>
                                            <p className="text-center text-zinc-500 mb-8">Pilih kategori yang paling sesuai.</p>
                                            <div className="space-y-4 mb-8">
                                                {businessTypeCards.map(card => (
                                                    <motion.button 
                                                        key={card.title}
                                                        type="button"
                                                        onClick={() => setBusinessType(card.title)}
                                                        className={`relative w-full h-24 rounded-2xl overflow-hidden text-left group ring-4 ${businessType === card.title ? 'ring-[#22543d]' : 'ring-transparent'}`}
                                                        whileHover={{ scale: 1.03 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                    >
                                                        <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
                                                        <h4 className="absolute bottom-4 left-5 text-xl font-bold text-white z-10">{card.title}</h4>
                                                        <AnimatePresence>
                                                        {businessType === card.title && (
                                                            <motion.div 
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                exit={{ scale: 0 }}
                                                                className="absolute top-3 right-3 bg-white rounded-full w-6 h-6 flex items-center justify-center"
                                                            >
                                                                <svg className="w-4 h-4" style={{color: colors.brand}} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                                            </motion.div>
                                                        )}
                                                        </AnimatePresence>
                                                    </motion.button>
                                                ))}
                                            </div>
                                            <button onClick={handleAuthAction} disabled={loading || !businessType} style={{backgroundColor: colors.brand}} className="w-full py-3 text-base font-semibold text-white rounded-lg hover:bg-[#1c4532] transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
                                                {loading ? 'Mendaftarkan...' : 'Selesaikan Pendaftaran'}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <p className="mt-6 text-sm text-center text-zinc-500">Sudah punya akun? <button onClick={() => { handleSetIsLogin(true); handleSetRegStep(1); }} className="font-semibold" style={{color: colors.brand}}>Masuk di sini</button></p>
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