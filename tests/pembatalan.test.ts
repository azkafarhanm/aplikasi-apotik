// Tes database untuk Pembatalan Penjualan (tiket #13, SPEC 4.4, 4.5, 5.2;
// ADR 0003 dan 0005). Gayanya mengikuti tests/penjualan.test.ts (SPEC 5.5).
//
// - Setiap tes mencatat Penjualannya sendiri lewat catat_penjualan, lalu
//   membatalkannya lewat batalkan_penjualan, persis seperti layar.
// - Obat yang dipakai hanya uji-jual-batal-*, terpisah dari obat tes
//   Penjualan, karena file tes berjalan bersamaan dan penjualan.test.ts
//   menyetel ulang stok obatnya sendiri sebelum setiap tes.
// - Penjualan uji berjam tetap (penjualan-hari-ini.test.ts) tidak disentuh.
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buatPenghubung, masukSebagai, type StafUji } from "./bantu";

const pengunjung = buatPenghubung();
let admin: StafUji;
let adminKedua: StafUji;
let kasir: StafUji;
let nonaktif: StafUji;

const idObat: Record<string, number> = {};

/** Angka awal obat uji-jual-batal-* sebelum setiap tes. Sama dengan data-uji.sql. */
const keadaanAwal = {
  "uji-jual-batal-a": { stok: 100, harga: 3000 },
  "uji-jual-batal-b": { stok: 100, harga: 4000 },
  "uji-jual-batal-arsip": { stok: 100, harga: 2000 },
} as const;

type SlugUji = keyof typeof keadaanAwal;

beforeAll(async () => {
  // Admin kedua = sesi login kedua akun Admin uji, untuk tes dua Admin bersamaan.
  [admin, adminKedua, kasir, nonaktif] = await Promise.all([
    masukSebagai("admin"),
    masukSebagai("admin"),
    masukSebagai("kasir"),
    masukSebagai("nonaktif"),
  ]);

  const { data, error } = await admin.supabase.from("obat").select("id, slug").like("slug", "uji-jual-batal-%");
  expect(error).toBeNull();
  for (const baris of data!) {
    idObat[baris.slug] = baris.id;
  }
});

beforeEach(async () => {
  await Promise.all(
    Object.entries(keadaanAwal).map(async ([slug, awal]) => {
      const atur = await admin.supabase.rpc("uji_atur_obat", {
        slug_obat: slug,
        stok_baru: awal.stok,
        harga_baru: awal.harga,
      });
      expect(atur.error).toBeNull();
      const arsip = await admin.supabase.rpc("uji_arsipkan_obat", { slug_obat: slug, diarsipkan_baru: false });
      expect(arsip.error).toBeNull();
    }),
  );
});

// ---------------------------------------------------------------------------
// Alat bantu kecil
// ---------------------------------------------------------------------------

async function stok(slug: SlugUji): Promise<number> {
  const { data, error } = await admin.supabase.from("obat").select("stok").eq("slug", slug).single();
  expect(error).toBeNull();
  return data!.stok;
}

/** Mencatat Penjualan QRIS/transfer seperti layar Jual; mengembalikan nomornya. */
async function jual(oleh: StafUji, isi: Array<[SlugUji, number]>): Promise<string> {
  const { data, error } = await oleh.supabase.rpc("catat_penjualan", {
    keranjang: isi.map(([slug, jumlah]) => ({ obat_id: idObat[slug], jumlah })),
    metode_bayar: "qris_transfer",
    uang_diterima: null,
    cek_resep: false,
  });
  expect(error).toBeNull();
  return data.nomor;
}

/** Memanggil batalkan_penjualan persis seperti halaman Penjualan hari ini. */
function batalkan(oleh: SupabaseClient, nomor: string, alasan: string) {
  return oleh.rpc("batalkan_penjualan", { nomor, alasan });
}

async function penjualan(nomor: string) {
  const { data, error } = await admin.supabase
    .from("penjualan")
    .select("status, dibatalkan_oleh, dibatalkan_pada, alasan_batal, total")
    .eq("nomor", nomor)
    .single();
  expect(error).toBeNull();
  return data!;
}

// ---------------------------------------------------------------------------
// Pembatalan berhasil
// ---------------------------------------------------------------------------

