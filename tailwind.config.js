/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      colors: {
        // Palet Warna Baru berdasarkan referensi gambar
        'brand-primary': '#0B132B',      // Biru Navy Gelap (untuk sidebar & header)
        'brand-secondary': '#1C2541',   // Versi lebih terang dari biru navy
        'brand-background': '#F7FAFC',  // Latar belakang utama (abu-abu sangat cerah)
        'brand-surface': '#FFFFFF',     // Warna dasar untuk kartu/elemen
        'brand-accent': '#FFC72C',      // Aksen Emas/Kuning dari logo
      }
    },
  },
  plugins: [],
}