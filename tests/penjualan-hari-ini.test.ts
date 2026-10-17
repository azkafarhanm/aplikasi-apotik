// Tes database untuk Struk dan Penjualan hari ini (tiket #10, SPEC 4.2, 4.5,
// 4.9, 5.2; user story 42, 43, 63, 72).
//
// Mengikuti gaya tests/penjualan.test.ts (SPEC 5.5): perilaku dari luar,
// lewat jalur yang sama dengan halaman (tampilan penjualan_hari_ini dan
// rincian_struk).
//
// Tes ini TIDAK mencatat Penjualan baru. Ia memakai empat Penjualan uji
// berjam tetap dari supabase/uji/data-uji.sql (waktunya disegarkan setiap
// menit relatif terhadap hari ini), supaya tidak mengganggu angka stok tes
// Penjualan yang berjalan bersamaan:
//   Kasir uji pukul 00.30 WIB hari ini (berisi obat yang sudah diarsipkan),
//   Kasir uji pukul 23.30 WIB hari ini, Kasir uji pukul 23.30 WIB kemarin,
//   Admin uji pukul 12.00 WIB hari ini.
import { beforeAll, describe, expect, it } from "vitest";
import { buatPenghubung, masukSebagai, type StafUji } from "./bantu";

const pengunjung = buatPenghubung();
let admin: StafUji;
let kasir: StafUji;
let nonaktif: StafUji;

/** Nomor Penjualan uji berjam tetap, dicari lewat pemilik dan waktunya. */
const nomor = { kasir0030: "", kasir2330: "", kasirKemarin2330: "", admin1200: "" };

