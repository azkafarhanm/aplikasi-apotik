// Tes database untuk Mencatat Penjualan (tiket #8, SPEC 4.4, 4.5, 5.2; ADR 0005).
//
// Tes ini menjadi contoh untuk tes berikutnya (SPEC 5.5):
// - Menguji PERILAKU yang terlihat dari luar (stok, total, pesan penolakan),
//   bukan isi fungsinya. Isi catat_penjualan boleh dirapikan kapan saja selama
//   tes ini tetap lulus.
// - Memanggil database lewat jalur yang sama dengan layar Jual
//   (supabase.rpc("catat_penjualan", ...)) sebagai Kasir, Admin, Staf
//   nonaktif, dan Pengunjung.
// - Bisa diulang: sebelum setiap tes, stok dan harga obat uji-jual-*
//   dikembalikan ke angka awal lewat uji_atur_obat (hanya ada di project uji,
//   lihat supabase/uji/data-uji.sql). Penjualan yang tercipta dibiarkan,
//   karena Penjualan memang tidak boleh dihapus (aturan bisnis 7).
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buatPenghubung, masukSebagai, type StafUji } from "./bantu";

const pengunjung = buatPenghubung();
let admin: StafUji;
let kasir: StafUji;
let nonaktif: StafUji;

/** id obat uji, dibaca sekali dari database (id berbeda di setiap pemasangan). */
const idObat: Record<string, number> = {};

/** Angka awal obat uji-jual-* sebelum setiap tes. Sama dengan data-uji.sql. */
const keadaanAwal = {
  "uji-jual-bebas": { stok: 100, harga: 2500 },
  "uji-jual-kedua": { stok: 100, harga: 7000 },
  "uji-jual-keras": { stok: 100, harga: 5000 },
  "uji-jual-stok-1": { stok: 1, harga: 1000 },
  "uji-jual-kedaluwarsa-hari-ini": { stok: 50, harga: 1000 },
} as const;

type SlugUji = keyof typeof keadaanAwal;

beforeAll(async () => {
  [admin, kasir, nonaktif] = await Promise.all([
    masukSebagai("admin"),
    masukSebagai("kasir"),
    masukSebagai("nonaktif"),
  ]);

  const { data, error } = await admin.supabase.from("obat").select("id, slug").like("slug", "uji-%");
  expect(error).toBeNull();
  for (const baris of data!) {
    idObat[baris.slug] = baris.id;
  }
});

beforeEach(async () => {
  await Promise.all(
    Object.entries(keadaanAwal).map(([slug, awal]) => aturObat(slug as SlugUji, awal.stok, awal.harga)),
  );
});

// ---------------------------------------------------------------------------
// Alat bantu kecil
// ---------------------------------------------------------------------------

async function aturObat(slug: SlugUji, stok: number, harga: number) {
  const { error } = await admin.supabase.rpc("uji_atur_obat", {
    slug_obat: slug,
    stok_baru: stok,
    harga_baru: harga,
  });
  expect(error).toBeNull();
}

async function stok(slug: string): Promise<number> {
  const { data, error } = await admin.supabase.from("obat").select("stok").eq("slug", slug).single();
  expect(error).toBeNull();
  return data!.stok;
}

type Pembayaran =
  | { metode_bayar: "tunai"; uang_diterima: number | null }
  | { metode_bayar: "qris_transfer"; uang_diterima?: number | null };

/** Memanggil catat_penjualan persis seperti layar Jual. */
function jual(
  oleh: SupabaseClient,
  keranjang: Array<Record<string, unknown>>,
  bayar: Pembayaran = { metode_bayar: "qris_transfer" },
  cekResep = false,
) {
  return oleh.rpc("catat_penjualan", {
    keranjang,
    metode_bayar: bayar.metode_bayar,
    uang_diterima: bayar.uang_diterima ?? null,
    cek_resep: cekResep,
  });
}

