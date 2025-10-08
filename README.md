
-----
# 🌿 GSTC Self-Assessment Platform

Selamat datang di Platform Penilaian Mandiri (Self-Assessment) GSTC, sebuah aplikasi web yang dirancang untuk memandu destinasi pariwisata di Indonesia melalui proses evaluasi kepatuhan terhadap standar pariwisata berkelanjutan dari **Global Sustainable Tourism Council (GSTC)**.

Platform ini berfungsi sebagai ruang kerja kolaboratif antara **Pengelola Destinasi** dan **Konsultan Ahli**, menyederhanakan proses pengumpulan bukti, tinjauan, dan komunikasi untuk mencapai standar keberlanjutan global.

---

## ✨ Fitur Utama

Platform ini dibangun dengan sistem peran ganda yang menyediakan fungsionalitas khusus untuk setiap pengguna.

### Untuk Pengelola Destinasi:

* **Dashboard Progres Kepatuhan**: Visualisasikan kemajuan kepatuhan Anda secara keseluruhan dan per pilar GSTC melalui grafik yang dinamis dan mudah dipahami.
* **Navigasi Standar Terstruktur**: Jelajahi kriteria GSTC yang dibagi menjadi 4 Pilar (A, B, C, D) dan sub-seksinya dengan mudah.
* **Alur Kerja Pengajuan Bukti**: Unggah bukti kepatuhan (berupa tautan) untuk setiap sub-indikator dengan alur status yang jelas: `To Do`, `In Progress`, `In Review`, `Revision`, `Rejected`, dan `Done`.
* **Modul Self-Assessment**: Lakukan evaluasi mandiri untuk setiap pilar, dapatkan skor kepatuhan, dan identifikasi area prioritas untuk perbaikan.
* **Utas Diskusi per Kriteria**: Berkomunikasi langsung dengan konsultan pada setiap kriteria untuk mendapatkan klarifikasi, bimbingan, dan umpan balik.
* **Pusat Pembelajaran**: Akses materi edukasi, panduan, dan sumber daya lainnya untuk meningkatkan pemahaman tentang praktik pariwisata berkelanjutan.

### Untuk Konsultan (Admin):

* **Dasbor Review**: Tinjau daftar semua destinasi yang terdaftar dalam program.
* **Antarmuka Penilaian Terpusat**: Akses halaman detail untuk setiap destinasi untuk meninjau semua bukti yang telah diajukan, diorganisir per kriteria GSTC.
* **Mekanisme Umpan Balik**: Berikan komentar konstruktif, setujui (`Done`), atau tolak (`Rejected`) bukti yang diajukan oleh destinasi.
* **Fasilitasi Diskusi**: Terlibat dalam diskusi dengan pengelola destinasi untuk memberikan arahan dan memastikan semua standar terpenuhi dengan benar.

---

## 🚀 Tumpukan Teknologi

| Kategori | Teknologi |
|-----------|------------|
| **Framework** | [Next.js](https://nextjs.org/) (App Router) |
| **Bahasa** | JavaScript (JSX) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Backend & Database** | [Supabase](https://supabase.io/) (PostgreSQL, Auth, RLS) |
| **Animasi & UX** | [Framer Motion](https://www.framer.com/motion/) |

---

## 📂 Struktur Proyek

Struktur proyek ini mengikuti konvensi **Next.js App Router** untuk skalabilitas dan kemudahan pemeliharaan.

```

/app
│
├── /components      \# Komponen React modular pembentuk UI
│   ├── Admin...jsx  \# Komponen khusus untuk peran konsultan/admin
│   ├── ...Page.jsx  \# Komponen yang berfungsi sebagai halaman utama
│   └── ...          \# Komponen UI lainnya (Modal, Ikon, Kartu, dll.)
│
├── layout.js        \# Layout utama aplikasi
└── page.jsx         \# Titik masuk utama dan logika routing awal

````

---

## 🛠️ Memulai Proyek Secara Lokal

### Prasyarat

* Node.js (v20.x atau lebih tinggi)
* Manajer paket (npm, yarn, atau pnpm)

### Instalasi & Konfigurasi

1.  **Clone repositori ini:**
    ```bash
    git clone [https://github.com/rahadianMs/gstc-fix.git](https://github.com/rahadianMs/gstc-fix.git)
    ```

2.  **Masuk ke direktori proyek:**
    ```bash
    cd gstc-fix
    ```

3.  **Instal semua dependensi:**
    ```bash
    npm install
    ```

4.  **Konfigurasi Environment (`.env.local`)**
    Buat file `.env.local` di direktori root dan isi dengan kredensial Supabase Anda. Anda bisa mendapatkannya dari dasbor proyek Supabase Anda.
    ```env
    NEXT_PUBLIC_SUPABASE_URL="URL_PROYEK_SUPABASE_ANDA"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="KUNCI_ANON_PUBLIK_ANDA"
    ```

5.  **Setup Database Supabase**
    Pastikan Anda telah menjalankan skrip SQL yang diperlukan di **SQL Editor** Supabase untuk membuat tabel (`profiles`, `gstc_criteria`, `evidence_submissions`, dll.) dan mengatur kebijakan keamanan *Row Level Security* (RLS).

### Menjalankan Server Pengembangan

Jalankan server pengembangan lokal dengan perintah:

```bash
npm run dev
````

Buka [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) di browser Anda untuk melihat hasilnya.

-----

## 📄 Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](https://choosealicense.com/licenses/mit/).