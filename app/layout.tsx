import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import "./globals.css";

// Huruf diunduh saat build dan disajikan dari server kita sendiri, jadi HP
// Pengunjung tidak perlu menghubungi Google Fonts (lebih cepat, NF-05).
const hurufIsi = IBM_Plex_Sans({
  variable: "--huruf-isi",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const hurufJudul = IBM_Plex_Sans_Condensed({
  variable: "--huruf-judul",
  subsets: ["latin"],
  weight: ["600", "700"],
});

// Monospace: setiap angka sama lebar, harga sejajar seperti label harga (ADR 0004).
const hurufAngka = IBM_Plex_Mono({
  variable: "--huruf-angka",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  title: "ApotikKu · Katalog obat",
  description:
    "Cek harga, golongan, dan ketersediaan obat di ApotikKu tanpa perlu datang atau login.",
};

export const viewport: Viewport = {
  themeColor: "#1f4a36",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${hurufIsi.variable} ${hurufJudul.variable} ${hurufAngka.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
