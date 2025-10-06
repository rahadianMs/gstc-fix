"use client";

import { useState } from 'react';

// --- DATA FAKTOR EMISI (diupdate sesuai dokumen) ---

const ELECTRICITY_EMISSION_FACTORS = {
    "Jamali": { city: "Jakarta, Bandung, Surabaya, Semarang", factor: 0.80 },
    "3 Nusa": { city: "Denpasar (Bali)", factor: 0.52 },
    "Sumatera": { city: "Medan, Palembang, Padang, Pekanbaru", factor: 0.77 },
    "Sulselbar": { city: "Makassar", factor: 0.73 },
    "Sulutgo": { city: "Manado", factor: 0.67 },
    "Barito": { city: "Banjarmasin", factor: 1.20 },
    "Khatulistiwa": { city: "Pontianak", factor: 1.67 },
    "Mahakam": { city: "Balikpapan, Samarinda", factor: 1.12 },
    "Jayapura": { city: "Jayapura", factor: 0.50 },
    "Ambon": { city: "Ambon", factor: 0.65 },
    "Batam-Tanjung Pinang": { city: "Batam", factor: 0.76 },
    "Lombok": { city: "Lombok", factor: 1.27 },
    "Sorong": { city: "Sorong", factor: 0.56 },
    "Kendari": { city: "Kendari", factor: 0.87 },
    "Bangka": { city: "Bangka", factor: 1.04 },
    "Belitung": { city: "Belitung", factor: 1.40 },
    "Timor": { city: "Nusa Tenggara Timur (Kupang)", factor: 0.79 },
    "Ternate - Tidore": { city: "Ternate", factor: 0.42 },
    "Kota Bani": { city: "Bengkulu", factor: 0.70 },
    "Buli (Halmahera Timur)": { city: "Maluku Utara (lainnya)", factor: 0.65 }
};

// --- DATA BARU: Faktor Emisi Limbah (kg CO2e / ton) ---
const WASTE_EMISSION_FACTORS = {
    food_waste: { name: 'Limbah makanan & minuman', treatments: { recycled: null, combustion: 6.41061, composting: 8.88386, landfill: 700.20961 } },
    garden_waste: { name: 'Limbah taman', treatments: { recycled: 6.41061, combustion: 6.41061, composting: 8.88386, landfill: 646.60632 } },
    plastic: { name: 'Plastik', treatments: { recycled: 6.41061, combustion: 6.41061, composting: null, landfill: 8.88386 } },
    paper_cardboard: { name: 'Kertas dan Karton', treatments: { recycled: 6.41061, combustion: 6.41061, composting: 8.88386, landfill: 1164.39015 } },
    metal: { name: 'Logam', treatments: { recycled: 6.41061, combustion: 6.41061, composting: null, landfill: 8.88386 } },
    glass: { name: 'Kaca', treatments: { recycled: 6.41061, combustion: 6.41061, composting: null, landfill: 8.88386 } },
    electronics: { name: 'Alat Elektronik', treatments: { recycled: 6.41061, combustion: 6.41061, composting: null, landfill: 8.88386 } },
    fabric: { name: 'Kain', treatments: { recycled: 6.41061, combustion: 6.41061, composting: 496.68303, landfill: null } },
};

const WASTE_TREATMENTS = {
    recycled: 'Didaur ulang',
    combustion: 'Pembakaran untuk energi',
    composting: 'Pengomposan',
    landfill: 'Tempat Pembuangan Akhir (TPA)'
};


const TRANSPORT_EMISSION_FACTORS = {
    diesel: 0.16984, petrol: 0.1645, motorcycle: 0.11367
};

const WEEKS_IN_MONTH = 4.345;

