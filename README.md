
-----

```markdown
# GSTC Self Assistant

**GSTC Self Assistant** adalah platform web terpusat yang dirancang untuk memfasilitasi dan menyederhanakan proses sertifikasi pariwisata berkelanjutan yang berbasis pada standar **Global Sustainable Tourism Council (GSTC)**. Tujuan utamanya adalah menjadi sumber data tunggal (*single source of truth*) bagi komunikasi, pengumpulan bukti, dan pemantauan progres antara Konsultan (Admin) dan Pemilik Destinasi (User).

---

## ✨ Fitur Utama

-   **Manajemen Peran Ganda:** Sistem membedakan antara **Pemilik Destinasi** yang mengajukan sertifikasi dan **Konsultan** yang melakukan review.
-   **Dasbor Dinamis:** Tampilan dasbor yang berbeda untuk setiap peran, memastikan pengalaman pengguna yang relevan.
-   **Pengajuan Bukti per Indikator:** Pengguna dapat mengunggah tautan bukti (misalnya, Google Drive) untuk setiap sub-indikator dari kriteria GSTC.
-   **Alur Kerja Status:** Sistem pelacakan status yang jelas untuk setiap bukti (`To Do`, `In Progress`, `In Review`, `Done`, `Rejected`).
-   **Dasbor Review Konsultan:** Antarmuka khusus bagi konsultan untuk mereview bukti, memberikan komentar, dan menyetujui atau menolak ajuan.
-   **Visualisasi Progres:** Progress bar dinamis yang secara visual menampilkan kemajuan kepatuhan per pilar dan per sub-seksi.
-   **Fitur Diskusi:** Ruang komunikasi terintegrasi per kriteria untuk interaksi langsung antara destinasi dan konsultan.

## 🚀 Teknologi yang Digunakan

-   **Framework**: [Next.js](https://nextjs.org/) (dengan App Router)
-   **Bahasa**: JavaScript (dengan JSX)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Backend & Database**: [Supabase](https://supabase.io/) (PostgreSQL, Auth, Row Level Security)
-   **Animasi**: [Framer Motion](https://www.framer.com/motion/)

## 📂 Struktur Proyek

Struktur proyek ini mengikuti standar Next.js App Router untuk skalabilitas dan kemudahan pengelolaan.

```

/app
|-- /components     \# Komponen React modular yang membangun UI
|-- /lib            \# Fungsi bantuan dan utilitas
|-- layout.js       \# Layout utama aplikasi
|-- page.jsx        \# Titik masuk utama aplikasi
/public             \# Aset statis (gambar, ikon, dll.)
/...

````

## 🛠️ Memulai

### Prasyarat

-   Node.js (versi 20.x atau lebih tinggi)
-   npm, yarn, atau pnpm

### Instalasi & Konfigurasi

1.  **Clone repositori ini:**
    ```bash
    git clone [URL_REPOSITORI_ANDA]
    ```

2.  **Masuk ke direktori proyek:**
    ```bash
    cd [NAMA_FOLDER_PROYEK]
    ```

3.  **Instal dependensi:**
    ```bash
    npm install
    ```

4.  **Konfigurasi Environment (.env.local):**
    Buat file `.env.local` di direktori utama dan isi dengan kunci Supabase Anda.
    ```env
    NEXT_PUBLIC_SUPABASE_URL="https://<ID_PROYEK_ANDA>.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="<KUNCI_ANON_ANDA>"
    ```

5.  **Setup Database Supabase:**
    Jalankan skrip SQL yang telah disediakan di dalam **SQL Editor** Supabase Anda untuk membuat semua tabel, relasi, dan kebijakan keamanan (RLS) yang diperlukan.

### Menjalankan Server Pengembangan

Untuk menjalankan server pengembangan secara lokal, gunakan perintah berikut:

```bash
npm run dev
````

Buka [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) di browser Anda untuk melihat hasilnya.

## 📄 Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](https://choosealicense.com/licenses/mit/).

```
```
