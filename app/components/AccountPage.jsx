"use client";

import { useState, useEffect } from 'react';
import { PencilIcon } from './Icons';

// Data Opsi untuk Select dan Checkbox
const organizationTypes = [
    "Dinas Pariwisata Kabupaten/Kota/Provinsi", "Badan Otorita Kawasan Pariwisata",
    "Badan Usaha Milik Daerah (BUMD) bidang pariwisata", "Badan Pengelola Kawasan (misalnya taman wisata, geopark, kawasan konservasi)",
    "Lembaga Swadaya Masyarakat / Yayasan / Asosiasi Pariwisata", "Kelompok Sadar Wisata (Pokdarwis) atau komunitas pariwisata",
    "BUMDes atau lembaga pengelola desa wisata", "Asosiasi Industri Pariwisata (PHRI, ASITA, HPI, dsb.)",
    "Forum/Organisasi Pengelola Destinasi (Destination Management Organization / DMO)", "Unit kerja di bawah Kementerian/Lembaga", "Yang lain"
];
const managementAreas = ["Negara", "Provinsi", "Kabupaten/Kota", "Kawasan/Regional", "Yang lain"];
const attractionTypes = [
    "Alam (gunung, pantai, danau, hutan, taman nasional)", "Budaya (adat, seni, upacara, kerajinan)",
    "Warisan sejarah (situs, bangunan bersejarah)", "Religi/spiritual (rumah ibadah, situs ziarah, retret)",
    "Agrowisata/eduwisata", "MICE (Meeting, Incentive, Conference, Exhibition)", "Kuliner", "Yang lain"
];
const specialAreaStatuses = [
    "UNESCO World Heritage", "IUCN Protected Areas", "Ramsar Wetlands", "Kawasan Taman Nasional",
    "Kawasan Taman Hutan Raya (Tahura)", "Kawasan Cagar Alam / Suaka Margasatwa",
    "Kawasan Geopark Nasional / UNESCO Global Geopark", "Kawasan Konservasi Laut (KKP/KKL)",
    "Kawasan Cagar Budaya Nasional/Daerah", "Tidak termasuk", "Yang lain"
];
const disasterRisks = [
    "Banjir", "Longsor", "Erosi pantai/abrasi", "Kebakaran hutan/lahan", "Gempa bumi/tsunami",
    "Gunung berapi/erupsi", "Kekeringan ekstrem", "Tidak ada", "Yang lain"
];

