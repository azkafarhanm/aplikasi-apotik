// /staf/ringkasan: Ringkasan kondisi apotek hari ini (khusus Admin; F-09).
//
// Halaman pertama yang dilihat Admin setelah masuk, jadi isinya adalah hal
// yang perlu DITINDAKLANJUTI: uang hari ini, obat yang perlu dipesan ulang,
// dan obat yang perlu ditarik dari rak (M-02).
//
// Semua angka, batas tanggal, dan sisa hari dihitung fungsi database
// `ringkasan()` (SPEC 4.4), bukan di sini, supaya arti "hari ini menurut WIB"
// dan batas 90 hari tetap sama dengan halaman lain. Tampilannya ada di
// PapanRingkasan.
import { Suspense } from "react";
import { connection } from "next/server";
import type { IsiRingkasan } from "@/lib/ringkasan";
import { wajibAdmin } from "@/lib/staf";
import { buatSupabaseServer } from "@/lib/supabase/server";
import stylesStaf from "@/app/staf/staf.module.css";
import { PapanRingkasan } from "./PapanRingkasan";

export default function HalamanRingkasan() {
  return (
    <>
      <h1 className={stylesStaf.judul}>Ringkasan hari ini</h1>
      <Suspense fallback={<p>Memuat Ringkasan…</p>}>
        <IsiHalaman />
      </Suspense>
    </>
  );
}

async function IsiHalaman() {
  await wajibAdmin();
  // Selalu dibaca ulang: angka hari ini berubah setiap kali ada Penjualan.
  await connection();

  let ringkasan: IsiRingkasan;
  try {
    ringkasan = await ambilRingkasan();
  } catch (galat) {
    console.error(galat);
    return <p role="alert">Ringkasan sedang tidak bisa dimuat. Coba muat ulang halaman sebentar lagi.</p>;
  }

  return <PapanRingkasan ringkasan={ringkasan} />;
}

/** Kondisi apotek hari ini. Hanya Admin yang diizinkan database memanggilnya. */
async function ambilRingkasan(): Promise<IsiRingkasan> {
  const supabase = await buatSupabaseServer();
  const { data, error } = await supabase.rpc("ringkasan");

  if (error) {
    throw new Error(`Gagal membaca Ringkasan: ${error.message}`);
  }
  return data as IsiRingkasan;
}
