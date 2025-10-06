---

```markdown
# 🌿 GSTC Self Assistant

**GSTC Self Assistant** adalah platform web terpusat yang dirancang untuk memfasilitasi dan menyederhanakan proses sertifikasi pariwisata berkelanjutan berbasis standar **Global Sustainable Tourism Council (GSTC)**.  
Tujuannya adalah menjadi *single source of truth* bagi komunikasi, pengumpulan bukti, dan pemantauan progres antara **Konsultan (Admin)** dan **Pemilik Destinasi (User)**.

---

## ✨ Fitur Utama

- **Manajemen Peran Ganda**  
  Sistem membedakan antara **Pemilik Destinasi** (yang mengajukan sertifikasi) dan **Konsultan** (yang melakukan review).

- **Dasbor Dinamis**  
  Tampilan dasbor yang berbeda untuk setiap peran, memastikan pengalaman pengguna yang relevan.

- **Pengajuan Bukti per Indikator**  
  Pengguna dapat mengunggah tautan bukti (mis. Google Drive) untuk setiap sub-indikator kriteria GSTC.

- **Alur Kerja Status**  
  Pelacakan status setiap bukti: `To Do`, `In Progress`, `In Review`, `Done`, dan `Rejected`.

- **Dasbor Review Konsultan**  
  Antarmuka khusus bagi konsultan untuk mereview bukti, memberikan komentar, serta menyetujui atau menolak ajuan.

- **Visualisasi Progres**  
  Progress bar dinamis yang menampilkan kemajuan kepatuhan per pilar dan sub-seksi.

- **Fitur Diskusi**  
  Ruang komunikasi terintegrasi per kriteria untuk interaksi langsung antara destinasi dan konsultan.

---

## 🚀 Teknologi yang Digunakan

| Kategori | Teknologi |
|-----------|------------|
| **Framework** | [Next.js](https://nextjs.org/) (App Router) |
| **Bahasa** | JavaScript (JSX) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Backend & Database** | [Supabase](https://supabase.io/) (PostgreSQL, Auth, RLS) |
| **Animasi** | [Framer Motion](https://www.framer.com/motion/) |

---

## 📂 Struktur Proyek

Struktur proyek mengikuti standar **Next.js App Router** agar skalabel dan mudah dikelola.

```

/app
│-- /components      # Komponen React modular pembentuk UI
│-- /lib             # Fungsi bantuan dan utilitas
│-- layout.js        # Layout utama aplikasi
│-- page.jsx         # Titik masuk utama aplikasi
/public              # Aset statis (gambar, ikon, dsb.)
...

````

---

## 🛠️ Memulai

### Prasyarat

- Node.js (v20.x atau lebih tinggi)
- npm, yarn, atau pnpm

### Instalasi & Konfigurasi

1. **Clone repositori ini**
   ```bash
   git clone [URL_REPOSITORI_ANDA]
````

2. **Masuk ke direktori proyek**

   ```bash
   cd [NAMA_FOLDER_PROYEK]
   ```

3. **Instal dependensi**

   ```bash
   npm install
   ```

4. **Konfigurasi Environment (.env.local)**
   Buat file `.env.local` di direktori utama proyek dan isi dengan kredensial Supabase Anda:

   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://<ID_PROYEK_ANDA>.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="<KUNCI_ANON_ANDA>"
   ```

5. **Setup Database Supabase**
   Jalankan skrip SQL yang disediakan di **SQL Editor** Supabase Anda untuk membuat tabel, relasi, dan kebijakan keamanan (RLS).

---

## ▶️ Menjalankan Server Pengembangan

Jalankan server lokal dengan perintah:

```bash
npm run dev
```

Kemudian buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat hasilnya.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](https://choosealicense.com/licenses/mit/).

---

### 💡 Catatan

Versi ini merupakan pengembangan terkini dari **GSTC Self Assistant**, menggantikan README sebelumnya agar lebih sesuai dengan visi, fitur, dan arsitektur proyek.

```
