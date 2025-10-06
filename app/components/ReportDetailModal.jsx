"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { generatePdf } from '../lib/generatePdf';

// --- Data Konstanta untuk Nama Tampilan ---
const WASTE_EMISSION_FACTORS = {
    food_waste: { name: 'Limbah makanan & minuman' },
    garden_waste: { name: 'Limbah taman' },
    plastic: { name: 'Plastik' },
    paper_cardboard: { name: 'Kertas dan Karton' },
    metal: { name: 'Logam' },
    glass: { name: 'Kaca' },
    electronics: { name: 'Alat Elektronik' },
    fabric: { name: 'Kain' },
};
const WASTE_TREATMENTS = {
    recycled: 'Didaur ulang',
    combustion: 'Pembakaran u/ energi',
    composting: 'Pengomposan',
    landfill: 'TPA'
};

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;

const formatName = (type, category) => {
    const names = {
        transport: { petrol: 'Mobil Bensin', diesel: 'Mobil Diesel', motorcycle: 'Motor' }
    };
    return names[category]?.[type] || type;
};

export default function ReportDetailModal({ entry, onClose, onDelete }) {
    const [isDownloading, setIsDownloading] = useState(false);
    if (!entry) return null;

    const handleDownload = async () => {
        setIsDownloading(true);
        const businessName = entry.user?.user_metadata?.business_name || "Nama Usaha";
        await generatePdf(entry, businessName);
        setIsDownloading(false);
    };

    // Helper untuk render detail limbah
    const renderWasteDetails = (details) => {
        // Cek struktur lama (array) vs struktur baru (objek)
        if (Array.isArray(details)) { // Struktur lama
            return (
                <ul className="space-y-1 text-sm text-slate-600">
                    {details.map(item => (
                        <li key={item.id} className="flex justify-between items-center border-t pt-2 first:border-t-0">
                            <span>{item.type}</span>
                            <span className="font-semibold">{item.weight} kg</span>
                        </li>
                    ))}
                </ul>
            );
        } else if (details && details.items) { // Struktur baru
            return (
                 <ul className="space-y-2 text-sm text-slate-600">
                    <li className="grid grid-cols-3 gap-2 font-semibold text-xs text-slate-500">
                        <span>Jenis Limbah</span>
                        <span className="text-center">Pengolahan</span>
                        <span className="text-right">Emisi (kg CO₂e)</span>
                    </li>
                    {details.items.map(item => (
                        <li key={item.id} className="grid grid-cols-3 gap-2 border-t pt-2">
                            <span>{WASTE_EMISSION_FACTORS[item.type]?.name || item.type} ({item.weight} ton)</span>
                            <span className="text-center">{WASTE_TREATMENTS[item.treatment] || item.treatment}</span>
                            <span className="text-right font-semibold">{item.emission.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            );
        }
        return null;
    };


    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Detail Laporan</h2>
                        <p className="text-slate-500">{entry.calculation_title || 'Laporan tanpa judul'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"><CloseIcon /></button>
                </header>

                <main className="flex-1 p-6 overflow-y-auto space-y-6">
                    <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-emerald-700">Total Emisi Bulan Ini</p>
                        <p className="text-3xl font-extrabold text-emerald-800">{entry.total_co2e_kg.toFixed(2)} <span className="text-xl font-medium">kg CO₂e</span></p>
                    </div>

                    <div className="space-y-4">
                        {entry.electricity_details && entry.electricity_co2e > 0 && (
                             <div className="border border-slate-200 p-4 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                     <h3 className="font-bold text-lg text-slate-700">Listrik</h3>
                                     <p className="font-bold text-lg text-slate-600">{entry.electricity_co2e.toFixed(2)} kg CO₂e</p>
                                </div>
                                <div className="text-sm text-slate-600 space-y-1 border-t pt-2">
                                    <p><strong>Konsumsi:</strong> <span className="font-semibold">{entry.electricity_details.kwh || 0} kWh</span></p>
                                    <p><strong>Lokasi (Grid):</strong> <span className="font-semibold">{entry.electricity_details.location}</span></p>
                                    {entry.electricity_details.areaIntensity !== undefined && ( <p><strong>Intensitas Area:</strong> <span className="font-semibold">{entry.electricity_details.areaIntensity.toFixed(2)}</span> kg CO₂e/m²</p>)}
                                    {entry.electricity_details.occupancyIntensity !== undefined && ( <p><strong>Intensitas Hunian:</strong> <span className="font-semibold">{entry.electricity_details.occupancyIntensity.toFixed(2)}</span> kg CO₂e/kamar terisi</p>)}
                                </div>
                            </div>
                        )}
                        
                        {entry.transport_details && entry.transport_details.length > 0 && entry.transport_co2e > 0 && (
                            <div className="border border-slate-200 p-4 rounded-lg">
                                <h3 className="font-bold text-lg text-slate-700 mb-2">Transportasi ({entry.transport_co2e.toFixed(2)} kg CO₂e)</h3>
                                 <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="grid grid-cols-3 gap-2 font-semibold text-xs text-slate-500">
                                        <span>Kendaraan (Jml)</span>
                                        <span className="text-center">Jarak</span>
                                        <span className="text-center">Frekuensi</span>
                                    </li>
                                    {entry.transport_details.map(v => (
                                        <li key={v.id} className="grid grid-cols-3 gap-2 border-t pt-2">
                                            <span>{formatName(v.type, 'transport')} (x{v.quantity})</span>
                                            <span className="text-center">{v.km} km</span>
                                            <span className="text-center">{v.frequency}x / minggu</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* --- Tampilan Detail Limbah Diperbarui --- */}
                        {entry.waste_details && entry.waste_co2e > 0 && (
                           <div className="border border-slate-200 p-4 rounded-lg">
                                <h3 className="font-bold text-lg text-slate-700 mb-2">Limbah ({entry.waste_co2e.toFixed(2)} kg CO₂e)</h3>
                                {renderWasteDetails(entry.waste_details)}
                            </div>
                        )}
                    </div>
                </main>

                <footer className="flex justify-between items-center p-6 bg-slate-50 border-t border-slate-200 rounded-b-2xl">
                    <button onClick={() => onDelete(entry)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200"><TrashIcon /> Hapus Laporan</button>
                    <div className="flex gap-4">
                        <button onClick={handleDownload} disabled={isDownloading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 disabled:bg-slate-200 disabled:text-slate-500"><DownloadIcon /> {isDownloading ? 'Membuat PDF...' : 'Download PDF'}</button>
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">Tutup</button>
                    </div>
                </footer>
            </motion.div>
        </motion.div>
    );
}