describe("Pembatalan berhasil", () => {
  it("stok setiap Item penjualan kembali; status, siapa, kapan, alasan tercatat", async () => {
    const nomor = await jual(kasir, [
      ["uji-jual-batal-a", 2],
      ["uji-jual-batal-b", 3],
    ]);
    expect(await stok("uji-jual-batal-a")).toBe(98);
    expect(await stok("uji-jual-batal-b")).toBe(97);

    const sebelum = Date.now();
    const { data, error } = await batalkan(admin.supabase, nomor, "Kasir salah ketik jumlah");
    expect(error).toBeNull();

    expect(await stok("uji-jual-batal-a")).toBe(100);
    expect(await stok("uji-jual-batal-b")).toBe(100);

    const tersimpan = await penjualan(nomor);
    expect(tersimpan).toMatchObject({
      status: "dibatalkan",
      dibatalkan_oleh: admin.id,
      alasan_batal: "Kasir salah ketik jumlah",
      total: 18000, // Penjualan tetap tercatat apa adanya (aturan bisnis 7)
    });
    // Waktu server dan waktu laptop bisa selisih sedikit; cukup "baru saja".
    expect(Math.abs(new Date(tersimpan.dibatalkan_pada!).getTime() - sebelum)).toBeLessThan(60_000);

    // Rincian stok yang kembali, untuk pesan di layar Admin.
    expect(data).toMatchObject({
      nomor,
      alasan: "Kasir salah ketik jumlah",
      item: [
        { nama: "Uji Jual Batal A", satuan_jual: "strip", jumlah: 2 },
        { nama: "Uji Jual Batal B", satuan_jual: "botol", jumlah: 3 },
      ],
    });
  });

  it("alasan disimpan tanpa spasi dan baris kosong di ujungnya", async () => {
    const nomor = await jual(kasir, [["uji-jual-batal-a", 1]]);
    const { error } = await batalkan(admin.supabase, nomor, "  \n Pembeli batal membeli \n ");
    expect(error).toBeNull();
    expect((await penjualan(nomor)).alasan_batal).toBe("Pembeli batal membeli");
  });

  it("alasan tepat 200 huruf diterima", async () => {
    const nomor = await jual(kasir, [["uji-jual-batal-a", 1]]);
    const { error } = await batalkan(admin.supabase, nomor, "a".repeat(200));
    expect(error).toBeNull();
  });

  it("Admin bisa membatalkan Penjualan yang ia catat sendiri", async () => {
    const nomor = await jual(admin, [["uji-jual-batal-b", 1]]);
    const { error } = await batalkan(admin.supabase, nomor, "Salah pilih obat");
    expect(error).toBeNull();
    expect(await stok("uji-jual-batal-b")).toBe(100);
  });

  it("stok tetap kembali walau obatnya sudah diarsipkan", async () => {
    const nomor = await jual(kasir, [["uji-jual-batal-arsip", 4]]);
    const arsip = await admin.supabase.rpc("uji_arsipkan_obat", {
      slug_obat: "uji-jual-batal-arsip",
      diarsipkan_baru: true,
    });
    expect(arsip.error).toBeNull();

    const { error } = await batalkan(admin.supabase, nomor, "Salah input");
    expect(error).toBeNull();
    expect(await stok("uji-jual-batal-arsip")).toBe(100);
  });

  it("Penjualan Dibatalkan tetap tampil di Penjualan hari ini, dengan kapan, siapa, dan alasannya", async () => {
    const nomor = await jual(kasir, [["uji-jual-batal-a", 1]]);
    await batalkan(admin.supabase, nomor, "Pembeli batal");

    const lihatAdmin = await admin.supabase
      .from("penjualan_hari_ini")
      .select("status, alasan_batal, nama_pembatal, dibatalkan_pada")
      .eq("nomor", nomor)
      .single();
    expect(lihatAdmin.error).toBeNull();
    expect(lihatAdmin.data).toMatchObject({
      status: "dibatalkan",
      alasan_batal: "Pembeli batal",
      nama_pembatal: "Admin Uji",
    });
    expect(lihatAdmin.data!.dibatalkan_pada).not.toBeNull();

    // Kasir melihat Penjualannya Dibatalkan beserta alasannya. Nama Admin
    // tidak terbaca (RLS profil_staf); layar menulis "Admin".
    const lihatKasir = await kasir.supabase
      .from("penjualan_hari_ini")
      .select("status, alasan_batal, nama_pembatal")
      .eq("nomor", nomor)
      .single();
    expect(lihatKasir.error).toBeNull();
    expect(lihatKasir.data).toEqual({ status: "dibatalkan", alasan_batal: "Pembeli batal", nama_pembatal: null });
  });
});

// ---------------------------------------------------------------------------
// Penolakan: pesan kata per kata, dan tidak ada yang berubah
// ---------------------------------------------------------------------------

