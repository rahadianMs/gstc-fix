"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_CONFIG = {
    electricity_co2e: { name: 'Listrik', color: '#FBBF24' },
    transport_co2e: { name: 'Transportasi', color: '#60A5FA' },
    waste_co2e: { name: 'Sampah', color: '#F87171' },
};
const GREY_COLOR = '#E5E7EB';

const LineChart = ({ data, zoomCategory, maxValue }) => {
    const width = 500;
    const height = 200;
    const padding = 40;

    const getY = (value) => height - padding - (value / maxValue) * (height - padding * 1.5);
    const getX = (index) => padding + index * (width - padding * 2) / (data.length - 1 || 1);
    
    const springTransition = { type: 'spring', stiffness: 400, damping: 40 };

    return (
        <motion.svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" animate={{ height: height }} transition={springTransition}>
            {/* Sumbu Y dan Garis Grid */}
            <AnimatePresence>
                {[...Array(5)].map((_, i) => {
                    const value = (maxValue / 4) * i;
                    const y = getY(value);
                    return (
                        <motion.g 
                            key={`grid-${i}-${maxValue}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                        >
                            <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="#F1F5F9" strokeDasharray="2,4" />
                            <text x={padding - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-slate-400">{value.toFixed(0)}</text>
                        </motion.g>
                    );
                })}
            </AnimatePresence>

            {/* Sumbu X */}
            {data.map((d, i) => (
                <text key={d.month} x={getX(i)} y={height - padding + 15} textAnchor="middle" className="text-xs font-semibold fill-slate-600">
                    {d.month}
                </text>
            ))}

            {/* Garis Grafik */}
            {Object.keys(CATEGORY_CONFIG).map(categoryKey => {
                const isZoomed = zoomCategory === categoryKey;
                const isVisible = !zoomCategory || isZoomed;
                const color = isVisible ? CATEGORY_CONFIG[categoryKey].color : GREY_COLOR;

                const pathData = data.map((d, i) => {
                    const value = d.segments.find(s => s.key === categoryKey)?.value || 0;
                    return `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(value)}`;
                }).join(' ');
                
                return (
                    <motion.g 
                        key={categoryKey}
                        animate={{ opacity: isVisible ? 1 : 0.25 }}
                        transition={springTransition}
                    >
                        {/* --- PERUBAHAN ANIMASI UTAMA DI SINI --- */}
                        <motion.path 
                            initial={{ pathLength: 0 }} // Mulai dari 0 (tidak terlihat)
                            animate={{ 
                                pathLength: 1, // Animasikan hingga 1 (tergambar penuh)
                                d: pathData, 
                                stroke: color, 
                                strokeWidth: isZoomed || !zoomCategory ? 3 : 1.5 
                            }}
                            transition={{
                                pathLength: { duration: 1.5, ease: "easeInOut" }, // Animasi menggambar
                                default: springTransition // Animasi untuk zoom/rescale
                            }}
                            fill="none" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                        />
                        {data.map((d, i) => {
                             const value = d.segments.find(s => s.key === categoryKey)?.value || 0;
                             return (
                                <motion.circle 
                                    key={i}
                                    cx={getX(i)} 
                                    initial={{ cy: height, r: 0 }}
                                    animate={{ 
                                        cy: getY(value), 
                                        fill: color, 
                                        r: isZoomed || !zoomCategory ? 4.5 : 2 
                                    }}
                                    transition={springTransition}
                                >
                                   <title>{`${CATEGORY_CONFIG[categoryKey].name}: ${value.toFixed(2)} kg CO₂e`}</title>
                                </motion.circle>
                             )
                        })}
                    </motion.g>
                );
            })}
        </motion.svg>
    );
};

// ... Sisa komponen DashboardTrends tetap sama ...
export default function DashboardTrends({ supabase, user, dataVersion }) {
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [zoomCategory, setZoomCategory] = useState(null);

    useEffect(() => {
        const fetchTrendData = async () => {
             if (!user) return;
            setLoading(true);
            try {
                const { data } = await supabase
                    .from('carbon_entries').select('report_month, electricity_co2e, transport_co2e, waste_co2e')
                    .eq('user_id', user.id).order('report_month', { ascending: true });

                const groupedData = data.reduce((acc, entry) => {
                    const month = entry.report_month;
                    if (!acc[month]) acc[month] = { electricity_co2e: 0, transport_co2e: 0, waste_co2e: 0 };
                    acc[month].electricity_co2e += entry.electricity_co2e || 0;
                    acc[month].transport_co2e += entry.transport_co2e || 0;
                    acc[month].waste_co2e += entry.waste_co2e || 0;
                    return acc;
                }, {});
                
                const formattedData = Object.entries(groupedData).map(([monthStr, values]) => ({
                    month: new Date(monthStr + '-02').toLocaleString('id-ID', { month: 'short', year: '2-digit' }),
                    segments: Object.keys(CATEGORY_CONFIG).map(key => ({ key, value: values[key] })),
                })).slice(-6);

                setMonthlyData(formattedData);
            } catch (err) {
                 setError(`Gagal memuat tren: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchTrendData();
    }, [user, supabase, dataVersion]);

    const handleLegendClick = (key) => {
        setZoomCategory(prevZoom => (prevZoom === key ? null : key));
    };

    if (loading) return <div className="h-80 w-full bg-slate-200 rounded-xl animate-pulse"></div>;
    if (error) return <div className="text-center p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>;
    if (monthlyData.length < 2) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border h-full flex flex-col justify-center">
                <h3 className="text-xl font-bold mb-2">Tren Emisi per Bulan</h3>
                <p className="text-slate-500">Butuh lebih banyak data (minimal 2 bulan) untuk menampilkan grafik tren.</p>
            </div>
        );
    }
    
    let maxValue;
    if (zoomCategory) {
        maxValue = Math.max(...monthlyData.map(d => d.segments.find(s => s.key === zoomCategory)?.value || 0));
    } else {
        maxValue = Math.max(...monthlyData.flatMap(d => d.segments.map(s => s.value)));
    }
    maxValue = Math.max(maxValue * 1.2, 100);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-bold mb-2">Tren Emisi per Bulan (6 Bulan Terakhir)</h3>
            <div className="w-full">
                <LineChart data={monthlyData} zoomCategory={zoomCategory} maxValue={maxValue} />
            </div>
             <div className="flex justify-center gap-4 mt-2 text-sm">
                {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => {
                    const isZoomed = zoomCategory === key;
                    const isActive = !zoomCategory || isZoomed;
                    return (
                        <button 
                            key={key} 
                            onClick={() => handleLegendClick(key)}
                            className={`flex items-center gap-2 p-1 rounded-md transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                        >
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: isActive ? cat.color : GREY_COLOR}}></div>
                            <span className="text-slate-600">{cat.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}