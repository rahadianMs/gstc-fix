"use client";

// Data perusahaan yang berpartisipasi
const participatingCompanies = [
    {
        name: "InJourney",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Logo_InJourney.svg/2560px-Logo_InJourney.svg.png",
        description: "Sebagai holding BUMN di sektor aviasi dan pariwisata Indonesia, InJourney bertugas mengintegrasikan dan mengembangkan ekosistem pariwisata nasional. Mereka mengelola aset-aset vital negara mulai dari bandara, hotel, hingga destinasi wisata strategis untuk menciptakan pengalaman perjalanan yang terpadu dan berkelas dunia."
    },
    {
        name: "Traveloka",
        logoUrl: "https://ik.imagekit.io/tvlk/image/imageResource/2024/08/09/1723192761223-35bd6fefad235fbb690b6d79b050343f.png?tr=q-75",
        description: "Sebagai platform perjalanan terdepan di Asia Tenggara, Traveloka mempermudah jutaan pengguna untuk merencanakan dan memesan berbagai kebutuhan perjalanan. Dari tiket pesawat, akomodasi, hingga atraksi wisata, Traveloka berkomitmen menyediakan solusi perjalanan yang lengkap dan inovatif dalam satu aplikasi."
    },
    {
        name: "Tiket.com",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Tiket.com_logo.png/1200px-Tiket.com_logo.png",
        description: "Salah satu pelopor Online Travel Agent (OTA) di Indonesia, tiket.com telah menjadi platform andalan untuk pemesanan tiket pesawat, kereta api, hotel, dan hiburan. Dengan fokus pada kemudahan akses, mereka terus berinovasi untuk memenuhi segala kebutuhan perjalanan dan rekreasi masyarakat Indonesia."
    },
    {
        name: "EXO Travel",
        logoUrl: "https://www.exotravel.com/images/w3_images/logo222.png",
        description: "Sebagai operator tur terkemuka di Asia, EXO Travel mengkhususkan diri dalam menciptakan pengalaman perjalanan yang otentik dan berkesan. Dengan jaringan yang luas dan pemahaman mendalam tentang destinasi lokal, mereka menawarkan tur yang dirancang secara personal dan bertanggung jawab."
    },
    {
        name: "Ekosistem Hotels",
        logoUrl: "https://ekosistemhotels.com/wp-content/themes/ekosistem1.1/images/Logo-Ekosistem.png",
        description: "Ekosistem Hotels berfokus pada penyediaan solusi manajemen perhotelan yang inovatif dan berkelanjutan. Mereka membantu para pemilik hotel untuk mengoptimalkan operasional, meningkatkan pengalaman tamu, dan menerapkan praktik ramah lingkungan di seluruh properti mereka."
    }
];

// Komponen untuk Halaman Profil Usaha
export default function ProfilUsahaPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-800">Profil Peserta</h1>
                <p className="mt-2 text-lg text-slate-600">Mengenal para pionir yang telah berkomitmen pada pariwisata berkelanjutan di Indonesia.</p>
            </div>
            
            <div className="space-y-8">
                {participatingCompanies.map((company) => (
                    <div key={company.name} className="bg-white p-8 rounded-xl shadow-md border flex flex-col md:flex-row items-center gap-8 transition-all hover:shadow-lg hover:border-emerald-500">
                        <div className="flex-shrink-0 w-48 h-24 flex items-center justify-center">
                            <img 
                                src={company.logoUrl} 
                                alt={`Logo ${company.name}`} 
                                className="max-w-full max-h-16 object-contain"
                            />
                        </div>
                        <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-6 md:pt-0 md:pl-8">
                            <p className="text-slate-600 text-justify">{company.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}