describe("Pembatalan ditolak", () => {
  it("alasan kosong (juga bila hanya spasi atau baris kosong)", async () => {
    const nomor = await jual(kasir, [["uji-jual-batal-a", 2]]);
    for (const alasan of ["", "   ", " \n\t "]) {
      const { error } = await batalkan(admin.supabase, nomor, alasan);
      expect(error?.code).toBe("P0001");
      expect(error?.message).toBe("Tulis alasan pembatalan.");
    }
    expect((await penjualan(nomor)).status).toBe("selesai");
    expect(await stok("uji-jual-batal-a")).toBe(98);
  });

  it("alasan lebih dari 200 huruf", async () => {
    const nomor = await jual(kasir, [["uji-jual-batal-a", 1]]);
    const { error } = await batalkan(admin.supabase, nomor, "a".repeat(201));
    expect(error?.message).toBe("Alasan pembatalan paling panjang 200 huruf.");
    expect((await penjualan(nomor)).status).toBe("selesai");
  });

  it("Nomor Penjualan tidak ada", async () => {
    const { error } = await batalkan(admin.supabase, "PJ-999999", "Salah input");
    expect(error?.message).toBe("Penjualan PJ-999999 tidak ditemukan.");
  });

  it("membatalkan dua kali: stok hanya kembali sekali, catatan pertama tetap", async () => {
    const nomor = await jual(kasir, [["uji-jual-batal-a", 2]]);
    expect((await batalkan(admin.supabase, nomor, "Alasan pertama")).error).toBeNull();

    const { error } = await batalkan(admin.supabase, nomor, "Alasan kedua");
    expect(error?.message).toBe(`${nomor} sudah dibatalkan sebelumnya.`);
    expect(await stok("uji-jual-batal-a")).toBe(100);
    expect((await penjualan(nomor)).alasan_batal).toBe("Alasan pertama");
  });

  it("Penjualan hari sebelumnya tidak bisa dibatalkan", async () => {
    // Penjualan lama milik Kasir uji, 1 Januari 2026 (data-uji.sql).
    const { data: lama, error: galat } = await admin.supabase
      .from("penjualan")
      .select("nomor")
      .eq("waktu", "2026-01-01T03:00:00+00:00")
      .single();
    expect(galat).toBeNull();

    const { error } = await batalkan(admin.supabase, lama!.nomor, "Coba");
    expect(error?.message).toBe(`${lama!.nomor} bukan Penjualan hari ini, jadi tidak bisa dibatalkan.`);
    expect((await penjualan(lama!.nomor)).status).toBe("selesai");
  });

  it("dua Admin membatalkan bersamaan: tepat satu berhasil, stok kembali sekali", async () => {
    for (let ronde = 0; ronde < 3; ronde++) {
      const nomor = await jual(kasir, [["uji-jual-batal-b", 5]]);
      const stokSebelum = await stok("uji-jual-batal-b");

      const hasil = await Promise.all([
        batalkan(admin.supabase, nomor, "Admin pertama"),
        batalkan(adminKedua.supabase, nomor, "Admin kedua"),
      ]);
      const berhasil = hasil.filter((h) => h.error === null);
      const ditolak = hasil.filter((h) => h.error !== null);
      expect(berhasil).toHaveLength(1);
      expect(ditolak[0].error?.message).toBe(`${nomor} sudah dibatalkan sebelumnya.`);
      expect(await stok("uji-jual-batal-b")).toBe(stokSebelum + 5);
    }
  });
});

// ---------------------------------------------------------------------------
// Hak akses (SPEC 4.5): hanya Admin aktif
// ---------------------------------------------------------------------------

describe("Hak akses Pembatalan", () => {
  it("Kasir tidak bisa membatalkan, termasuk Penjualannya sendiri", async () => {
    const nomor = await jual(kasir, [["uji-jual-batal-a", 1]]);
    const { error } = await batalkan(kasir.supabase, nomor, "Salah input");
    expect(error?.code).toBe("P0001");
    expect(error?.message).toBe("Hanya Admin yang bisa membatalkan Penjualan.");
    expect((await penjualan(nomor)).status).toBe("selesai");
    expect(await stok("uji-jual-batal-a")).toBe(99);
  });

  it("Kasir mendapat pesan yang sama untuk nomor yang tidak ada (tidak bisa menebak nomor)", async () => {
    const { error } = await batalkan(kasir.supabase, "PJ-999999", "Salah input");
    expect(error?.message).toBe("Hanya Admin yang bisa membatalkan Penjualan.");
  });

  it("Staf nonaktif ditolak", async () => {
    const nomor = await jual(kasir, [["uji-jual-batal-a", 1]]);
    const { error } = await batalkan(nonaktif.supabase, nomor, "Salah input");
    expect(error?.message).toBe("Hanya Admin yang bisa membatalkan Penjualan.");
    expect((await penjualan(nomor)).status).toBe("selesai");
  });

  it("Pengunjung tidak bisa memanggil batalkan_penjualan", async () => {
    const nomor = await jual(kasir, [["uji-jual-batal-a", 1]]);
    const { data, error } = await batalkan(pengunjung, nomor, "Salah input");
    expect(data).toBeNull();
    expect(["42501", "PGRST202"]).toContain(error?.code);
    expect((await penjualan(nomor)).status).toBe("selesai");
  });

  it("Admin pun tidak bisa mengubah tabel penjualan secara langsung", async () => {
    const nomor = await jual(kasir, [["uji-jual-batal-a", 1]]);
    const ubah = await admin.supabase
      .from("penjualan")
      .update({ status: "dibatalkan", alasan_batal: "lewat jalan pintas" })
      .eq("nomor", nomor);
    expect(ubah.error?.code).toBe("42501");
    expect((await penjualan(nomor)).status).toBe("selesai");
    expect(await stok("uji-jual-batal-a")).toBe(99);
  });
});