/** Satu baris keranjang: hanya obat dan jumlah, seperti yang dikirim layar. */
function isi(slug: string, jumlah: number) {
  return { obat_id: idObat[slug], jumlah };
}

// ---------------------------------------------------------------------------
// Penjualan berhasil
// ---------------------------------------------------------------------------

describe("Penjualan berhasil", () => {
  it("stok berkurang, total dan kembalian benar, harga dari database", async () => {
    const { data, error } = await jual(
      kasir.supabase,
      [isi("uji-jual-bebas", 2), isi("uji-jual-kedua", 1)],
      { metode_bayar: "tunai", uang_diterima: 20000 },
    );

    expect(error).toBeNull();
    // 2 × 2.500 + 1 × 7.000 = 12.000; kembalian 20.000 − 12.000 = 8.000
    expect(data).toMatchObject({ total: 12000, uang_diterima: 20000, kembalian: 8000 });
    expect(data.nomor).toMatch(/^PJ-\d{6,}$/);
    expect(await stok("uji-jual-bebas")).toBe(98);
    expect(await stok("uji-jual-kedua")).toBe(99);

    // Yang tersimpan sama dengan yang dikembalikan fungsi.
    const tersimpan = await kasir.supabase
      .from("penjualan")
      .select("total, metode_bayar, uang_diterima, kembalian, status, kasir_id, item_penjualan(obat_id, jumlah, harga_satuan, subtotal)")
      .eq("nomor", data.nomor)
      .single();
    expect(tersimpan.error).toBeNull();
    expect(tersimpan.data).toMatchObject({
      total: 12000,
      metode_bayar: "tunai",
      uang_diterima: 20000,
      kembalian: 8000,
      status: "selesai",
      kasir_id: kasir.id,
    });
    expect(tersimpan.data!.item_penjualan).toEqual(
      expect.arrayContaining([
        { obat_id: idObat["uji-jual-bebas"], jumlah: 2, harga_satuan: 2500, subtotal: 5000 },
        { obat_id: idObat["uji-jual-kedua"], jumlah: 1, harga_satuan: 7000, subtotal: 7000 },
      ]),
    );
  });

  it("harga yang dikirim dari layar diabaikan (aturan bisnis 6)", async () => {
    const { data, error } = await jual(kasir.supabase, [
      { ...isi("uji-jual-bebas", 2), harga_satuan: 1, harga_jual: 1, subtotal: 2 },
    ]);
    expect(error).toBeNull();
    expect(data.total).toBe(5000);
    expect(data.item).toEqual([expect.objectContaining({ harga_satuan: 2500, subtotal: 5000 })]);
  });

  it("obat yang sama dikirim dua kali dijumlahkan menjadi satu Item penjualan", async () => {
    const { data, error } = await jual(kasir.supabase, [isi("uji-jual-bebas", 2), isi("uji-jual-bebas", 3)]);
    expect(error).toBeNull();
    expect(data.item).toEqual([expect.objectContaining({ jumlah: 5, subtotal: 12500 })]);
    expect(await stok("uji-jual-bebas")).toBe(95);
  });

  it("QRIS/transfer: uang diterima dan kembalian kosong", async () => {
    const { data, error } = await jual(kasir.supabase, [isi("uji-jual-bebas", 1)], {
      metode_bayar: "qris_transfer",
    });
    expect(error).toBeNull();
    expect(data).toMatchObject({ total: 2500, metode_bayar: "qris_transfer", uang_diterima: null, kembalian: null });
  });

  it("tunai dengan uang pas: kembalian 0", async () => {
    const { data, error } = await jual(kasir.supabase, [isi("uji-jual-bebas", 1)], {
      metode_bayar: "tunai",
      uang_diterima: 2500,
    });
    expect(error).toBeNull();
    expect(data.kembalian).toBe(0);
  });

  it("Admin juga bisa mencatat Penjualan (F-06)", async () => {
    const { error } = await jual(admin.supabase, [isi("uji-jual-bebas", 1)]);
    expect(error).toBeNull();
    expect(await stok("uji-jual-bebas")).toBe(99);
  });

  it("obat yang kedaluwarsa hari ini masih boleh dijual", async () => {
    const { error } = await jual(kasir.supabase, [isi("uji-jual-kedaluwarsa-hari-ini", 1)]);
    expect(error).toBeNull();
    expect(await stok("uji-jual-kedaluwarsa-hari-ini")).toBe(49);
  });
});

