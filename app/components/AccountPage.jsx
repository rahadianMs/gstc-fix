"use client";

import { useState, useEffect } from 'react';
import { PencilIcon } from './Icons';

// --- Komponen Utama Halaman Akun ---
export default function AccountPage({ user, supabase }) {
    // State untuk UI
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    
    // State untuk Data Form
    const [formData, setFormData] = useState({});
    const [initialData, setInitialData] = useState({});

    // State untuk Password
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State untuk menyimpan peran pengguna
    const [userRole, setUserRole] = useState(null);

    // Mengambil data profil saat komponen dimuat
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

            if (error) {
                setProfileMessage({ type: 'error', text: `Gagal memuat profil: ${error.message}` });
            } else if (data) {
                // Inisialisasi semua field yang mungkin ada, termasuk array untuk checkbox
                const initialForm = {
                    ...data,
                    main_attraction_types: data.main_attraction_types || [],
                    special_area_status: data.special_area_status || [],
                    natural_disaster_risks: data.natural_disaster_risks || [],
                };
                setFormData(initialForm);
                setInitialData(initialForm);
                setUserRole(data.role);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [user, supabase]);

    // Handler untuk perubahan input form
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

    // Batal mengubah profil
    const handleCancelEdit = () => {
        setFormData(initialData);
        setIsEditing(false);
        setProfileMessage({ type: '', text: '' });
    };

    // Mengirim pembaruan profil ke Supabase
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setProfileMessage({ type: '', text: '' });

        // Hapus ID, email, dan role dari data yang akan diupdate untuk keamanan
        const { id, email, role, ...updateData } = formData;

        const { data, error } = await supabase.from('profiles').update(updateData).eq('id', user.id).select().single();

        if (error) {
            setProfileMessage({ type: 'error', text: `Gagal memperbarui profil: ${error.message}` });
        } else {
            setProfileMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
            const updatedForm = {
                 ...data,
                main_attraction_types: data.main_attraction_types || [],
                special_area_status: data.special_area_status || [],
                natural_disaster_risks: data.natural_disaster_risks || [],
            };
            setInitialData(updatedForm);
            setFormData(updatedForm);
            setIsEditing(false);
        }
        setLoading(false);
    };

    // Mengubah password pengguna
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (password.length < 6) { setPasswordMessage({ type: 'error', text: 'Password minimal harus 6 karakter.' }); return; }
        if (password !== confirmPassword) { setPasswordMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' }); return; }
        setLoading(true);
        setPasswordMessage({ type: '', text: '' });
        const { error } = await supabase.auth.updateUser({ password: password });
        if (error) { setPasswordMessage({ type: 'error', text: `Gagal mengubah password: ${error.message}` }); }
        else { setPasswordMessage({ type: 'success', text: 'Password berhasil diubah!' }); setPassword(''); setConfirmPassword(''); }
        setLoading(false);
    };

    // Helper komponen untuk menampilkan data
    const ProfileDataItem = ({ label, value }) => (
        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{value || '-'}</dd>
        </div>
    );
    
    // Tampilan Profil (Mode Lihat)
    const renderProfileView = () => {
        if (userRole === 'consultant') {
            return (
                <dl className="divide-y divide-slate-200">
                    <ProfileDataItem label="Nama Lengkap" value={initialData.full_name} />
                    <ProfileDataItem label="Email" value={user.email} />
                </dl>
            );
        }
        return (
            <dl className="divide-y divide-slate-200">
                <ProfileDataItem label="Email" value={user.email} />
                <h4 className="text-lg font-semibold text-slate-800 pt-6 pb-2">Identitas Destinasi</h4>
                <ProfileDataItem label="Nama Destinasi" value={initialData.destination_name} />
                <ProfileDataItem label="Lembaga Pengelola" value={initialData.managing_organization_name} />
                <ProfileDataItem label="Tipe Organisasi" value={initialData.organization_type === 'other' ? initialData.other_organization_type : initialData.organization_type} />
                <ProfileDataItem label="Area Manajemen" value={initialData.management_area === 'other' ? initialData.other_management_area : initialData.management_area} />
                
                <h4 className="text-lg font-semibold text-slate-800 pt-6 pb-2">Profil Destinasi</h4>
                <ProfileDataItem label="Provinsi" value={initialData.admin_province} />
                <ProfileDataItem label="Kabupaten/Kota" value={initialData.admin_regency} />
                <ProfileDataItem label="Kecamatan" value={initialData.admin_district} />
                <ProfileDataItem label="Luas Area (km²)" value={initialData.destination_area_size} />
                <ProfileDataItem label="Jumlah Desa/Kelurahan" value={initialData.village_count} />
                <ProfileDataItem label="Jumlah Populasi" value={initialData.population_count} />
                <ProfileDataItem label="Jumlah Pengunjung (Tahun Lalu)" value={initialData.visitor_count_last_year} />
                
                <h4 className="text-lg font-semibold text-slate-800 pt-6 pb-2">Inventarisasi & Status</h4>
                <ProfileDataItem label="Tipe Atraksi Utama" value={initialData.main_attraction_types?.join(', ')} />
                <ProfileDataItem label="Jumlah Hotel" value={initialData.hotel_count} />
                <ProfileDataItem label="Jumlah Homestay" value={initialData.homestay_count} />
                <ProfileDataItem label="Jumlah Restoran" value={initialData.restaurant_count} />
                <ProfileDataItem label="Jumlah Tour Operator" value={initialData.tour_operator_count} />
                <ProfileDataItem label="Jumlah UMKM" value={initialData.sme_count} />
                
                <h4 className="text-lg font-semibold text-slate-800 pt-6 pb-2">Isu Keberlanjutan</h4>
                <ProfileDataItem label="Status Kawasan Khusus" value={initialData.special_area_status?.join(', ')} />
                <ProfileDataItem label="Risiko Bencana Alam" value={initialData.natural_disaster_risks?.join(', ')} />
                <ProfileDataItem label="Situs Sensitif" value={initialData.sensitive_sites} />
                <ProfileDataItem label="Penggunaan Energi Terbarukan (%)" value={initialData.renewable_energy_usage} />
            </dl>
        );
    };