/** Tanggal (YYYY-MM-DD) menurut WIB, bergeser sejumlah hari dari hari ini. */
function tanggalWib(geserHari: number): string {
  const sekarang = new Date(Date.now() + geserHari * 24 * 60 * 60 * 1000);
  return sekarang.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

async function nomorPada(pemilik: StafUji, geserHari: number, jam: string): Promise<string> {
  const { data, error } = await admin.supabase
    .from("penjualan")
    .select("nomor")
    .eq("kasir_id", pemilik.id)
    .eq("waktu", `${tanggalWib(geserHari)}T${jam}:00+07:00`)
    .single();
  expect(error).toBeNull();
  return data!.nomor;
}

beforeAll(async () => {
  [admin, kasir, nonaktif] = await Promise.all([
    masukSebagai("admin"),
    masukSebagai("kasir"),
    masukSebagai("nonaktif"),
  ]);
  [nomor.kasir0030, nomor.kasir2330, nomor.kasirKemarin2330, nomor.admin1200] = await Promise.all([
    nomorPada(kasir, 0, "00:30"),
    nomorPada(kasir, 0, "23:30"),
    nomorPada(kasir, -1, "23:30"),
    nomorPada(admin, 0, "12:00"),
  ]);
});

// ---------------------------------------------------------------------------
// Penjualan hari ini (halaman /staf/penjualan)
// ---------------------------------------------------------------------------

describe("Penjualan hari ini", () => {
  it("'hari ini' menurut WIB: pukul 00.30 dan 23.30 hari ini terhitung, 23.30 kemarin tidak (user story 72)", async () => {
    const { data, error } = await admin.supabase
      .from("penjualan_hari_ini")
      .select("nomor")
      .in("nomor", [nomor.kasir0030, nomor.kasir2330, nomor.kasirKemarin2330]);
    expect(error).toBeNull();
    expect(data!.map((p) => p.nomor).sort()).toEqual([nomor.kasir0030, nomor.kasir2330].sort());
  });

  it("Kasir hanya melihat Penjualan miliknya hari ini", async () => {
    const { data, error } = await kasir.supabase.from("penjualan_hari_ini").select("nomor, kasir_id, nama_kasir");
    expect(error).toBeNull();
    const nomorTerlihat = data!.map((p) => p.nomor);
    expect(nomorTerlihat).toContain(nomor.kasir0030);
    expect(nomorTerlihat).toContain(nomor.kasir2330);
    expect(nomorTerlihat).not.toContain(nomor.kasirKemarin2330);
    expect(nomorTerlihat).not.toContain(nomor.admin1200);
    expect(data!.every((p) => p.kasir_id === kasir.id && p.nama_kasir === "Kasir Uji")).toBe(true);
  });

  it("Admin melihat Penjualan semua Staf hari ini, beserta nama Kasirnya (user story 63)", async () => {
    const { data, error } = await admin.supabase
      .from("penjualan_hari_ini")
      .select("nomor, nama_kasir, total, metode_bayar, status")
      .in("nomor", [nomor.kasir0030, nomor.admin1200]);
    expect(error).toBeNull();
    expect(data!.sort((a, b) => a.nomor.localeCompare(b.nomor))).toEqual(
      [
        { nomor: nomor.kasir0030, nama_kasir: "Kasir Uji", total: 1000, metode_bayar: "qris_transfer", status: "selesai" },
        { nomor: nomor.admin1200, nama_kasir: "Admin Uji", total: 7000, metode_bayar: "qris_transfer", status: "selesai" },
      ].sort((a, b) => a.nomor.localeCompare(b.nomor)),
    );
  });

  it("Pengunjung ditolak; Staf nonaktif mendapat daftar kosong", async () => {
    for (const tampilan of ["penjualan_hari_ini", "rincian_struk"]) {
      const ditolak = await pengunjung.from(tampilan).select("*").limit(1);
      expect(ditolak.error?.code).toBe("42501");

      const kosong = await nonaktif.supabase.from(tampilan).select("*").limit(1);
      expect(kosong.error).toBeNull();
      expect(kosong.data).toEqual([]);
    }
  });
});

// ---------------------------------------------------------------------------
// Struk (halaman /staf/penjualan/[nomor]/struk)
// ---------------------------------------------------------------------------

async function idPenjualan(nomorPenjualan: string): Promise<number> {
  const { data, error } = await admin.supabase.from("penjualan").select("id").eq("nomor", nomorPenjualan).single();
  expect(error).toBeNull();
  return data!.id;
}

describe("Struk", () => {
  it("Kasir mencetak ulang Struk miliknya; nama obat tetap tampil walau obatnya sudah diarsipkan", async () => {
    const id = await idPenjualan(nomor.kasir0030);

    const { data, error } = await kasir.supabase
      .from("rincian_struk")
      .select("nama, satuan_jual, jumlah, harga_satuan, subtotal")
      .eq("penjualan_id", id);
    expect(error).toBeNull();
    expect(data).toEqual([{ nama: "Uji Diarsipkan", satuan_jual: "tube", jumlah: 1, harga_satuan: 1000, subtotal: 1000 }]);

    // Obat yang diarsipkan tetap tidak terbaca Kasir lewat tabel obat (SPEC 4.5).
    const obat = await kasir.supabase.from("obat").select("id").eq("slug", "uji-diarsipkan");
    expect(obat.data).toEqual([]);
  });

  it("Kasir tidak bisa membuka Struk milik Staf lain atau Struk kemarin ('Penjualan tidak ditemukan')", async () => {
    for (const nomorLain of [nomor.admin1200, nomor.kasirKemarin2330]) {
      const penjualan = await kasir.supabase.from("penjualan").select("id").eq("nomor", nomorLain).maybeSingle();
      expect(penjualan.error).toBeNull();
      expect(penjualan.data).toBeNull();

      const rincian = await kasir.supabase
        .from("rincian_struk")
        .select("nama")
        .eq("penjualan_id", await idPenjualan(nomorLain));
      expect(rincian.error).toBeNull();
      expect(rincian.data).toEqual([]);
    }
  });

  it("Admin bisa membuka Struk siapa pun, termasuk Penjualan kemarin, beserta nama Kasirnya", async () => {
    const { data, error } = await admin.supabase
      .from("penjualan")
      .select("nomor, kasir:profil_staf!penjualan_kasir_id_fkey(nama_tampilan)")
      .eq("nomor", nomor.kasirKemarin2330)
      .single();
    expect(error).toBeNull();
    expect(data).toEqual({ nomor: nomor.kasirKemarin2330, kasir: { nama_tampilan: "Kasir Uji" } });

    const rincian = await admin.supabase
      .from("rincian_struk")
      .select("nama, jumlah, subtotal")
      .eq("penjualan_id", await idPenjualan(nomor.kasirKemarin2330));
    expect(rincian.data).toEqual([{ nama: "Uji Jual Bebas", jumlah: 1, subtotal: 2500 }]);
  });
});
