-----

# Wonderful Indonesia Net Zero Hub (WINZ Hub)

**Wonderful Indonesia Net Zero Hub (WINZ Hub)** adalah platform online nasional yang dirancang untuk membantu bisnis di sektor pariwisata Indonesia dalam mengukur, melaporkan, dan mengurangi jejak karbon mereka. Proyek ini merupakan inisiatif dari Kementerian Pariwisata dan Ekonomi Kreatif/Badan Pariwisata dan Ekonomi Kreatif Republik Indonesia untuk mendukung komitmen Indonesia dalam **Deklarasi Glasgow tentang Aksi Iklim di Sektor Pariwisata**.

## ✨ Fitur Utama

  - **Kalkulator Jejak Karbon**: Hitung emisi dari berbagai sumber, termasuk penggunaan listrik, transportasi, dan pengelolaan limbah.
  - **Dasbor Interaktif**: Pantau dan analisis data emisi dari waktu ke waktu melalui dasbor yang mudah digunakan.
  - **Pelaporan & Analisis**: Hasilkan laporan emisi dalam format PDF dan lihat riwayat laporan Anda.
  - **Pusat Pembelajaran**: Akses materi edukasi, studi kasus, dan panduan praktik terbaik untuk pariwisata berkelanjutan.
  - **Sertifikasi**: Dapatkan sertifikat apresiasi sebagai pengakuan atas komitmen Anda terhadap pariwisata ramah lingkungan.

## 🚀 Teknologi yang Digunakan

  - **Framework**: [Next.js](https://nextjs.org/)
  - **Bahasa**: JavaScript (dengan JSX)
  - **Styling**: [Tailwind CSS](https://tailwindcss.com/)
  - **Backend & Database**: [Supabase](https://supabase.io/)
  - **Animasi**: [Framer Motion](https://www.framer.com/motion/)
  - **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)

## 📂 Struktur Proyek

```
/app
|-- /components     # Komponen React yang dapat digunakan kembali
|-- /lib            # Fungsi bantuan (misalnya, untuk menghasilkan PDF)
|-- layout.js       # Layout utama aplikasi
|-- page.jsx        # Halaman utama aplikasi
/public             # Aset statis (gambar, ikon, dll.)
/...
```

## 🛠️ Memulai

### Prasyarat

  - Node.js (versi 20.x direkomendasikan)
  - npm, yarn, atau pnpm

### Instalasi

1.  Clone repositori ini:
    ```bash
    git clone https://github.com/rahadianms/osp-nextjs.git
    ```
2.  Masuk ke direktori proyek:
    ```bash
    cd osp-nextjs
    ```
3.  Instal dependensi:
    ```bash
    npm install
    ```

### Menjalankan Server Pengembangan

Untuk menjalankan server pengembangan secara lokal, gunakan perintah berikut:

```bash
npm run dev
```

Buka [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) di browser Anda untuk melihat hasilnya.

## 📄 Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](https://choosealicense.com/licenses/mit/).
