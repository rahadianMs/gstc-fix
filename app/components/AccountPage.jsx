"use client";

import { useState, useEffect } from 'react';
import { PencilIcon } from './Icons';

// Data Opsi (hanya digunakan untuk form destinasi)
const organizationTypes = ["Dinas Pariwisata Kabupaten/Kota/Provinsi", "Badan Otorita Kawasan Pariwisata", "BUMD", "Badan Pengelola Kawasan", "LSM/Yayasan/Asosiasi", "Pokdarwis", "BUMDes", "Asosiasi Industri", "DMO", "Unit Kementerian/Lembaga", "Yang lain"];
const managementAreas = ["Negara", "Provinsi", "Kabupaten/Kota", "Kawasan/Regional", "Yang lain"];

// Komponen Halaman Akun yang diperbarui
export default function AccountPage({ user, supabase }) {
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({});
    const [initialData, setInitialData] = useState({});
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [userRole, setUserRole] = useState(null); // State untuk menyimpan peran

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

            if (error) {
                setProfileMessage({ type: 'error', text: `Gagal memuat profil: ${error.message}` });
            } else if (data) {
                setFormData(data);
                setInitialData(data);
                setUserRole(data.role); // Simpan peran pengguna
            }
            setLoading(false);
        };
        fetchProfile();
    }, [user, supabase]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleCancelEdit = () => { setFormData(initialData); setIsEditing(false); setProfileMessage({ type: '', text: '' }); };
    
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setProfileMessage({ type: '', text: '' });
        
        // Hanya kirim data yang relevan
        const dataToUpdate = userRole === 'consultant' ? { full_name: formData.full_name } : formData;

        const { data, error } = await supabase.from('profiles').update(dataToUpdate).eq('id', user.id).select().single();

        if (error) {
            setProfileMessage({ type: 'error', text: `Gagal memperbarui profil: ${error.message}` });
        } else {
            setProfileMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
            setInitialData(data);
            setIsEditing(false);
        }
        setLoading(false);
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (password.length < 6) { setPasswordMessage({ type: 'error', text: 'Password minimal 6 karakter.' }); return; }
        if (password !== confirmPassword) { setPasswordMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' }); return; }
        setLoading(true);
        setPasswordMessage({ type: '', text: '' });
        const { error } = await supabase.auth.updateUser({ password: password });
        if (error) { setPasswordMessage({ type: 'error', text: `Gagal mengubah password: ${error.message}` }); } 
        else { setPasswordMessage({ type: 'success', text: 'Password berhasil diubah!' }); setPassword(''); setConfirmPassword(''); }
        setLoading(false);
    };
    
    // --- RENDER FORM BERDASARKAN PERAN PENGGUNA ---
    const renderProfileForm = () => {
        if (userRole === 'consultant') {
            return (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                        <input type="text" name="full_name" value={formData.full_name || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={handleCancelEdit} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Batal</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:bg-slate-400" style={{backgroundColor: '#3f545f'}}>
                            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            );
        }
        // Form default untuk destinasi
        return (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
                 <div><label className="block text-sm font-medium text-slate-700 mb-1">Nama Destinasi Wisata</label><input type="text" name="destination_name" value={formData.destination_name || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
                 <div><label className="block text-sm font-medium text-slate-700 mb-1">Nama Lembaga Pengelola</label><input type="text" name="managing_organization_name" value={formData.managing_organization_name || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
                 {/* Tambahkan field form destinasi lainnya di sini jika perlu */}
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={handleCancelEdit} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Batal</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:bg-slate-400" style={{backgroundColor: '#3f545f'}}>
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        );
    };

    const renderProfileView = () => {
        if (userRole === 'consultant') {
            return (
                <div className="divide-y divide-slate-200">
                    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4"><dt className="text-sm font-medium text-slate-500">Nama Lengkap</dt><dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{initialData.full_name || '-'}</dd></div>
                    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4"><dt className="text-sm font-medium text-slate-500">Email</dt><dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{user.email}</dd></div>
                </div>
            );
        }
        return (
             <div className="divide-y divide-slate-200">
                <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4"><dt className="text-sm font-medium text-slate-500">Email</dt><dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{user.email}</dd></div>
                <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4"><dt className="text-sm font-medium text-slate-500">Nama Destinasi</dt><dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{initialData.destination_name || '-'}</dd></div>
                 <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4"><dt className="text-sm font-medium text-slate-500">Lembaga Pengelola</dt><dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{initialData.managing_organization_name || '-'}</dd></div>
             </div>
        );
    };

    if (loading && !userRole) { return <div className="text-center p-8">Memuat data profil...</div>; }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-md border">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">Profil Saya</h3>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg" style={{backgroundColor: '#e8c45820', color: '#3f545f'}}>
                            <PencilIcon className="w-4 h-4" /> Edit Profil
                        </button>
                    )}
                </div>
                {isEditing ? renderProfileForm() : renderProfileView()}
                {profileMessage.text && <p className={`mt-4 text-sm text-center p-2 rounded-lg ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{profileMessage.text}</p>}
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border">
                <h3 className="text-2xl font-bold mb-6 text-slate-800">Ubah Password</h3>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                     <div><label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password Baru</label><input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" className="w-full p-2 border border-slate-300 rounded-lg" /></div>
                    <div><label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password Baru</label><input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password baru" className="w-full p-2 border border-slate-300 rounded-lg" /></div>
                     <button type="submit" disabled={loading} className="w-full py-3 text-base font-semibold text-white rounded-lg transition-colors disabled:bg-slate-400" style={{backgroundColor: '#3f545f'}}>
                        {loading ? 'Menyimpan...' : 'Ubah Password'}
                    </button>
                    {passwordMessage.text && <p className={`mt-4 text-sm text-center p-2 rounded-lg ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{passwordMessage.text}</p>}
                </form>
            </div>
        </div>
    );
};