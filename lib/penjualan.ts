// Bentuk data layar Jual (tiket #8, SPEC 4.4 dan 4.8). File ini dipakai juga
// oleh kode browser, jadi tidak boleh membawa kode khusus server.
//
// Layar Jual hanya MEMBACA daftar obat dan MENGIRIM keranjang (obat + jumlah).
// Semua aturan Penjualan (harga, stok, Cek resep, uang) ditegakkan fungsi
// database catat_penjualan; angka di layar hanya perkiraan (ADR 0003, 0005).
import type { Golongan, StatusStok } from "@/lib/katalog";

/** Satu baris dari tampilan obat_kasir: obat yang bisa muncul di layar Jual. */
export type ObatJual = {
  id: number;
  nama: string;
  bentuk: string;
  golongan: Golongan;
  satuan_jual: string;
  isi_per_satuan: string;
  harga_jual: number;
  stok: number;
  status_stok: StatusStok;
  sudah_kedaluwarsa: boolean;
};

export type CaraBayar = "tunai" | "qris_transfer";

export const tulisanCaraBayar: Record<CaraBayar, string> = {
  tunai: "Tunai",
  qris_transfer: "QRIS/transfer",
};

/** Yang dikirim layar ke database: hanya obat dan jumlah, TANPA harga (aturan bisnis 6). */
export type IsiKeranjang = { obat_id: number; jumlah: number };

/** Rincian resmi yang dikembalikan catat_penjualan (harga dari database). */
export type HasilPenjualan = {
  nomor: string;
  total: number;
  metode_bayar: CaraBayar;
  uang_diterima: number | null;
  kembalian: number | null;
  item: Array<{
    obat_id: number;
    nama: string;
    satuan_jual: string;
    jumlah: number;
    harga_satuan: number;
    subtotal: number;
  }>;
};

/** Obat bisa dipilih di layar Jual bila tidak Habis (stok 0 atau Sudah kedaluwarsa). */
export function bisaDijual(obat: ObatJual): boolean {
  return obat.status_stok !== "habis";
}

// ---------------------------------------------------------------------------
// Struk dan Penjualan hari ini (tiket #10, SPEC 4.2 dan 4.9)
// ---------------------------------------------------------------------------

export type StatusPenjualan = "selesai" | "dibatalkan";

export const tulisanStatusPenjualan: Record<StatusPenjualan, string> = {
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

/** Satu baris tampilan penjualan_hari_ini (RLS: Kasir miliknya, Admin semua). */
export type BarisPenjualanHariIni = {
  nomor: string;
  waktu: string;
  total: number;
  metode_bayar: CaraBayar;
  status: StatusPenjualan;
  nama_kasir: string | null;
  /** Terisi ketiganya bila Dibatalkan (tiket #13). */
  dibatalkan_pada: string | null;
  alasan_batal: string | null;
  /** Kosong bila yang membaca Kasir (RLS profil_staf); layar menulis "Admin". */
  nama_pembatal: string | null;
};

/** Semua yang tercetak di Struk. Harga = harga saat terjual (salinan). */
export type StrukPenjualan = {
  nomor: string;
  waktu: string;
  namaKasir: string;
  total: number;
  metode_bayar: CaraBayar;
  uang_diterima: number | null;
  kembalian: number | null;
  status: StatusPenjualan;
  /** Hanya untuk Penjualan Dibatalkan (tiket #13). */
  pembatalan: Pembatalan | null;
  item: Array<{ nama: string; satuan_jual: string; jumlah: number; harga_satuan: number; subtotal: number }>;
};

// ---------------------------------------------------------------------------
// Pembatalan (tiket #13, SPEC 4.4)
// ---------------------------------------------------------------------------

/** Batas panjang alasan. Database menolak yang lebih panjang; layar ikut membatasi. */
export const panjangAlasanMaks = 200;

/** Kapan, oleh siapa, dan kenapa sebuah Penjualan dibatalkan. */
export type Pembatalan = {
  waktu: string;
  /** Nama tampilan Admin, atau "Admin" bila tidak boleh dibaca (Kasir). */
  oleh: string;
  alasan: string;
};

/** Nama yang membatalkan. Hanya Admin yang bisa membatalkan, jadi "Admin" pasti benar. */
export function tulisPembatal(nama: string | null): string {
  return nama ?? "Admin";
}

/** Yang dikembalikan batalkan_penjualan: stok yang kembali per obat. */
export type HasilPembatalan = {
  nomor: string;
  dibatalkan_pada: string;
  alasan: string;
  item: Array<{ nama: string; satuan_jual: string; jumlah: number }>;
};

/** "PJ-000123 dibatalkan. Stok dikembalikan: Parasetamol 500 mg +2 strip." */
export function tulisHasilPembatalan(hasil: HasilPembatalan): string {
  const stok = hasil.item.map((i) => `${i.nama} +${i.jumlah} ${i.satuan_jual}`).join(", ");
  return stok ? `${hasil.nomor} dibatalkan. Stok dikembalikan: ${stok}.` : `${hasil.nomor} dibatalkan.`;
}

/** Nomor Penjualan yang sah, misalnya PJ-000123 (lebih dari 999.999 menjadi 7 digit). */
export function nomorSah(nomor: string): boolean {
  return /^PJ-\d{6,}$/.test(nomor);
}

// Waktu selalu ditulis menurut WIB, apa pun zona waktu server atau komputer
// Kasir (SPEC 4.3: "hari ini" selalu menurut WIB).
const zonaWib = "Asia/Jakarta";

/** "17 Okt 2026 14.05 WIB" */
export function tulisWaktuWib(waktu: string): string {
  const tanggal = new Date(waktu).toLocaleDateString("id-ID", {
    timeZone: zonaWib,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${tanggal} ${tulisJamWib(waktu)} WIB`;
}

/** "14.05" */
export function tulisJamWib(waktu: string): string {
  return new Date(waktu).toLocaleTimeString("id-ID", { timeZone: zonaWib, hour: "2-digit", minute: "2-digit" });
}

/** "Jumat, 17 Oktober 2026" */
export function tulisTanggalWib(waktu: Date): string {
  return waktu.toLocaleDateString("id-ID", {
    timeZone: zonaWib,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
