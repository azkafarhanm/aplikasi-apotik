// /staf/penjualan/[nomor]/struk: Struk 58 mm siap cetak (Kasir: miliknya hari
// ini; Admin: semua; F-07, SPEC 4.2 dan 4.9).
//
// Halaman ini tidak memeriksa sendiri siapa pemilik Penjualan: RLS yang
// menentukan. Penjualan yang tidak boleh dibaca (milik Kasir lain, atau
// kemarin bagi Kasir) tidak pernah sampai ke sini, sehingga tampil sama
// dengan nomor yang memang tidak ada: "Penjualan tidak ditemukan."
import Link from "next/link";
import { Suspense } from "react";
import { tulisRupiah } from "@/lib/katalog";
import { nomorSah, tulisPembatal, type StrukPenjualan } from "@/lib/penjualan";
import { wajibStaf } from "@/lib/staf";
import { buatSupabaseServer } from "@/lib/supabase/server";
import stylesStaf from "@/app/staf/staf.module.css";
import { Struk } from "./Struk";
import { TombolCetak } from "./TombolCetak";
import styles from "./struk.module.css";

export default function HalamanStruk(props: PageProps<"/staf/penjualan/[nomor]/struk">) {
  return (
    <Suspense fallback={<p>Memuat Struk…</p>}>
      <IsiStruk {...props} />
    </Suspense>
  );
}

async function IsiStruk({ params, searchParams }: PageProps<"/staf/penjualan/[nomor]/struk">) {
  const staf = await wajibStaf();
  if (!staf.aktif) {
    return null;
  }

  const { nomor } = await params;
  // ?baru=1: dibuka langsung dari layar Jual setelah Penjualan tersimpan.
  const baru = (await searchParams).baru === "1";

  let struk: StrukPenjualan | null;
  try {
    struk = nomorSah(nomor) ? await ambilStruk(nomor) : null;
  } catch (galat) {
    console.error(galat);
    return <p role="alert">Struk sedang tidak bisa dimuat. Coba muat ulang halaman sebentar lagi.</p>;
  }

  if (!struk) {
    return (
      <>
        <h1 className={stylesStaf.judul}>Struk</h1>
        <div className={styles.tidakAda} role="alert">
          <p>Penjualan tidak ditemukan.</p>
          <Link href="/staf/penjualan" className={styles.tautan}>
            Lihat Penjualan hari ini
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className={styles.halaman}>
      <h1 className={`${stylesStaf.judul} ${styles.layarSaja}`}>Struk {struk.nomor}</h1>

      {baru && (
        <p className={styles.tersimpan} role="status">
          <strong>{struk.nomor}</strong> tersimpan.
          {struk.kembalian !== null && (
            <>
              {" "}
              Kembalian <strong>{tulisRupiah(struk.kembalian)}</strong>.
            </>
          )}
        </p>
      )}

      <div className={styles.aksi}>
        <TombolCetak fokusAwal={baru} />
        <Link href="/staf/jual" id="penjualan-berikutnya" className={styles.tautan}>
          Penjualan berikutnya
        </Link>
        <Link href="/staf/penjualan" className={styles.tautan}>
          Penjualan hari ini
        </Link>
      </div>

      <Struk struk={struk} />
    </div>
  );
}

/** Struk satu Penjualan, atau null bila tidak ada / tidak boleh dibaca (RLS). */
async function ambilStruk(nomor: string): Promise<StrukPenjualan | null> {
  const supabase = await buatSupabaseServer();
  const { data: penjualan, error } = await supabase
    .from("penjualan")
    .select(
      "id, nomor, waktu, total, metode_bayar, uang_diterima, kembalian, status, dibatalkan_pada, alasan_batal, kasir:profil_staf!penjualan_kasir_id_fkey(nama_tampilan), pembatal:profil_staf!penjualan_dibatalkan_oleh_fkey(nama_tampilan)",
    )
    .eq("nomor", nomor)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal membaca Penjualan ${nomor}: ${error.message}`);
  }
  if (!penjualan) {
    return null;
  }

  // rincian_struk: Item penjualan + nama obat, termasuk obat yang sudah
  // diarsipkan setelah terjual (lihat migrasi …_struk_penjualan_hari_ini.sql).
  const { data: item, error: galatItem } = await supabase
    .from("rincian_struk")
    .select("nama, satuan_jual, jumlah, harga_satuan, subtotal")
    .eq("penjualan_id", penjualan.id)
    .order("id");

  if (galatItem) {
    throw new Error(`Gagal membaca Item penjualan ${nomor}: ${galatItem.message}`);
  }

  const kasir = penjualan.kasir as unknown as { nama_tampilan: string } | null;
  // Kasir tidak boleh membaca profil Admin (RLS), jadi pembatal bisa kosong;
  // tulisPembatal lalu menulis "Admin", yang pasti benar (tiket #13).
  const pembatal = penjualan.pembatal as unknown as { nama_tampilan: string } | null;
  return {
    nomor: penjualan.nomor,
    waktu: penjualan.waktu,
    namaKasir: kasir?.nama_tampilan ?? "Staf",
    total: penjualan.total,
    metode_bayar: penjualan.metode_bayar,
    uang_diterima: penjualan.uang_diterima,
    kembalian: penjualan.kembalian,
    status: penjualan.status,
    pembatalan:
      penjualan.status === "dibatalkan"
        ? {
            waktu: penjualan.dibatalkan_pada,
            oleh: tulisPembatal(pembatal?.nama_tampilan ?? null),
            alasan: penjualan.alasan_batal,
          }
        : null,
    item: item as StrukPenjualan["item"],
  };
}
