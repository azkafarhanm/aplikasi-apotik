// Tes database untuk Ringkasan (tiket #11, SPEC 4.4, 4.5, 5.2).
//
// Gayanya mengikuti tests/penjualan.test.ts (SPEC 5.5): menguji perilaku yang
// terlihat dari luar, lewat jalur yang sama dengan halaman Ringkasan
// (supabase.rpc("ringkasan")).
//
// CATATAN PENTING soal berjalan bersamaan: file tes berjalan paralel, dan
// penjualan.test.ts serta pembatalan.test.ts terus mencatat Penjualan baru
// hari ini. Jadi angka pendapatan TIDAK bisa dibandingkan dengan angka tetap.
// Yang diuji di sini adalah SELISIHNYA sebelum dan sesudah satu Penjualan yang
// dicatat tes ini sendiri. Daftar obat tetap bisa diuji tepat, karena memakai
// obat uji yang tidak boleh diubah tes lain (uji_atur_obat hanya mengizinkan
// slug uji-jual-*).
import { beforeAll, describe, expect, it } from "vitest";
import { buatPenghubung, masukSebagai, type StafUji } from "./bantu";

const pengunjung = buatPenghubung();
let admin: StafUji;
let kasir: StafUji;
let nonaktif: StafUji;

type BarisObat = {
  id: number;
  nama: string;
  stok: number;
  satuan_jual: string;
  tanggal_kedaluwarsa: string;
};

type Ringkasan = {
  pendapatan: number;
  jumlah_penjualan: number;
  hampir_habis: BarisObat[];
  segera_kedaluwarsa: BarisObat[];
  sudah_kedaluwarsa: BarisObat[];
};

beforeAll(async () => {
  [admin, kasir, nonaktif] = await Promise.all([
    masukSebagai("admin"),
    masukSebagai("kasir"),
    masukSebagai("nonaktif"),
  ]);
});

async function ambilRingkasan(): Promise<Ringkasan> {
  const { data, error } = await admin.supabase.rpc("ringkasan");
  expect(error).toBeNull();
  return data as Ringkasan;
}

/** Nama obat di sebuah daftar, untuk pemeriksaan "ada" / "tidak ada". */
function nama(daftar: BarisObat[]): string[] {
  return daftar.map((o) => o.nama);
}

// ---------------------------------------------------------------------------
// Daftar obat: diuji tepat, memakai obat uji yang tidak diubah tes lain
// ---------------------------------------------------------------------------

describe("Daftar Hampir habis", () => {
  it("memuat obat berstok 20 ke bawah, termasuk yang stoknya 0", async () => {
    const r = await ambilRingkasan();
    expect(nama(r.hampir_habis)).toEqual(
      expect.arrayContaining(["Uji Stok 0", "Uji Stok 1", "Uji Stok 20"]),
    );
  });

  it("tidak memuat obat berstok 21", async () => {
    const r = await ambilRingkasan();
    expect(nama(r.hampir_habis)).not.toContain("Uji Stok 21");
  });

  it("urut dari stok paling sedikit", async () => {
    const r = await ambilRingkasan();
    const stok = r.hampir_habis.map((o) => o.stok);
    expect(stok).toEqual([...stok].sort((a, b) => a - b));
  });

  it("menyertakan satuan dan tanggal kedaluwarsa untuk setiap obat", async () => {
    const r = await ambilRingkasan();
    const satu = r.hampir_habis.find((o) => o.nama === "Uji Stok 20");
    expect(satu).toMatchObject({ stok: 20, satuan_jual: "strip" });
    expect(satu!.tanggal_kedaluwarsa).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(typeof satu!.id).toBe("number");
  });
});

describe("Daftar kedaluwarsa", () => {
  it("batas 90 hari: 90 hari lagi masuk, 91 hari lagi tidak", async () => {
    const r = await ambilRingkasan();
    expect(nama(r.segera_kedaluwarsa)).toContain("Uji Kedaluwarsa 90 Hari");
    expect(nama(r.segera_kedaluwarsa)).not.toContain("Uji Kedaluwarsa 91 Hari");
  });

  it("kedaluwarsa hari ini masuk Segera kedaluwarsa, bukan Sudah kedaluwarsa", async () => {
    const r = await ambilRingkasan();
    expect(nama(r.segera_kedaluwarsa)).toContain("Uji Kedaluwarsa Hari Ini");
    expect(nama(r.sudah_kedaluwarsa)).not.toContain("Uji Kedaluwarsa Hari Ini");
  });

  it("kedaluwarsa kemarin masuk Sudah kedaluwarsa, bukan Segera kedaluwarsa", async () => {
    const r = await ambilRingkasan();
    expect(nama(r.sudah_kedaluwarsa)).toContain("Uji Kedaluwarsa Kemarin");
    expect(nama(r.segera_kedaluwarsa)).not.toContain("Uji Kedaluwarsa Kemarin");
  });

  it("urut dari tanggal paling dekat", async () => {
    const r = await ambilRingkasan();
    const tanggal = r.segera_kedaluwarsa.map((o) => o.tanggal_kedaluwarsa);
    expect(tanggal).toEqual([...tanggal].sort());
  });
});

describe("Obat yang diarsipkan", () => {
  it("tidak ikut di ketiga daftar, walau stoknya besar dan tanggalnya jauh", async () => {
    const r = await ambilRingkasan();
    for (const daftar of [r.hampir_habis, r.segera_kedaluwarsa, r.sudah_kedaluwarsa]) {
      expect(nama(daftar)).not.toContain("Uji Diarsipkan");
    }
  });
});

