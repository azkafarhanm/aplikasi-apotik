// Halaman Katalog (/): terbuka untuk semua orang tanpa login (F-01, F-03).
//
// Bagian tetap (judul, catatan) disiapkan sekali saat build. Daftar obat
// diambil dari database SETIAP kali halaman dibuka (SPEC 4.7), supaya Status
// stok selalu sesuai Penjualan terakhir. <Suspense> membuat bagian tetap
// langsung tampil sementara daftar obat menyusul.
import { Suspense } from "react";
import { connection } from "next/server";
import { KatalogTersaring } from "@/components/KatalogTersaring";
import { PapanNama } from "@/components/PapanNama";
import type { ObatKatalog } from "@/lib/katalog";
import { buatSupabaseServer } from "@/lib/supabase/server";
import styles from "./page.module.css";

export default function HalamanKatalog() {
  return (
    <>
      <PapanNama judul="Katalog obat" subjudul="Harga, golongan, dan ketersediaan obat hari ini." />

      <main className={styles.lebar}>
        <p className={styles.catatan} role="note">
          Informasi ini bersifat umum. Tanyakan apoteker sebelum memakai obat.
        </p>

        <Suspense fallback={<p className={styles.pesan}>Memuat daftar obat…</p>}>
          <DaftarObat />
        </Suspense>
      </main>
    </>
  );
}

async function DaftarObat() {
  // Tanda untuk Next.js: bagian ini selalu dibuat ulang saat ada yang membuka halaman.
  await connection();

  let daftar;
  try {
    daftar = await ambilKatalog();
  } catch (galat) {
    console.error(galat);
    return (
      <p className={styles.pesan} role="alert">
        Katalog sedang tidak bisa dimuat. Coba muat ulang halaman sebentar lagi.
      </p>
    );
  }

  if (daftar.length === 0) {
    return <p className={styles.pesan}>Belum ada obat di Katalog.</p>;
  }

  // Penyaringan (cari, laci Keluhan, "Tanpa resep") berjalan di HP Pengunjung,
  // jadi daftar lengkapnya cukup dikirim sekali dari sini (SPEC 4.7).
  return <KatalogTersaring daftar={daftar} />;
}

/**
 * Mengambil semua obat di Katalog, urut nama A–Z.
 * Dipanggil setiap kali halaman dibuka (tanpa cache), supaya Status stok selalu terbaru.
 */
async function ambilKatalog(): Promise<ObatKatalog[]> {
  const supabase = await buatSupabaseServer();
  const { data, error } = await supabase
    .from("katalog")
    .select("*")
    .order("nama", { ascending: true });

  if (error) {
    throw new Error(`Gagal membaca katalog: ${error.message}`);
  }
  return data as ObatKatalog[];
}
