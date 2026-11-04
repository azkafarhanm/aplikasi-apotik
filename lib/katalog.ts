// Bentuk data tampilan `katalog` dan cara menuliskannya untuk Pengunjung.
// Nilai di database berupa kode (misalnya `bebas_terbatas`); tulisan yang
// dibaca orang ada di sini, di satu tempat. File ini juga dipakai kode browser
// (layar Jual), jadi tidak boleh membawa kode khusus server; pengambilan data
// ada di halamannya masing-masing.

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

/**
 * Arti golongan dalam bahasa sehari-hari, untuk halaman Detail obat (#5).
 * Tujuannya mendidik: banyak orang belum memperhatikan logo golongan (M-06).
 */
export const penjelasanGolongan: Record<Golongan, string> = {
  bebas: "Boleh dibeli tanpa resep dokter. Tandanya lingkaran hijau bergaris tepi hitam.",
  bebas_terbatas:
    "Boleh dibeli tanpa resep dokter, tetapi jumlahnya dibatasi dan kemasannya memuat peringatan pemakaian. Tandanya lingkaran biru bergaris tepi hitam.",
  keras:
    "Hanya boleh diserahkan dengan resep dokter. Tandanya lingkaran merah bergaris tepi hitam dengan huruf K.",
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
 * Penjelasan Satuan jual untuk Pengunjung (#5). Banyak orang mengira harga di
 * Katalog adalah harga per butir, padahal apotek menjual per strip
 * (aturan bisnis 4: penjualan eceran per butir tidak didukung).
 */
export function jelaskanSatuan(satuanJual: string, isiPerSatuan: string): string {
  if (satuanJual === "strip") {
    return `Strip = satu lembar kemasan berisi ${isiPerSatuan}. Obat dijual per strip, tidak per butir.`;
  }
  return `Obat dijual utuh per ${satuanJual} berisi ${isiPerSatuan}, tidak dipecah lebih kecil.`;
}
