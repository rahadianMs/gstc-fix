import jsPDF from 'jspdf';

// Fungsi untuk membuat nomor sertifikat dinamis
const generateCertNumber = () => {
    const date = new Date();
    const ddmmyyyy = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear()}`;
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${randomChars}-${ddmmyyyy}`;
};

// Fungsi utama untuk generate PDF Sertifikat
export const generateCertificatePdf = async (businessName) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // --- 1. MENGGAMBAR ELEMEN DESAIN ---
    doc.setFillColor(0, 167, 157); // #00A79D
    doc.rect(0, 0, 18, pageHeight, 'F');

    doc.setFillColor(224, 242, 241); // #E0F2F1
    doc.rect(18, 0, pageWidth - 18, 35, 'F');

    // --- 2. MENAMBAHKAN LOGO ---
    try {
        const logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.png';
        const img = new Image();
        img.crossOrigin = "Anonymous";
        
        await new Promise((resolve, reject) => {
            img.onload = () => {
                // --- PERUBAHAN: Menggunakan kompresi 'FAST' untuk ukuran file lebih kecil ---
                doc.addImage(img, 'PNG', pageWidth - 20 - 28, 18, 28, 28, undefined, 'FAST');
                resolve();
            };
            img.onerror = reject;
            img.src = logoUrl;
        });
    } catch (error) {
        console.error("Gagal memuat logo:", error);
    }
    
    // --- 3. MENAMBAHKAN TEKS SERTIFIKAT ---
    const contentStartX = 30;
    let currentY = 70;
    
    doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(100, 116, 139); // slate-500
    doc.text(`Nomor Sertifikat: ${generateCertNumber()}`, contentStartX, currentY);
    currentY += 20;

    doc.setFontSize(22).setFont('helvetica', 'bold').setTextColor(0, 105, 92); // #00695C
    doc.text('DEKARBONISASI PARIWISATA', contentStartX, currentY);
    currentY += 12;
    
    doc.setFontSize(32).setFont('helvetica', 'bold').setTextColor(30, 41, 59); // slate-800
    doc.text('SERTIFIKAT APRESIASI', contentStartX, currentY);
    currentY += 25;

    doc.setFontSize(12).setFont('helvetica', 'normal').setTextColor(71, 85, 105); // slate-600
    doc.text('Sertifikat ini dengan bangga diberikan kepada', contentStartX, currentY);
    currentY += 18;

    doc.setFontSize(26).setFont('helvetica', 'bold').setTextColor(15, 23, 42); // slate-900
    doc.text(businessName, contentStartX, currentY);
    currentY += 18;

    const description = doc.splitTextToSize(
        "atas komitmennya terhadap keberlanjutan dengan mengukur jejak karbonnya. Dedikasi Anda berkontribusi untuk masa depan yang lebih hijau dan mendukung perjalanan Indonesia menuju Pariwisata Net Zero.",
        pageWidth - contentStartX - 20
    );
    doc.setFontSize(11).setFont('helvetica', 'normal').setTextColor(71, 85, 105); // slate-600
    doc.text(description, contentStartX, currentY);
    
    doc.setFontSize(10).setTextColor(100, 116, 139); // slate-500
    doc.text("Terima kasih telah menjadi bagian yang bertanggung jawab dari pariwisata berkelanjutan.", contentStartX, pageHeight - 30);

    // --- 4. SIMPAN DOKUMEN ---
    doc.save(`Sertifikat_Apresiasi_${businessName.replace(/\s+/g, '_')}.pdf`);
};