// /staf/penjualan: Penjualan hari ini (Kasir: miliknya, Admin: semua; F-08,
// SPEC 4.2). Tombol Batalkan untuk Admin menyusul di tiket #13.
//
// Isinya dibaca dari tampilan penjualan_hari_ini: "hari ini menurut WIB"
// dihitung database, dan RLS menentukan Penjualan siapa yang terlihat.
import { Suspense } from "react";
import { tulisTanggalWib, type BarisPenjualanHariIni } from "@/lib/penjualan";
import { wajibStaf } from "@/lib/staf";
import { buatSupabaseServer } from "@/lib/supabase/server";
import stylesStaf from "@/app/staf/staf.module.css";
import styles from "./penjualan.module.css";
import { TabelPenjualan } from "./TabelPenjualan";

export default function HalamanPenjualan() {
  return (
    <>
      <h1 className={stylesStaf.judul}>Penjualan hari ini</h1>
      <Suspense fallback={<p>Memuat Penjualan hari ini…</p>}>
        <DaftarPenjualan />
      </Suspense>
    </>
  );
}

async function DaftarPenjualan() {
  const staf = await wajibStaf();
  if (!staf.aktif) {
    return null;
  }
  const admin = staf.peran === "admin";

  let daftar: BarisPenjualanHariIni[];
  try {
    daftar = await ambilPenjualanHariIni();
  } catch (galat) {
    console.error(galat);
    return <p role="alert">Penjualan hari ini sedang tidak bisa dimuat. Coba muat ulang halaman sebentar lagi.</p>;
  }

  return (
    <>
      <p className={styles.keterangan}>
        {tulisTanggalWib(new Date())} · {admin ? "Semua Kasir" : "Penjualan yang Anda catat"}
      </p>
      <TabelPenjualan daftar={daftar} tampilkanKasir={admin} />
    </>
  );
}

/** Penjualan hari ini (WIB), terbaru di atas. */
async function ambilPenjualanHariIni(): Promise<BarisPenjualanHariIni[]> {
  const supabase = await buatSupabaseServer();
  const { data, error } = await supabase
    .from("penjualan_hari_ini")
    .select("nomor, waktu, total, metode_bayar, status, nama_kasir")
    .order("waktu", { ascending: false });

  if (error) {
    throw new Error(`Gagal membaca Penjualan hari ini: ${error.message}`);
  }
  return data as BarisPenjualanHariIni[];
}
