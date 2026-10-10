// Halaman Katalog (/): terbuka untuk semua orang tanpa login (F-01, F-03).
//
// Bagian tetap (judul, catatan) disiapkan sekali saat build. Daftar obat
// diambil dari database SETIAP kali halaman dibuka (SPEC 4.7), supaya Status
// stok selalu sesuai Penjualan terakhir. <Suspense> membuat bagian tetap
// langsung tampil sementara daftar obat menyusul.
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { KartuEtiket } from "@/components/KartuEtiket";
import { ambilKatalog } from "@/lib/katalog";
import styles from "./page.module.css";

export default function HalamanKatalog() {
  return (
    <>
      <header className={styles.papanNama}>
        <div className={styles.lebar}>
          <p className={styles.merek}>ApotikKu</p>
          <h1 className={styles.judul}>Katalog obat</h1>
          <p className={styles.subjudul}>
            Harga, golongan, dan ketersediaan obat hari ini.
          </p>
        </div>
      </header>

      <main className={styles.lebar}>
        <p className={styles.catatan} role="note">
          Informasi ini bersifat umum. Tanyakan apoteker sebelum memakai obat.
        </p>

        <Suspense fallback={<p className={styles.pesan}>Memuat daftar obat…</p>}>
          <DaftarObat />
        </Suspense>
      </main>

      {/* Tautan untuk Staf (keputusan #6). Bukan pengamanan apa pun: Area staf
          dijaga login dan RLS, bukan oleh alamat yang dirahasiakan. */}
      <footer className={styles.kaki}>
        <div className={styles.lebar}>
          <Link href="/masuk">Masuk Staf</Link>
        </div>
      </footer>
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

  return (
    <>
      <p className={styles.jumlah}>{daftar.length} obat</p>
      <ul className={styles.daftar}>
        {daftar.map((obat) => (
          <li key={obat.slug}>
            <KartuEtiket obat={obat} />
          </li>
        ))}
      </ul>
    </>
  );
}
