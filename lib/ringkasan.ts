// Bentuk data Ringkasan (tiket #11, SPEC 4.4) dan cara menuliskannya.
//
// Semua angka dan tanggal sudah dihitung fungsi database `ringkasan()`,
// termasuk sisa hari menuju kedaluwarsa. File ini hanya mengubahnya menjadi
// kalimat yang dibaca Admin, supaya tulisannya ada di satu tempat.

/** Satu baris obat di salah satu daftar Ringkasan. */
export type BarisObatRingkasan = {
  id: number;
  nama: string;
  stok: number;
  satuan_jual: string;
  tanggal_kedaluwarsa: string;
  /** Hanya pada daftar Segera kedaluwarsa. 0 = kedaluwarsa hari ini. */
  sisa_hari?: number;
  /** Hanya pada daftar Sudah kedaluwarsa. 1 = kemarin. */
  lewat_hari?: number;
};

export type IsiRingkasan = {
  pendapatan: number;
  jumlah_penjualan: number;
  hampir_habis: BarisObatRingkasan[];
  segera_kedaluwarsa: BarisObatRingkasan[];
  sudah_kedaluwarsa: BarisObatRingkasan[];
};

/** "2027-02-02" → "2 Feb 2027" */
export function tulisTanggalSingkat(tanggal: string): string {
  // Dibaca sebagai tanggal polos (tanpa jam), jadi zona waktu tidak menggesernya.
  const [tahun, bulan, hari] = tanggal.split("-").map(Number);
  return new Date(Date.UTC(tahun, bulan - 1, hari)).toLocaleDateString("id-ID", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "3 strip" — stok beserta Satuan jualnya. */
export function tulisStok(baris: BarisObatRingkasan): string {
  return `${baris.stok} ${baris.satuan_jual}`;
}

/** 0 → "hari ini", 1 → "besok", 12 → "12 hari lagi" */
export function tulisSisaHari(sisaHari: number): string {
  if (sisaHari <= 0) {
    return "hari ini";
  }
  if (sisaHari === 1) {
    return "besok";
  }
  return `${sisaHari} hari lagi`;
}

/** 1 → "kemarin", 30 → "30 hari lalu" */
export function tulisLewatHari(lewatHari: number): string {
  return lewatHari === 1 ? "kemarin" : `${lewatHari} hari lalu`;
}
