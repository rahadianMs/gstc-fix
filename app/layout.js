import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata = {
  title: "WSC Certification Assistance",
  description: "Sustainability Portal: Your Gateway to GSTC Certification",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        {children}
        {/* TAMBAHKAN BARIS INI */}
        <div id="portal-root"></div>
      </body>
    </html>
  );
}