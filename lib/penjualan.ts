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
