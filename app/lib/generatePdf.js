import jsPDF from 'jspdf';

// Helper untuk format nama
const formatName = (type, category) => {
    const names = {
        transport: { petrol: 'Mobil Bensin', diesel: 'Mobil Diesel', motorcycle: 'Motor' },
        waste: { 
            food_waste: 'Limbah Makanan',
            garden_waste: 'Limbah Taman',
            plastic: 'Plastik',
            paper_cardboard: 'Kertas & Karton',
            metal: 'Logam',
            glass: 'Kaca',
            electronics: 'Alat Elektronik',
            fabric: 'Kain'
        }
    };
    return names[category]?.[type] || type;
};

// Fungsi utama untuk generate PDF
export const generatePdf = async (entry, businessName = 'Nama Usaha Belum Diatur') => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let currentY = 20;

    // --- 1. KOP SURAT (HEADER) ---
    try {
        const logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.png';
        const img = await fetch(logoUrl);
        const blob = await img.blob();
        const reader = new FileReader();
        
        await new Promise((resolve, reject) => {
            reader.onload = (e) => {
                doc.addImage(e.target.result, 'JPEG', margin, 12, 18, 18, undefined, 'MEDIUM');
                resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

    } catch (error) {
        console.error("Gagal memuat logo:", error);
    }
    
    doc.setFontSize(14).setFont('helvetica', 'bold');
    doc.text('LAPORAN JEJAK KARBON', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(10).setFont('helvetica', 'normal');
    doc.text('Indonesia Tourism Carbon Track & Reporting', pageWidth / 2, 24, { align: 'center' });
    
    doc.setDrawColor(220);
    doc.line(margin, 35, pageWidth - margin, 35);
    
    currentY = 45;

    // --- 2. INFORMASI DOKUMEN ---
    doc.setFontSize(11).setFont('helvetica', 'bold');
    doc.text('Informasi Laporan', margin, currentY);
    currentY += 7;

    doc.setFontSize(10).setFont('helvetica', 'normal');
    doc.text(`Periode Laporan: ${entry.calculation_title.replace('Laporan Emisi - ', '')}`, margin, currentY);
    currentY += 6;
    doc.text(`Nama Usaha: ${businessName}`, margin, currentY);
    currentY += 6;
    doc.text(`Tanggal Dibuat: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, currentY);
    currentY += 12;

    // --- 3. RINGKASAN TOTAL EMISI ---
    doc.setFillColor(236, 253, 245);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 16, 'F');
    
    doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor(2, 44, 34);
    doc.text('Total Estimasi Emisi Karbon', margin + 4, currentY + 9);
    
    doc.setFontSize(14).setFont('helvetica', 'bold');
    doc.text(`${(entry.total_co2e_kg || 0).toFixed(2)} kg CO2e`, pageWidth - margin - 4, currentY + 10, { align: 'right' });
    currentY += 26;

    // --- 4. DETAIL PER KATEGORI ---
    doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(0, 0, 0);
    doc.text('Rincian Emisi per Kategori', margin, currentY);
    currentY += 7;

    const detailFontSize = 9;
    
    if (entry.electricity_co2e > 0 && entry.electricity_details) {
        doc.setFontSize(detailFontSize).setFont('helvetica', 'bold');
        doc.text(`• Listrik: ${entry.electricity_co2e.toFixed(2)} kg CO2e`, margin, currentY);
        currentY += 5;
        doc.setFont('helvetica', 'normal');
        doc.text(`  - Konsumsi: ${entry.electricity_details.kwh} kWh`, margin + 3, currentY);
        currentY += 7;
    }

    if (entry.transport_co2e > 0 && entry.transport_details) {
        doc.setFontSize(detailFontSize).setFont('helvetica', 'bold');
        doc.text(`• Transportasi: ${entry.transport_co2e.toFixed(2)} kg CO2e`, margin, currentY);
        currentY += 5;
        doc.setFont('helvetica', 'normal');
        entry.transport_details.forEach(v => {
            doc.text(`  - ${formatName(v.type, 'transport')} (x${v.quantity || 1}): ${v.km} km, ${v.frequency}x / minggu`, margin + 3, currentY);
            currentY += 5;
        });
        currentY += 2;
    }

    // --- PERBAIKAN DI SINI ---
    if (entry.waste_co2e > 0 && entry.waste_details) {
        doc.setFontSize(detailFontSize).setFont('helvetica', 'bold');
        doc.text(`• Sampah: ${entry.waste_co2e.toFixed(2)} kg CO2e`, margin, currentY);
        currentY += 5;
        doc.setFont('helvetica', 'normal');
        
        // Cek struktur baru (objek dengan properti 'items')
        if (entry.waste_details.items && Array.isArray(entry.waste_details.items)) {
            entry.waste_details.items.forEach(item => {
                doc.text(`  - ${formatName(item.type, 'waste')}: ${item.weight} ton`, margin + 3, currentY);
                currentY += 5;
            });
        } 
        // Fallback untuk struktur lama (array)
        else if (Array.isArray(entry.waste_details)) {
            entry.waste_details.forEach(item => {
                doc.text(`  - ${formatName(item.type, 'waste')}: ${item.weight} kg`, margin + 3, currentY);
                currentY += 5;
            });
        }
        currentY += 2;
    }


    // --- 5. FOOTER ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8).setTextColor(150);
        doc.text(
            `Halaman ${i} dari ${pageCount} | Dokumen ini dibuat secara otomatis oleh sistem Indonesia Tourism Carbon Track & Reporting.`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    // --- 6. SIMPAN DOKUMEN ---
    const fileName = `Laporan_Emisi_${entry.calculation_title.replace('Laporan Emisi - ', '').replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
};