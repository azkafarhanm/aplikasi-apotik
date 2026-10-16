// /staf/jual: layar kasir (Kasir, Admin; F-06, F-12, SPEC 4.8).
//
// Daftar obat (stok persis + Status stok) dibaca di server setiap kali halaman
// dibuka dan setiap kali Penjualan tersimpan, lalu diserahkan ke LayarJual
// yang berjalan di browser (pencarian, keranjang, pembayaran).
import { Suspense } from "react";
import { wajibStaf } from "@/lib/staf";
import type { ObatJual } from "@/lib/penjualan";
import { buatSupabaseServer } from "@/lib/supabase/server";
import styles from "@/app/staf/staf.module.css";
import { LayarJual } from "./LayarJual";

export default function HalamanJual() {
  return (
    <>
      <h1 className={styles.judul}>Jual</h1>
      <Suspense fallback={<p>Memuat daftar obat…</p>}>
        <IsiJual />
      </Suspense>
    </>
  );
}

async function IsiJual() {
  const staf = await wajibStaf();
  // Staf nonaktif: pesannya sudah ditampilkan layout, dan database pun
  // menolaknya.
  if (!staf.aktif) {
    return null;
  }

  let daftarObat;
  try {
    daftarObat = await ambilObatJual();
  } catch (galat) {
    console.error(galat);
    return (
      <p role="alert">Daftar obat sedang tidak bisa dimuat. Coba muat ulang halaman sebentar lagi.</p>
    );
  }

  return <LayarJual daftarObat={daftarObat} />;
}

/** Daftar obat untuk layar Jual, urut nama. RLS menentukan isinya (Staf aktif saja). */
async function ambilObatJual(): Promise<ObatJual[]> {
  const supabase = await buatSupabaseServer();
  const { data, error } = await supabase
    .from("obat_kasir")
    .select(
      "id, nama, bentuk, golongan, satuan_jual, isi_per_satuan, harga_jual, stok, status_stok, sudah_kedaluwarsa",
    )
    .order("nama");

  if (error) {
    throw new Error(`Gagal membaca daftar obat: ${error.message}`);
  }
  return data as ObatJual[];
}