// Komponen untuk menampilkan baris data (read-only)
const ProfileDataRow = ({ label, value }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-slate-500">{label}</dt>
        <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{Array.isArray(value) && value.length > 0 ? value.join(', ') : value || '-'}</dd>
    </div>
);

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

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

            if (error) {
                setProfileMessage({ type: 'error', text: `Gagal memuat profil: ${error.message}` });
            } else if (data) {
                setFormData(data);
                setInitialData(data);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [user, supabase]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            const currentValues = formData[name] || [];
            if (checked) {
                setFormData(prev => ({ ...prev, [name]: [...currentValues, value] }));
            } else {
                setFormData(prev => ({ ...prev, [name]: currentValues.filter(item => item !== value) }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCancelEdit = () => {
        setFormData(initialData);
        setIsEditing(false);
        setProfileMessage({ type: '', text: '' });
    };
    
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setProfileMessage({ type: '', text: '' });

        const { data, error } = await supabase.from('profiles').update(formData).eq('id', user.id).select().single();

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
    
    if (loading && Object.keys(initialData).length === 0) {
        return <div className="text-center p-8">Memuat data profil...</div>;
    }

    const CheckboxGroup = ({ name, options, label }) => (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {options.map(option => (
                    <label key={option} className="flex items-center">
                        <input type="checkbox" name={name} value={option} checked={formData[name]?.includes(option) || false} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                        <span className="ml-2 text-sm text-slate-600">{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-md border">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">Profil Destinasi</h3>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200">
                            <PencilIcon className="w-4 h-4" /> Edit Profil
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        {/* SECTION 1 */}
                        <fieldset className="border p-4 rounded-lg"><legend className="px-2 font-semibold">Identitas Destinasi</legend>
                            <div className="space-y-4 p-2">
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Nama Destinasi Wisata</label><input type="text" name="destination_name" value={formData.destination_name || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Nama Lembaga Pengelola</label><input type="text" name="managing_organization_name" value={formData.managing_organization_name || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Tipe Organisasi</label><select name="organization_type" value={formData.organization_type || ''} onChange={handleChange} className="w-full p-2 border rounded-lg">{organizationTypes.map(o => <option key={o}>{o}</option>)}</select></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Area Manajemen</label><select name="management_area" value={formData.management_area || ''} onChange={handleChange} className="w-full p-2 border rounded-lg">{managementAreas.map(a => <option key={a}>{a}</option>)}</select></div>
                            </div>
                        </fieldset>
                        {/* SECTION 2 */}
                        <fieldset className="border p-4 rounded-lg"><legend className="px-2 font-semibold">Profil Destinasi</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                                <div><label className="block text-sm font-medium">Provinsi</label><input type="text" name="admin_province" value={formData.admin_province || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
                                <div><label className="block text-sm font-medium">Kabupaten/Kota</label><input type="text" name="admin_regency" value={formData.admin_regency || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
                                <div><label className="block text-sm font-medium">Kecamatan/Desa</label><input type="text" name="admin_district" value={formData.admin_district || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
                                <div><label className="block text-sm font-medium">Luas Wilayah</label><input type="text" name="destination_area_size" value={formData.destination_area_size || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
                                <div><label className="block text-sm font-medium">Batas Utara</label><input type="text" name="boundary_north" value={formData.boundary_north || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
                                <div><label className="block text-sm font-medium">Batas Selatan</label><input type="text" name="boundary_south" value={formData.boundary_south || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
                                <div><label className="block text-sm font-medium">Batas Timur</label><input type="text" name="boundary_east" value={formData.boundary_east || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
                                <div><label className="block text-sm font-medium">Batas Barat</label><input type="text" name="boundary_west" value={formData.boundary_west || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
                                <div className="md:col-span-2"><CheckboxGroup name="main_attraction_types" options={attractionTypes} label="Jenis Daya Tarik Utama" /></div>
                                <div className="md:col-span-2"><label className="block text-sm font-medium">List Sertifikasi yang Diikuti</label><textarea name="followed_certifications" value={formData.followed_certifications || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
                            </div>
                        </fieldset>
                         {/* SECTION 3 */}
                        <fieldset className="border p-4 rounded-lg"><legend className="px-2 font-semibold">Risk Screening Awal</legend>
                             <div className="space-y-4 p-2">
                                <CheckboxGroup name="special_area_status" options={specialAreaStatuses} label="Apakah destinasi berada di salah satu kawasan berikut?" />
                                <CheckboxGroup name="natural_disaster_risks" options={disasterRisks} label="Apakah destinasi rawan bencana alam?" />
                                <div><label className="block text-sm font-medium">Situs sensitif terhadap pariwisata</label><textarea name="sensitive_sites" value={formData.sensitive_sites || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
                                <div><label className="block text-sm font-medium">Situs keagamaan/spiritual</label><textarea name="religious_sites" value={formData.religious_sites || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
                             </div>
                        </fieldset>
                        {/* SECTION 4 */}
                        <fieldset className="border p-4 rounded-lg"><legend className="px-2 font-semibold">Praktik Keberlanjutan</legend>
                            <div className="space-y-4 p-2">
                                <div><label className="block text-sm font-medium">Indikator kinerja yang dipantau</label><textarea name="monitored_kpis" value={formData.monitored_kpis || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
                                <div><label className="block text-sm font-medium">Penggunaan energi terbarukan</label><textarea name="renewable_energy_usage" value={formData.renewable_energy_usage || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
                            </div>
                        </fieldset>
                        <div className="flex justify-end gap-4 pt-4">
                            <button type="button" onClick={handleCancelEdit} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Batal</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-[#22543d] rounded-lg hover:bg-[#1c4532] disabled:bg-slate-400">
                                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="divide-y divide-slate-200">
                        <ProfileDataRow label="Email" value={user.email} />
                        <h4 className="font-semibold pt-4 text-slate-600">Identitas Destinasi</h4>
                        <ProfileDataRow label="Nama Destinasi" value={initialData.destination_name} />
                        <ProfileDataRow label="Nama Lembaga Pengelola" value={initialData.managing_organization_name} />
                        <ProfileDataRow label="Tipe Organisasi" value={initialData.organization_type} />
                        <ProfileDataRow label="Area Manajemen" value={initialData.management_area} />
                        <h4 className="font-semibold pt-4 text-slate-600">Profil Destinasi</h4>
                        <ProfileDataRow label="Provinsi" value={initialData.admin_province} />
                        <ProfileDataRow label="Kabupaten/Kota" value={initialData.admin_regency} />
                        <ProfileDataRow label="Daya Tarik Utama" value={initialData.main_attraction_types} />
                        <h4 className="font-semibold pt-4 text-slate-600">Risk Screening</h4>
                        <ProfileDataRow label="Status Kawasan" value={initialData.special_area_status} />
                        <ProfileDataRow label="Risiko Bencana" value={initialData.natural_disaster_risks} />
                         <h4 className="font-semibold pt-4 text-slate-600">Praktik Keberlanjutan</h4>
                        <ProfileDataRow label="KPI yang Dipantau" value={initialData.monitored_kpis} />
                        <ProfileDataRow label="Energi Terbarukan" value={initialData.renewable_energy_usage} />
                    </div>
                )}
                 {profileMessage.text && <p className={`mt-4 text-sm text-center p-2 rounded-lg ${profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{profileMessage.text}</p>}
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border">
                <h3 className="text-2xl font-bold mb-6 text-slate-800">Ubah Password</h3>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                     <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" className="w-full p-2 border border-slate-300 rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password Baru</label>
                        <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password baru" className="w-full p-2 border border-slate-300 rounded-lg" />
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