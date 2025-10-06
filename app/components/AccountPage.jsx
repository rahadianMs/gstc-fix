"use client";

import { useState } from 'react';

// Komponen untuk Halaman Akun
export default function AccountPage({ user, supabase }) {
    const [loading, setLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    const [businessName, setBusinessName] = useState(user?.user_metadata?.business_name || '');
    const [businessType, setBusinessType] = useState(user?.user_metadata?.business_type || '');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setProfileMessage({ type: '', text: '' });

        const { error } = await supabase.auth.updateUser({
            data: { business_name: businessName, business_type: businessType }
        });

        if (error) {
            setProfileMessage({ type: 'error', text: `Gagal memperbarui profil: ${error.message}` });
        } else {
            setProfileMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
            setTimeout(() => window.location.reload(), 1500);
        }
        setLoading(false);
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Password minimal harus 6 karakter.' });
            return;
        }
        if (password !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
            return;
        }

        setLoading(true);
        setPasswordMessage({ type: '', text: '' });

        const { error } = await supabase.auth.updateUser({ password: password });

        if (error) {
            setPasswordMessage({ type: 'error', text: `Gagal mengubah password: ${error.message}` });
        } else {
            setPasswordMessage({ type: 'success', text: 'Password berhasil diubah!' });
            setPassword('');
            setConfirmPassword('');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-md border">
                <h3 className="text-2xl font-bold mb-6 text-slate-800">Profil Usaha</h3>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                        <label htmlFor="businessName" className="block text-sm font-medium text-slate-700 mb-1">Nama Usaha</label>
                        <input id="businessName" type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]" />
                    </div>
                    <div>
                        <label htmlFor="businessType" className="block text-sm font-medium text-slate-700 mb-1">Tipe Usaha</label>
                        <select id="businessType" value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]">
                            <option>Akomodasi</option>
                            <option>Operator Jasa Perjalanan</option>
                            <option>Pengelola Atraksi Wisata</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input id="email" type="email" value={user.email} disabled className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 text-base font-semibold text-white rounded-lg transition-colors disabled:bg-slate-400" style={{backgroundColor: '#22543d'}}>
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
                    </button>
                    {profileMessage.text && <p className={`mt-4 text-sm text-center p-2 rounded-lg ${profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{profileMessage.text}</p>}
                </form>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border">
                <h3 className="text-2xl font-bold mb-6 text-slate-800">Ubah Password</h3>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                     <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]" />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password Baru</label>
                        <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password baru" className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]" />
                    </div>
                     <button type="submit" disabled={loading} className="w-full py-3 text-base font-semibold text-white rounded-lg transition-colors disabled:bg-slate-400" style={{backgroundColor: '#22543d'}}>
                        {loading ? 'Menyimpan...' : 'Ubah Password'}
                    </button>
                    {passwordMessage.text && <p className={`mt-4 text-sm text-center p-2 rounded-lg ${passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{passwordMessage.text}</p>}
                </form>
            </div>
        </div>
    );
};