export default function CarbonCalculator({ supabase, user, onReportSubmitted }) {
    const [activeTab, setActiveTab] = useState('electricity');
    const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [calculationResult, setCalculationResult] = useState(null);

    // State untuk Listrik
    const [electricity, setElectricity] = useState({ kwh: '', location: 'Jamali', area: '', occupiedNights: '' });

    // State untuk Transportasi
    const [vehicles, setVehicles] = useState([{ id: Date.now(), type: 'petrol', km: '', frequency: '', quantity: 1 }]);
    
    // --- State Baru untuk Limbah ---
    const [wasteItems, setWasteItems] = useState([{ id: Date.now(), type: 'food_waste', treatment: 'landfill', weight: '' }]);


    // --- Helper Functions ---
    const handleElectricityChange = (field, value) => setElectricity(prev => ({ ...prev, [field]: value }));
    const handleAddVehicle = () => setVehicles([...vehicles, { id: Date.now(), type: 'petrol', km: '', frequency: '', quantity: 1 }]);
    const handleRemoveVehicle = (id) => setVehicles(vehicles.filter(v => v.id !== id));
    const handleVehicleChange = (id, field, value) => setVehicles(vehicles.map(v => v.id === id ? { ...v, [field]: value } : v));
    
    // --- Helper Baru untuk Limbah ---
    const handleAddWasteItem = () => {
        setWasteItems([...wasteItems, { id: Date.now(), type: 'food_waste', treatment: 'landfill', weight: '' }]);
    };
    const handleRemoveWasteItem = (id) => setWasteItems(wasteItems.filter(i => i.id !== id));
    const handleWasteChange = (id, field, value) => {
        setWasteItems(wasteItems.map(item => {
            if (item.id === id) {
                const newItem = { ...item, [field]: value };
                if (field === 'type') {
                    const firstValidTreatment = Object.keys(WASTE_EMISSION_FACTORS[value].treatments).find(
                        key => WASTE_EMISSION_FACTORS[value].treatments[key] !== null
                    );
                    newItem.treatment = firstValidTreatment || '';
                }
                return newItem;
            }
            return item;
        }));
    };

    // --- FUNGSI BARU UNTUK PERBAIKAN BUG ---
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCalculationResult(null); // Membersihkan hasil kalkulasi sebelumnya
        setMessage({ type: '', text: '' }); // Membersihkan pesan sukses/error
    };

    // --- Fungsi utama untuk submit data (diperbarui) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        setCalculationResult(null);

        const { data: existingEntry, error: fetchError } = await supabase
            .from('carbon_entries').select('*').eq('user_id', user.id).eq('report_month', reportMonth).single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            setMessage({ type: 'error', text: `Gagal memeriksa data: ${fetchError.message}` });
            setLoading(false);
            return;
        }

        let newData = existingEntry ? { ...existingEntry } : { user_id: user.id, report_month: reportMonth, electricity_co2e: 0, transport_co2e: 0, waste_co2e: 0 };

        if (activeTab === 'electricity') {
            const kwh = parseFloat(electricity.kwh) || 0;
            const area = parseFloat(electricity.area) || 0;
            const occupiedNights = parseFloat(electricity.occupiedNights) || 0;
            const emissionFactor = ELECTRICITY_EMISSION_FACTORS[electricity.location]?.factor || 0;
            const totalEmission = kwh * emissionFactor;
            const areaIntensity = area > 0 ? totalEmission / area : 0;
            const occupancyIntensity = occupiedNights > 0 ? totalEmission / occupiedNights : 0;
            newData.electricity_co2e = totalEmission;
            newData.electricity_details = { kwh, location: electricity.location, area, occupiedNights, emissionFactor, areaIntensity, occupancyIntensity };
            setCalculationResult({ totalEmission, areaIntensity, occupancyIntensity });

        } else if (activeTab === 'waste') {
            let totalWasteCo2e = 0;
            const detailedWasteItems = wasteItems.map(item => {
                const weight = parseFloat(item.weight) || 0;
                const factor = WASTE_EMISSION_FACTORS[item.type]?.treatments[item.treatment] || 0;
                const emission = weight * factor;
                totalWasteCo2e += emission;
                return { ...item, weight, factor, emission };
            }).filter(item => item.weight > 0);

            const annualProjection = totalWasteCo2e * 12;

            newData.waste_co2e = totalWasteCo2e;
            newData.waste_details = {
                items: detailedWasteItems,
                monthlyTotal: totalWasteCo2e,
                annualProjection: annualProjection
            };

            setCalculationResult({ items: detailedWasteItems, monthlyTotal: totalWasteCo2e, annualProjection });

        } else if (activeTab === 'transport') {
            let totalTransportCo2e = 0;
            vehicles.forEach(v => {
                const km = parseFloat(v.km) || 0;
                const frequency = parseFloat(v.frequency) || 0;
                const quantity = parseInt(v.quantity, 10) || 1;
                totalTransportCo2e += km * (TRANSPORT_EMISSION_FACTORS[v.type] || 0) * frequency * WEEKS_IN_MONTH * quantity;
            });
            newData.transport_co2e = totalTransportCo2e;
            newData.transport_details = vehicles;
        }

        newData.total_co2e_kg = (newData.electricity_co2e || 0) + (newData.transport_co2e || 0) + (newData.waste_co2e || 0);
        const monthDate = new Date(reportMonth + '-02');
        const monthName = monthDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        newData.calculation_title = `Laporan Emisi - ${monthName}`;

        const { error: submissionError } = existingEntry
            ? await supabase.from('carbon_entries').update(newData).eq('id', existingEntry.id)
            : await supabase.from('carbon_entries').insert(newData);

        if (submissionError) {
            setMessage({ type: 'error', text: `Gagal menyimpan laporan: ${submissionError.message}` });
        } else {
            setMessage({ type: 'success', text: `Sukses! Data ${activeTab} untuk ${monthName} telah disimpan.` });
            if (activeTab === 'electricity') setElectricity({ kwh: '', location: 'Jamali', area: '', occupiedNights: '' });
            if (activeTab === 'waste') setWasteItems([{ id: Date.now(), type: 'food_waste', treatment: 'landfill', weight: '' }]);
            if (activeTab === 'transport') setVehicles([{ id: Date.now(), type: 'petrol', km: '', frequency: '', quantity: 1 }]);
            if (onReportSubmitted) onReportSubmitted();
        }
        setLoading(false);
    };

    const renderForm = () => {
        switch (activeTab) {
            case 'electricity':
                return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">1. Lokasi Properti</label>
                            <select id="location" value={electricity.location} onChange={(e) => handleElectricityChange('location', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]">
                                {Object.entries(ELECTRICITY_EMISSION_FACTORS).map(([grid, { city }]) => (
                                    <option key={grid} value={grid}>{city} ({grid})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="electricity-kwh" className="block text-sm font-medium text-slate-700 mb-1">2. Total Konsumsi Listrik dari PLN</label>
                            <div className="relative">
                                <input type="number" id="electricity-kwh" value={electricity.kwh} onChange={(e) => handleElectricityChange('kwh', e.target.value)} placeholder="e.g., 1500000" required className="w-full pl-4 pr-12 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]" />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500">kWh</span>
                            </div>
                             <p className="text-xs text-slate-500 mt-1">Masukkan total pemakaian listrik dari tagihan PLN Anda.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="area" className="block text-sm font-medium text-slate-700 mb-1">3. Total Luas Bangunan</label>
                                <div className="relative">
                                     <input type="number" id="area" value={electricity.area} onChange={(e) => handleElectricityChange('area', e.target.value)} placeholder="e.g., 12000" required className="w-full pl-4 pr-12 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]" />
                                     <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500">m²</span>
                                </div>
                                 <p className="text-xs text-slate-500 mt-1">Total luas lantai yang menggunakan listrik.</p>
                            </div>
                            <div>
                                <label htmlFor="occupiedNights" className="block text-sm font-medium text-slate-700 mb-1">4. Total Malam Kamar Terokupansi</label>
                                <input type="number" id="occupiedNights" value={electricity.occupiedNights} onChange={(e) => handleElectricityChange('occupiedNights', e.target.value)} placeholder="e.g., 60000" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]" />
                                <p className="text-xs text-slate-500 mt-1">Jumlah total kamar yang terjual/terisi.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'transport':
                return (
                    <div className="space-y-4">
                        {vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end p-4 border rounded-lg bg-slate-50">
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Jenis Kendaraan</label>
                                    <select value={vehicle.type} onChange={(e) => handleVehicleChange(vehicle.id, 'type', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm">
                                        <option value="petrol">Mobil Bensin</option>
                                        <option value="diesel">Mobil Diesel</option>
                                        <option value="motorcycle">Motor</option>
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Jarak Tempuh</label>
                                    <input type="number" placeholder="0" value={vehicle.km} onChange={(e) => handleVehicleChange(vehicle.id, 'km', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                                     <span className="text-xs text-slate-500">km / penggunaan</span>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Frekuensi</label>
                                    <input type="number" placeholder="0" value={vehicle.frequency} onChange={(e) => handleVehicleChange(vehicle.id, 'frequency', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                                     <span className="text-xs text-slate-500">Total penggunaan/minggu</span>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Jumlah</label>
                                    <input type="number" placeholder="1" min="1" value={vehicle.quantity} onChange={(e) => handleVehicleChange(vehicle.id, 'quantity', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                                     <span className="text-xs text-slate-500">unit</span>
                                </div>
                                <div className="col-span-2 md:col-span-1 flex justify-end">
                                    {vehicles.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveVehicle(vehicle.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Hapus</button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddVehicle} className="w-full py-2 text-sm font-semibold text-[#348567] border-2 border-[#348567] rounded-lg hover:bg-emerald-50 transition-colors">
                            + Tambahkan Kendaraan
                        </button>
                    </div>
                );
            case 'waste':
                return (
                    <div className="space-y-4">
                        {wasteItems.map((item) => {
                            const availableTreatments = WASTE_EMISSION_FACTORS[item.type]?.treatments || {};
                            return (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-lg bg-slate-50">
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Tipe Limbah</label>
                                        <select value={item.type} onChange={(e) => handleWasteChange(item.id, 'type', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm">
                                            {Object.entries(WASTE_EMISSION_FACTORS).map(([key, { name }]) => (
                                                <option key={key} value={key}>{name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Tipe Pengolahan</label>
                                        <select value={item.treatment} onChange={(e) => handleWasteChange(item.id, 'treatment', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm">
                                            {Object.entries(WASTE_TREATMENTS).map(([key, name]) => (
                                                <option key={key} value={key} disabled={availableTreatments[key] === null}>
                                                    {name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Jumlah Limbah</label>
                                        <div className="relative">
                                            <input type="number" placeholder="e.g., 2.5" value={item.weight} onChange={(e) => handleWasteChange(item.id, 'weight', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm pr-10" />
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-500">ton</span>
                                        </div>
                                    </div>
                                    <div className="md:col-span-1 flex justify-end">
                                        {wasteItems.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveWasteItem(item.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Hapus</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <button type="button" onClick={handleAddWasteItem} className="w-full py-2 text-sm font-semibold text-[#348567] border-2 border-[#348567] rounded-lg hover:bg-emerald-50 transition-colors">
                            + Tambah Jenis Limbah
                        </button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-md border">
            <h2 className="text-2xl font-bold mb-6">Input Laporan Emisi</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label htmlFor="reportMonth" className="block text-sm font-medium text-slate-700 mb-1">Periode Laporan</label>
                    <input type="month" id="reportMonth" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="w-full md:w-1/2 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]" required />
                </div>
                <div className="mb-6">
                    <div className="flex border-b border-slate-200">
                        {/* --- PERUBAHAN DI SINI: Menggunakan handleTabChange --- */}
                        <button type="button" onClick={() => handleTabChange('electricity')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'electricity' ? 'border-b-2 border-[#348567] text-[#348567]' : 'text-slate-500'}`}>Listrik</button>
                        <button type="button" onClick={() => handleTabChange('transport')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'transport' ? 'border-b-2 border-[#348567] text-[#348567]' : 'text-slate-500'}`}>Transportasi</button>
                        <button type="button" onClick={() => handleTabChange('waste')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'waste' ? 'border-b-2 border-[#348567] text-[#348567]' : 'text-slate-500'}`}>Limbah</button>
                    </div>
                </div>
                <div className="min-h-[200px] mb-6">
                    {renderForm()}
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 text-base font-semibold text-white bg-[#348567] rounded-lg hover:bg-[#2A6A52] transition-colors disabled:bg-slate-400">
                    {loading ? 'Menyimpan...' : `Simpan Laporan ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                </button>
            </form>

            {message.text && (<p className={`mt-4 text-sm text-center p-3 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{message.text}</p>)}

            {calculationResult && activeTab === 'electricity' && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <h3 className="font-bold text-lg text-emerald-800 mb-2">Hasil Analisis Jejak Karbon Listrik</h3>
                    <div className="space-y-2 text-sm text-slate-700">
                        <p><strong>Total Emisi dari Listrik:</strong> <span className="font-semibold text-emerald-700">{calculationResult.totalEmission.toFixed(2)} kg CO₂e</span></p>
                        <hr className="my-2"/>
                        <p className="font-semibold">Intensitas Karbon Properti Anda:</p>
                        <ul className="list-disc list-inside pl-2">
                           <li><span className="font-semibold">{calculationResult.areaIntensity.toFixed(2)}</span> kg CO₂e/m²/periode (berdasarkan luas area)</li>
                           <li><span className="font-semibold">{calculationResult.occupancyIntensity.toFixed(2)}</span> kg CO₂e per kamar terisi (berdasarkan hunian)</li>
                        </ul>
                    </div>
                </div>
            )}
            
            {calculationResult && activeTab === 'waste' && (
                 <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <h3 className="font-bold text-lg text-emerald-800 mb-2">Hasil Analisis Jejak Karbon dari Limbah</h3>
                    <div className="space-y-3 text-sm text-slate-700">
                        <div>
                            <p><strong>Total Emisi Bulan Ini:</strong></p> 
                            <p className="font-bold text-xl text-emerald-700">{calculationResult.monthlyTotal.toFixed(2)} kg CO₂e</p>
                        </div>
                        <hr/>
                        <div>
                            <p className="font-semibold">Rincian Emisi per Jenis Limbah:</p>
                            <ul className="list-disc list-inside pl-2 mt-1 space-y-1">
                                {calculationResult.items.map(item => (
                                    <li key={item.id}>
                                        {WASTE_EMISSION_FACTORS[item.type].name} ({WASTE_TREATMENTS[item.treatment]}): <span className="font-semibold">{item.emission.toFixed(2)} kg CO₂e</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                         <hr/>
                        <div>
                             <p><strong>Proyeksi Emisi Tahunan dari Limbah:</strong></p>
                             <p className="font-bold text-xl text-emerald-700">{calculationResult.annualProjection.toFixed(2)} kg CO₂e</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}