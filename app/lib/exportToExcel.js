// app/lib/exportToExcel.js
import * as XLSX from 'xlsx';

export function exportToExcel(data, fileName) {
  // Membuat worksheet dari array of objects
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Mengatur lebar kolom agar lebih mudah dibaca
  const columnWidths = [
    { wch: 20 }, // report_type
    { wch: 10 }, // pillar
    { wch: 15 }, // criterion_code
    { wch: 40 }, // criterion_title
    { wch: 50 }, // indicator_text
    { wch: 30 }, // status_or_score
    { wch: 50 }, // evidence_links
    { wch: 50 }, // consultant_comment
  ];
  worksheet['!cols'] = columnWidths;

  // Membuat workbook baru dan menambahkan worksheet ke dalamnya
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Destinasi');

  // Membuat dan memicu unduhan file Excel
  // Nama file akan menjadi 'Laporan - Nama Destinasi.xlsx'
  XLSX.writeFile(workbook, `Laporan - ${fileName}.xlsx`);
}