// ---------------------------------------------------------------------------
// Pendapatan: dibandingkan dengan penjumlahan langsung dari tabel penjualan
// ---------------------------------------------------------------------------
//
// Selisih sebelum/sesudah TIDAK bisa dipakai: file tes lain berjalan bersamaan
// dan ikut mencatat Penjualan BARU maupun MEMBATALKAN Penjualan, jadi angka
// pendapatan bisa naik dan turun sendiri selama tes ini berjalan.
//
// Cara yang dipakai: membandingkan angka dari ringkasan() dengan penjumlahan
// yang dihitung tes ini sendiri dari tabel penjualan. Supaya perbandingannya
// adil, tabel dibaca SEBELUM dan SESUDAH memanggil ringkasan(); bila kedua
// bacaan sama persis, berarti tidak ada tes lain yang menyelipkan perubahan di
// tengah, dan angkanya boleh dibandingkan dengan tepat. Bila berubah, dicoba
// lagi beberapa kali.

type JumlahTabel = { semua: number; dibatalkan: number; selesai: number; banyakSelesai: number };

/** Menjumlahkan sendiri Penjualan hari ini (WIB) langsung dari tabel. */
async function jumlahkanDariTabel(): Promise<JumlahTabel> {
  const { data, error } = await admin.supabase
    .from("penjualan_hari_ini")
    .select("total, status");
  expect(error).toBeNull();

  const baris = data as { total: number; status: "selesai" | "dibatalkan" }[];
  const selesai = baris.filter((p) => p.status === "selesai");
  return {
    semua: baris.reduce((j, p) => j + p.total, 0),
    dibatalkan: baris.filter((p) => p.status === "dibatalkan").reduce((j, p) => j + p.total, 0),
    selesai: selesai.reduce((j, p) => j + p.total, 0),
    banyakSelesai: selesai.length,
  };
}

/**
 * Mengambil ringkasan bersama penjumlahan tabel yang stabil: diulang sampai
 * bacaan tabel sebelum dan sesudah sama, artinya tidak ada tes lain yang
 * mengubah data di antaranya.
 */
async function ringkasanDanTabelYangTenang(): Promise<{ r: Ringkasan; t: JumlahTabel }> {
  for (let percobaan = 0; percobaan < 6; percobaan++) {
    const sebelum = await jumlahkanDariTabel();
    const r = await ambilRingkasan();
    const sesudah = await jumlahkanDariTabel();

    if (JSON.stringify(sebelum) === JSON.stringify(sesudah)) {
      return { r, t: sesudah };
    }
  }
  throw new Error(
    "Penjualan hari ini terus berubah selama 6 percobaan, jadi angkanya tidak bisa dibandingkan dengan tepat.",
  );
}

describe("Pendapatan hari ini", () => {
  it("sama dengan penjumlahan Penjualan selesai hari ini, dan Penjualan Dibatalkan tidak ikut", async () => {
    // Pastikan hari ini benar-benar ADA Penjualan yang Dibatalkan, supaya tes
    // ini bermakna. Obatnya milik tes ini sendiri (uji-jual-ringkasan): tes
    // Penjualan dan Pembatalan memeriksa angka stok yang tepat, dan file tes
    // berjalan bersamaan. Stoknya sangat besar, jadi tidak perlu disetel ulang
    // dan tidak pernah masuk daftar Hampir habis.
    const { data: obat } = await admin.supabase
      .from("obat")
      .select("id, harga_jual")
      .eq("slug", "uji-jual-ringkasan")
      .single();

    const { data: baru, error } = await kasir.supabase.rpc("catat_penjualan", {
      keranjang: [{ obat_id: obat!.id, jumlah: 2 }],
      metode_bayar: "qris_transfer",
      uang_diterima: null,
      cek_resep: false,
    });
    expect(error).toBeNull();
    expect(baru.total).toBe(obat!.harga_jual * 2);

    const batal = await admin.supabase.rpc("batalkan_penjualan", {
      nomor: baru.nomor,
      alasan: "Tes Ringkasan",
    });
    expect(batal.error).toBeNull();

    const { r, t } = await ringkasanDanTabelYangTenang();

    expect(t.dibatalkan).toBeGreaterThan(0); // tes ini memang baru membatalkan satu
    expect(r.pendapatan).toBe(t.selesai);
    expect(r.pendapatan).toBe(t.semua - t.dibatalkan);
    expect(r.jumlah_penjualan).toBe(t.banyakSelesai);
  });

  it("berupa bilangan bulat rupiah, tidak pernah negatif", async () => {
    const r = await ambilRingkasan();
    expect(Number.isInteger(r.pendapatan)).toBe(true);
    expect(r.pendapatan).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(r.jumlah_penjualan)).toBe(true);
    expect(r.jumlah_penjualan).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// Hak akses (SPEC 4.5): hanya Admin aktif
// ---------------------------------------------------------------------------

describe("Hak akses Ringkasan", () => {
  it("Kasir ditolak", async () => {
    const { data, error } = await kasir.supabase.rpc("ringkasan");
    expect(data).toBeNull();
    expect(error?.code).toBe("P0001");
    expect(error?.message).toBe("Hanya Admin yang bisa melihat Ringkasan.");
  });

  it("Staf nonaktif ditolak", async () => {
    const { error } = await nonaktif.supabase.rpc("ringkasan");
    expect(error?.message).toBe("Hanya Admin yang bisa melihat Ringkasan.");
  });

  it("Pengunjung tidak bisa memanggil ringkasan", async () => {
    const { data, error } = await pengunjung.rpc("ringkasan");
    expect(data).toBeNull();
    expect(["42501", "PGRST202"]).toContain(error?.code);
  });
});
