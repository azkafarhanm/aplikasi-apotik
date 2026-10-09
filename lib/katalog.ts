// Bentuk data tampilan `katalog` dan cara menuliskannya untuk Pengunjung.
// Nilai di database berupa kode (misalnya `bebas_terbatas`); tulisan yang
// dibaca orang ada di sini, di satu tempat.
import { buatSupabaseServer } from "@/lib/supabase/server";

export type Golongan = "bebas" | "bebas_terbatas" | "keras";
export type StatusStok = "tersedia" | "hampir_habis" | "habis";

export type ObatKatalog = {
  slug: string;
  nama: string;
  bentuk: string;
  keluhan: string;
  golongan: Golongan;
  satuan_jual: string;
  isi_per_satuan: string;
  kegunaan: string;
  harga_jual: number;
  status_stok: StatusStok;
};

export const tulisanGolongan: Record<Golongan, string> = {
  bebas: "Obat bebas",
  bebas_terbatas: "Obat bebas terbatas",
  keras: "Perlu resep dokter",
};

export const tulisanStatusStok: Record<StatusStok, string> = {
  tersedia: "Tersedia",
  hampir_habis: "Hampir habis",
  habis: "Habis",
};

export const tulisanKeluhan: Record<string, string> = {
  demam_nyeri: "Demam & Nyeri",
  batuk_flu: "Batuk & Flu",
  maag_pencernaan: "Maag & Pencernaan",
  alergi: "Alergi",
  luka_kulit: "Luka & Kulit",
  vitamin: "Vitamin",
};

export const tulisanBentuk: Record<string, string> = {
  tablet: "Tablet",
  kapsul: "Kapsul",
  tablet_kunyah: "Tablet kunyah",
  sirup: "Sirup",
  salep: "Salep",
  krim: "Krim",
  cairan: "Cairan",
  serbuk: "Serbuk",
  tetes: "Tetes",
};

/** 4000 → "Rp4.000" (penulisan rupiah baku: tanpa spasi, titik pemisah ribuan). */
export function tulisRupiah(rupiah: number): string {
  return "Rp" + rupiah.toLocaleString("id-ID");
}

/** "strip", "10 tablet" → "per strip · 10 tablet" */
export function tulisSatuan(satuanJual: string, isiPerSatuan: string): string {
  return `per ${satuanJual} · ${isiPerSatuan}`;
}

/**
 * Mengambil semua obat di Katalog, urut nama A–Z.
 * Dipanggil setiap kali halaman dibuka (tanpa cache), supaya Status stok selalu terbaru.
 */
export async function ambilKatalog(): Promise<ObatKatalog[]> {
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