// ---------------------------------------------------------------------------
// Penolakan: pesan bahasa sehari-hari, dan tidak ada yang berubah
// ---------------------------------------------------------------------------

describe("Penjualan ditolak", () => {
  const kasus: Array<{
    nama: string;
    keranjang: () => Array<Record<string, unknown>>;
    bayar?: Pembayaran;
    cekResep?: boolean;
    pesan: string;
  }> = [
    { nama: "keranjang kosong", keranjang: () => [], pesan: "Keranjang masih kosong." },
    { nama: "jumlah 0", keranjang: () => [isi("uji-jual-bebas", 0)], pesan: "Jumlah Uji Jual Bebas minimal 1." },
    { nama: "jumlah minus", keranjang: () => [isi("uji-jual-bebas", -2)], pesan: "Jumlah Uji Jual Bebas minimal 1." },
    {
      nama: "obat diarsipkan",
      keranjang: () => [isi("uji-diarsipkan", 1)],
      pesan: "Uji Diarsipkan sudah diarsipkan dan tidak bisa dijual.",
    },
    { nama: "obat Habis (stok 0)", keranjang: () => [isi("uji-stok-0", 1)], pesan: "Stok Uji Stok 0 habis." },
    {
      nama: "obat Sudah kedaluwarsa",
      keranjang: () => [isi("uji-kedaluwarsa-kemarin", 1)],
      pesan: "Uji Kedaluwarsa Kemarin sudah kedaluwarsa dan tidak boleh dijual.",
    },
    {
      nama: "stok kurang",
      keranjang: () => [isi("uji-jual-bebas", 101)],
      pesan: "Stok Uji Jual Bebas tinggal 100 strip.",
    },
    {
      nama: "obat tidak dikenal",
      keranjang: () => [{ obat_id: 999999999, jumlah: 1 }],
      pesan: "Ada obat di keranjang yang tidak dikenal. Muat ulang halaman Jual.",
    },
    {
      nama: "Obat keras tanpa Cek resep",
      keranjang: () => [isi("uji-jual-bebas", 1), isi("uji-jual-keras", 1)],
      cekResep: false,
      pesan: "Ada Obat keras (Uji Jual Keras). Centang Cek resep setelah memeriksa resep dokter.",
    },
    {
      nama: "tunai dengan uang kurang",
      keranjang: () => [isi("uji-jual-bebas", 2)],
      bayar: { metode_bayar: "tunai", uang_diterima: 4999 },
      pesan: "Uang diterima kurang. Total Rp5.000.",
    },
    {
      nama: "tunai tanpa uang diterima",
      keranjang: () => [isi("uji-jual-bebas", 1)],
      bayar: { metode_bayar: "tunai", uang_diterima: null },
      pesan: "Isi uang diterima untuk pembayaran tunai.",
    },
    {
      nama: "QRIS/transfer dengan uang diterima terisi",
      keranjang: () => [isi("uji-jual-bebas", 1)],
      bayar: { metode_bayar: "qris_transfer", uang_diterima: 5000 },
      pesan: "QRIS/transfer tidak memakai uang diterima.",
    },
  ];

  it.each(kasus)("$nama", async ({ keranjang, bayar, cekResep, pesan }) => {
    const { data, error } = await jual(kasir.supabase, keranjang(), bayar, cekResep);
    expect(data).toBeNull();
    // P0001 = penolakan dari aturan kita (RAISE EXCEPTION). Layar menampilkan
    // pesan berkode ini apa adanya.
    expect(error?.code).toBe("P0001");
    expect(error?.message).toBe(pesan);
    expect(await stok("uji-jual-bebas")).toBe(100);
    expect(await stok("uji-jual-keras")).toBe(100);
  });

  it("Obat keras dengan Cek resep diterima", async () => {
    const { error } = await jual(kasir.supabase, [isi("uji-jual-keras", 1)], undefined, true);
    expect(error).toBeNull();
    expect(await stok("uji-jual-keras")).toBe(99);
  });

  it("tanpa Obat keras, Cek resep tidak wajib", async () => {
    const { error } = await jual(kasir.supabase, [isi("uji-jual-bebas", 1)], undefined, false);
    expect(error).toBeNull();
  });

  it("utuh atau tidak sama sekali: satu obat Habis membatalkan seluruh keranjang (NF-06)", async () => {
    // Yang dihitung hanya Item penjualan obat uji-jual-bebas, bukan semua
    // Penjualan: file tes lain (misalnya pembatalan.test.ts) berjalan bersamaan
    // dan mencatat Penjualan di database uji yang sama (#38). Obat ini hanya
    // dijual oleh file ini, dan tes di dalam satu file berjalan berurutan.
    const hitungItem = () =>
      admin.supabase
        .from("item_penjualan")
        .select("id", { count: "exact", head: true })
        .eq("obat_id", idObat["uji-jual-bebas"]);
    const jumlahSebelum = await hitungItem();
    expect(jumlahSebelum.error).toBeNull();

    const { error } = await jual(kasir.supabase, [isi("uji-jual-bebas", 2), isi("uji-stok-0", 1)]);
    expect(error?.message).toBe("Stok Uji Stok 0 habis.");

    // Obat yang valid tidak ikut berkurang, dan tidak ada Item penjualan baru.
    expect(await stok("uji-jual-bebas")).toBe(100);
    const jumlahSesudah = await hitungItem();
    expect(jumlahSesudah.count).toBe(jumlahSebelum.count);
  });
});