// Tampilan Form (Mode Edit)
const renderProfileForm = () => {
    // Form untuk konsultan
    if (userRole === 'consultant') {
        return (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                    <input type="text" name="full_name" value={formData.full_name || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                </div>
            </form>
        );
    }

    // Form komprehensif untuk destinasi
    const FormSection = ({ title, children }) => (
        <div className="space-y-4 border-t border-slate-200 pt-6 mt-6 first:mt-0 first:border-t-0 first:pt-0">
            <h4 className="text-lg font-semibold text-slate-800">{title}</h4>
            {children}
        </div>
    );

    const formInputClass = "w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3f545f]";
    const formSelectClass = "w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3f545f]";
    const formTextareaClass = "w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3f545f]";
    const formCheckboxClass = "flex items-center space-x-2";

    return (
        <form onSubmit={handleProfileUpdate}>
            <div className="space-y-6">
                <FormSection title="Identitas Destinasi">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Nama Destinasi Wisata *</label><input type="text" name="destination_name" value={formData.destination_name || ''} onChange={handleChange} required className={formInputClass} /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Nama Lembaga/Organisasi Pengelola *</label><input type="text" name="managing_organization_name" value={formData.managing_organization_name || ''} onChange={handleChange} required className={formInputClass} /></div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Organisasi *</label>
                        <select name="organization_type" value={formData.organization_type || ''} onChange={handleChange} required className={formSelectClass}>
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
                    {formData.organization_type === 'other' && <input type="text" name="other_organization_type" placeholder="Sebutkan tipe organisasi Anda" value={formData.other_organization_type || ''} onChange={handleChange} className={`${formInputClass} mt-2`} />}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Area Manajemen *</label>
                        <select name="management_area" value={formData.management_area || ''} onChange={handleChange} required className={formSelectClass}>
                            <option value="">Pilih Area</option><option>Negara</option><option>Provinsi</option><option>Kabupaten/Kota</option><option>Kawasan/Regional</option><option value="other">Yang lain</option>
                        </select>
                    </div>
                    {formData.management_area === 'other' && <input type="text" name="other_management_area" placeholder="Sebutkan area manajemen Anda" value={formData.other_management_area || ''} onChange={handleChange} className={`${formInputClass} mt-2`} />}
                </FormSection>

                <FormSection title="Profil & Lokasi Destinasi">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Provinsi</label><input type="text" name="admin_province" value={formData.admin_province || ''} onChange={handleChange} className={formInputClass}/></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Kabupaten/Kota</label><input type="text" name="admin_regency" value={formData.admin_regency || ''} onChange={handleChange} className={formInputClass}/></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Kecamatan</label><input type="text" name="admin_district" value={formData.admin_district || ''} onChange={handleChange} className={formInputClass}/></div>
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Luas Area Destinasi (km²)</label><input type="number" min="0" name="destination_area_size" value={formData.destination_area_size || ''} onChange={handleChange} className={formInputClass}/></div>
                    <fieldset>
                        <legend className="block mb-2 text-sm font-medium text-slate-700">Batas Wilayah</legend>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input type="text" name="boundary_north" placeholder="Utara" value={formData.boundary_north || ''} onChange={handleChange} className={formInputClass}/>
                            <input type="text" name="boundary_south" placeholder="Selatan" value={formData.boundary_south || ''} onChange={handleChange} className={formInputClass}/>
                            <input type="text" name="boundary_east" placeholder="Timur" value={formData.boundary_east || ''} onChange={handleChange} className={formInputClass}/>
                            <input type="text" name="boundary_west" placeholder="Barat" value={formData.boundary_west || ''} onChange={handleChange} className={formInputClass}/>
                        </div>
                    </fieldset>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Desa/Kelurahan</label><input type="number" min="0" name="village_count" value={formData.village_count || ''} onChange={handleChange} className={formInputClass}/></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Populasi</label><input type="number" min="0" name="population_count" value={formData.population_count || ''} onChange={handleChange} className={formInputClass}/></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Jml Pengunjung (thn lalu)</label><input type="number" min="0" name="visitor_count_last_year" value={formData.visitor_count_last_year || ''} onChange={handleChange} className={formInputClass}/></div>
                    </div>
                </FormSection>

                <FormSection title="Inventarisasi Aset Pariwisata">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-slate-700">Tipe Atraksi Utama</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {['Alam', 'Budaya', 'Buatan', 'Event', 'Kuliner', 'Wellness'].map(type => (
                                <label key={type} className={formCheckboxClass}><input type="checkbox" name="main_attraction_types" value={type} checked={formData.main_attraction_types.includes(type)} onChange={handleChange} /><span>{type}</span></label>
                            ))}
                            <label className={formCheckboxClass}><input type="checkbox" name="main_attraction_types" value="other" checked={formData.main_attraction_types.includes('other')} onChange={handleChange} /><span>Lainnya</span></label>
                        </div>
                        {formData.main_attraction_types.includes('other') && <input type="text" name="other_main_attraction_type" placeholder="Sebutkan tipe atraksi lain" value={formData.other_main_attraction_type || ''} onChange={handleChange} className={`${formInputClass} mt-2`} />}
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Hotel</label><input type="number" min="0" name="hotel_count" value={formData.hotel_count || ''} onChange={handleChange} className={formInputClass}/></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Homestay</label><input type="number" min="0" name="homestay_count" value={formData.homestay_count || ''} onChange={handleChange} className={formInputClass}/></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Restoran</label><input type="number" min="0" name="restaurant_count" value={formData.restaurant_count || ''} onChange={handleChange} className={formInputClass}/></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Tour Operator</label><input type="number" min="0" name="tour_operator_count" value={formData.tour_operator_count || ''} onChange={handleChange} className={formInputClass}/></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Jumlah UMKM</label><input type="number" min="0" name="sme_count" value={formData.sme_count || ''} onChange={handleChange} className={formInputClass}/></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Jml Entitas Tersertifikasi</label><input type="number" min="0" name="certified_entity_count" value={formData.certified_entity_count || ''} onChange={handleChange} className={formInputClass}/></div>
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Sertifikasi yang Pernah Diikuti</label><input type="text" name="followed_certifications" value={formData.followed_certifications || ''} onChange={handleChange} className={formInputClass}/></div>
                </FormSection>

                <FormSection title="Isu Keberlanjutan">
                     <div>
                        <label className="block mb-1 text-sm font-medium text-slate-700">Status Kawasan Khusus</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {['Taman Nasional', 'Cagar Biosfer', 'Geopark', 'Kawasan Konservasi', 'Situs Warisan Dunia UNESCO'].map(type => (
                                <label key={type} className={formCheckboxClass}><input type="checkbox" name="special_area_status" value={type} checked={formData.special_area_status.includes(type)} onChange={handleChange} /><span>{type}</span></label>
                            ))}
                            <label className={formCheckboxClass}><input type="checkbox" name="special_area_status" value="other" checked={formData.special_area_status.includes('other')} onChange={handleChange} /><span>Lainnya</span></label>
                        </div>
                        {formData.special_area_status.includes('other') && <input type="text" name="other_special_area_status" placeholder="Sebutkan status lain" value={formData.other_special_area_status || ''} onChange={handleChange} className={`${formInputClass} mt-2`} />}
                    </div>
                     <div>
                        <label className="block mb-1 text-sm font-medium text-slate-700">Risiko Bencana Alam</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {['Banjir', 'Tanah Longsor', 'Gempa Bumi', 'Tsunami', 'Kekeringan', 'Letusan Gunung Api'].map(type => (
                                <label key={type} className={formCheckboxClass}><input type="checkbox" name="natural_disaster_risks" value={type} checked={formData.natural_disaster_risks.includes(type)} onChange={handleChange} /><span>{type}</span></label>
                            ))}
                            <label className={formCheckboxClass}><input type="checkbox" name="natural_disaster_risks" value="other" checked={formData.natural_disaster_risks.includes('other')} onChange={handleChange} /><span>Lainnya</span></label>
                        </div>
                         {formData.natural_disaster_risks.includes('other') && <input type="text" name="other_natural_disaster_risk" placeholder="Sebutkan risiko lain" value={formData.other_natural_disaster_risk || ''} onChange={handleChange} className={`${formInputClass} mt-2`} />}
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Situs Sensitif (Alam/Budaya)</label><textarea name="sensitive_sites" value={formData.sensitive_sites || ''} onChange={handleChange} className={formTextareaClass} rows="2"></textarea></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Situs Keagamaan</label><textarea name="religious_sites" value={formData.religious_sites || ''} onChange={handleChange} className={formTextareaClass} rows="2"></textarea></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">KPI yang dimonitor</label><input type="text" name="monitored_kpis" value={formData.monitored_kpis || ''} onChange={handleChange} className={formInputClass}/></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Penggunaan Energi Terbarukan (%)</label><input type="number" min="0" max="100" name="renewable_energy_usage" placeholder="0-100" value={formData.renewable_energy_usage || ''} onChange={handleChange} className={formInputClass}/></div>
                </FormSection>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                <button type="button" onClick={handleCancelEdit} className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Batal</button>
                <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:bg-slate-400" style={{backgroundColor: '#3f545f'}}>
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </div>
        </form>
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
            {profileMessage.text && <p className={`mb-4 text-sm text-center p-2 rounded-lg ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{profileMessage.text}</p>}
            {isEditing ? renderProfileForm() : renderProfileView()}
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md border">
            <h3 className="text-2xl font-bold mb-6 text-slate-800">Ubah Password</h3>
            <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-sm mx-auto">
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