// ---------------------------------------------------------------------------
// Dua Kasir bersamaan (M-01, ADR 0005)
// ---------------------------------------------------------------------------

describe("Dua Kasir bersamaan", () => {
  // Dua sesi berbeda (Kasir uji dan Admin uji) menjual obat terakhir pada saat
  // yang sama. Tanpa penguncian baris, keduanya bisa sama-sama melihat
  // "stok 1" dan stok menjadi −1. Diulang 3 ronde supaya lulusnya bukan
  // kebetulan urutan jaringan.
  it.each([1, 2, 3])("ronde %i: obat stok 1 dijual serentak → tepat satu berhasil, stok akhir 0", async () => {
    await aturObat("uji-jual-stok-1", 1, 1000);

    const hasil = await Promise.all([
      jual(kasir.supabase, [isi("uji-jual-stok-1", 1)]),
      jual(admin.supabase, [isi("uji-jual-stok-1", 1)]),
    ]);

    const berhasil = hasil.filter((h) => h.error === null);
    const ditolak = hasil.filter((h) => h.error !== null);
    expect(berhasil).toHaveLength(1);
    expect(ditolak).toHaveLength(1);
    expect(ditolak[0].error?.message).toBe("Stok Uji Jual Stok 1 habis.");
    expect(await stok("uji-jual-stok-1")).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Harga yang tercatat tidak berubah (NF-06)
// ---------------------------------------------------------------------------

describe("Harga tercatat", () => {
  it("mengubah harga jual setelah Penjualan tidak mengubah Penjualan lama", async () => {
    const { data } = await jual(kasir.supabase, [isi("uji-jual-bebas", 2)]);
    await aturObat("uji-jual-bebas", 100, 9999);

    const lama = await admin.supabase
      .from("penjualan")
      .select("total, item_penjualan(harga_satuan, subtotal)")
      .eq("nomor", data.nomor)
      .single();
    expect(lama.data).toEqual({ total: 5000, item_penjualan: [{ harga_satuan: 2500, subtotal: 5000 }] });
  });

  it("harga baru langsung dipakai Penjualan berikutnya (layar memberi tahu dari rincian ini)", async () => {
    await aturObat("uji-jual-bebas", 100, 3000);
    const { data } = await jual(kasir.supabase, [{ ...isi("uji-jual-bebas", 1), harga_satuan: 2500 }]);
    expect(data.item).toEqual([expect.objectContaining({ harga_satuan: 3000 })]);
    expect(data.total).toBe(3000);
  });
});

// ---------------------------------------------------------------------------
// Hak akses (SPEC 4.5)
// ---------------------------------------------------------------------------

describe("Hak akses Penjualan", () => {
  it("Pengunjung tidak bisa memanggil catat_penjualan", async () => {
    const { data, error } = await jual(pengunjung, [isi("uji-jual-bebas", 1)]);
    expect(data).toBeNull();
    expect(["42501", "PGRST202"]).toContain(error?.code);
    expect(await stok("uji-jual-bebas")).toBe(100);
  });

  it("Staf nonaktif ditolak", async () => {
    const { error } = await jual(nonaktif.supabase, [isi("uji-jual-bebas", 1)]);
    expect(error?.message).toBe("Akun ini tidak bisa mencatat Penjualan.");
    expect(await stok("uji-jual-bebas")).toBe(100);
  });

  it("Pengunjung tidak bisa membaca penjualan, item_penjualan, atau obat_kasir", async () => {
    for (const tabel of ["penjualan", "item_penjualan", "obat_kasir"]) {
      const { data, error } = await pengunjung.from(tabel).select("*").limit(1);
      expect(data).toBeNull();
      expect(error?.code).toBe("42501");
    }
  });

  it("Kasir tidak bisa menulis langsung ke tabel Penjualan (tambah, ubah, hapus)", async () => {
    const { data: punyaKasir } = await jual(kasir.supabase, [isi("uji-jual-bebas", 1)]);

    const tambah = await kasir.supabase.from("penjualan").insert({
      kasir_id: kasir.id,
      total: 1,
      metode_bayar: "qris_transfer",
    });
    expect(tambah.error?.code).toBe("42501");

    const ubah = await kasir.supabase.from("penjualan").update({ total: 1 }).eq("nomor", punyaKasir.nomor);
    expect(ubah.error?.code).toBe("42501");

    const batal = await kasir.supabase
      .from("penjualan")
      .update({ status: "dibatalkan" })
      .eq("nomor", punyaKasir.nomor);
    expect(batal.error?.code).toBe("42501");

    const hapus = await kasir.supabase.from("penjualan").delete().eq("nomor", punyaKasir.nomor);
    expect(hapus.error?.code).toBe("42501");

    const tambahItem = await kasir.supabase.from("item_penjualan").insert({
      penjualan_id: 1,
      obat_id: idObat["uji-jual-bebas"],
      jumlah: 1,
      harga_satuan: 1,
      subtotal: 1,
    });
    expect(tambahItem.error?.code).toBe("42501");

    const ubahItem = await kasir.supabase.from("item_penjualan").update({ harga_satuan: 1 }).eq("obat_id", idObat["uji-jual-bebas"]);
    expect(ubahItem.error?.code).toBe("42501");

    // Penjualan tetap seperti semula.
    const { data } = await admin.supabase.from("penjualan").select("total, status").eq("nomor", punyaKasir.nomor).single();
    expect(data).toEqual({ total: 2500, status: "selesai" });
  });

  it("Admin pun tidak bisa menghapus Penjualan (aturan bisnis 7)", async () => {
    const { data: punyaAdmin } = await jual(admin.supabase, [isi("uji-jual-bebas", 1)]);
    const hapus = await admin.supabase.from("penjualan").delete().eq("nomor", punyaAdmin.nomor);
    expect(hapus.error?.code).toBe("42501");
  });

  it("Kasir hanya melihat Penjualan miliknya hari ini; Admin melihat semua", async () => {
    const [{ data: punyaKasir }, { data: punyaAdmin }] = await Promise.all([
      jual(kasir.supabase, [isi("uji-jual-bebas", 1)]),
      jual(admin.supabase, [isi("uji-jual-kedua", 1)]),
    ]);

    const dilihatKasir = await kasir.supabase.from("penjualan").select("nomor, kasir_id, waktu");
    expect(dilihatKasir.error).toBeNull();
    const nomorKasir = dilihatKasir.data!.map((p) => p.nomor);
    expect(nomorKasir).toContain(punyaKasir.nomor);
    expect(nomorKasir).not.toContain(punyaAdmin.nomor);
    // Semuanya milik Kasir ini, dan tidak ada Penjualan kemarin (data uji
    // menyimpan satu Penjualan Kasir uji bertanggal 1 Januari 2026).
    expect(dilihatKasir.data!.every((p) => p.kasir_id === kasir.id)).toBe(true);
    const hariIniWib = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
    for (const p of dilihatKasir.data!) {
      expect(new Date(p.waktu).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })).toBe(hariIniWib);
    }

    const dilihatAdmin = await admin.supabase
      .from("penjualan")
      .select("nomor")
      .in("nomor", [punyaKasir.nomor, punyaAdmin.nomor]);
    expect(dilihatAdmin.data!.map((p) => p.nomor).sort()).toEqual([punyaKasir.nomor, punyaAdmin.nomor].sort());

    const lama = await admin.supabase
      .from("penjualan")
      .select("kasir_id")
      .lt("waktu", "2026-01-02T00:00:00+07:00")
      .eq("kasir_id", kasir.id);
    expect(lama.data!.length).toBeGreaterThan(0);
  });

  it("Item penjualan hanya terlihat bila Penjualannya terlihat", async () => {
    const { data: punyaAdmin } = await jual(admin.supabase, [isi("uji-jual-kedua", 1)]);
    const { data: idAdmin } = await admin.supabase.from("penjualan").select("id").eq("nomor", punyaAdmin.nomor).single();

    const { data, error } = await kasir.supabase.from("item_penjualan").select("id").eq("penjualan_id", idAdmin!.id);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("Staf nonaktif tidak melihat Penjualan apa pun", async () => {
    const { data, error } = await nonaktif.supabase.from("penjualan").select("id");
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Daftar obat untuk layar Jual (tampilan obat_kasir)
// ---------------------------------------------------------------------------

describe("Daftar obat layar Jual", () => {
  it("Kasir melihat stok persis dan Status stok; obat diarsipkan tidak muncul", async () => {
    const { data, error } = await kasir.supabase
      .from("obat_kasir")
      .select("nama, stok, status_stok, sudah_kedaluwarsa")
      .in("id", [
        idObat["uji-jual-stok-1"],
        idObat["uji-kedaluwarsa-kemarin"],
        idObat["uji-diarsipkan"],
      ]);
    expect(error).toBeNull();
    expect(data).toHaveLength(2);
    expect(data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ nama: "Uji Jual Stok 1", stok: 1, status_stok: "hampir_habis", sudah_kedaluwarsa: false }),
        expect.objectContaining({ nama: "Uji Kedaluwarsa Kemarin", status_stok: "habis", sudah_kedaluwarsa: true }),
      ]),
    );
  });

  it("Staf nonaktif mendapat daftar kosong", async () => {
    const { data, error } = await nonaktif.supabase.from("obat_kasir").select("id");
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});
