// Tes database untuk Katalog (tiket #2, SPEC 5.2).
// Tes berperan sebagai Pengunjung: tersambung ke project apotikku-uji dengan
// kunci publik, persis seperti halaman Katalog. Data uji: supabase/uji/data-uji.sql.
import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_UJI_URL;
const kunciPublik = process.env.SUPABASE_UJI_PUBLISHABLE_KEY;

if (!url || !kunciPublik) {
  throw new Error(
    "Isi SUPABASE_UJI_URL dan SUPABASE_UJI_PUBLISHABLE_KEY (alamat dan kunci publik project apotikku-uji).",
  );
}

const pengunjung = createClient(url, kunciPublik, {
  auth: { persistSession: false },
});

async function statusStok(slug: string) {
  const { data, error } = await pengunjung
    .from("katalog")
    .select("status_stok")
    .eq("slug", slug)
    .single();
  expect(error).toBeNull();
  return data!.status_stok;
}

describe("Pengunjung membaca katalog", () => {
  it("bisa membaca katalog tanpa login", async () => {
    const { data, error } = await pengunjung.from("katalog").select("*");
    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThan(0);
  });

  it("kolom katalog tidak memuat stok, harga acuan, atau tanggal kedaluwarsa", async () => {
    const { data, error } = await pengunjung.from("katalog").select("*").limit(1);
    expect(error).toBeNull();
    expect(Object.keys(data![0]).sort()).toEqual(
      [
        "bentuk",
        "golongan",
        "harga_jual",
        "isi_per_satuan",
        "kegunaan",
        "keluhan",
        "nama",
        "satuan_jual",
        "slug",
        "status_stok",
      ].sort(),
    );
  });

  it("tidak bisa meminta kolom rahasia secara langsung", async () => {
    for (const kolom of ["stok", "harga_acuan", "tanggal_kedaluwarsa", "diarsipkan", "id"]) {
      const { data, error } = await pengunjung.from("katalog").select(kolom);
      expect(data, kolom).toBeNull();
      expect(error, kolom).not.toBeNull();
    }
  });

  it("obat yang diarsipkan tidak muncul", async () => {
    const { data, error } = await pengunjung
      .from("katalog")
      .select("slug")
      .eq("slug", "uji-diarsipkan");
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});

describe("Pengunjung tidak bisa menyentuh data lain", () => {
  it("tidak bisa membaca tabel obat", async () => {
    const { data, error } = await pengunjung.from("obat").select("*");
    expect(data).toBeNull();
    expect(error?.code).toBe("42501"); // 42501 = izin ditolak
  });

  it("tidak bisa menambah obat, baik lewat tabel maupun lewat katalog", async () => {
    const obatBaru = {
      nama: "Obat Selundupan",
      bentuk: "tablet",
      keluhan: "demam_nyeri",
      golongan: "bebas",
      satuan_jual: "strip",
      isi_per_satuan: "10 tablet",
      kegunaan: "Tidak boleh masuk.",
      harga_jual: 1,
    };
    const lewatTabel = await pengunjung
      .from("obat")
      .insert({ ...obatBaru, stok: 1, tanggal_kedaluwarsa: "2099-01-01" });
    expect(lewatTabel.error?.code).toBe("42501");

    const lewatKatalog = await pengunjung.from("katalog").insert(obatBaru);
    expect(lewatKatalog.error?.code).toBe("42501");
  });

  it("tidak bisa mengubah harga atau stok", async () => {
    const lewatTabel = await pengunjung
      .from("obat")
      .update({ harga_jual: 1, stok: 999 })
      .eq("slug", "uji-stok-21");
    expect(lewatTabel.error?.code).toBe("42501");

    const lewatKatalog = await pengunjung
      .from("katalog")
      .update({ harga_jual: 1 })
      .eq("slug", "uji-stok-21");
    expect(lewatKatalog.error?.code).toBe("42501");
  });

  it("tidak bisa menghapus obat", async () => {
    const lewatTabel = await pengunjung.from("obat").delete().eq("slug", "uji-stok-21");
    expect(lewatTabel.error?.code).toBe("42501");

    const lewatKatalog = await pengunjung.from("katalog").delete().eq("slug", "uji-stok-21");
    expect(lewatKatalog.error?.code).toBe("42501");
  });

  it("tidak bisa memanggil fungsi database", async () => {
    const statusStok = await pengunjung.rpc("status_stok", {
      stok: 5,
      tanggal_kedaluwarsa: "2099-01-01",
    });
    expect(statusStok.error).not.toBeNull();

    const hariIni = await pengunjung.rpc("hari_ini");
    expect(hariIni.error).not.toBeNull();
  });

  it("percobaan di atas tidak mengubah data", async () => {
    const { data } = await pengunjung
      .from("katalog")
      .select("harga_jual, status_stok")
      .eq("slug", "uji-stok-21")
      .single();
    expect(data).toEqual({ harga_jual: 1000, status_stok: "tersedia" });

    const selundupan = await pengunjung
      .from("katalog")
      .select("slug")
      .ilike("nama", "%selundupan%");
    expect(selundupan.data).toEqual([]);
  });
});

describe("Batas Status stok (PRD aturan bisnis 1–2)", () => {
  it("stok 0 → Habis", async () => {
    expect(await statusStok("uji-stok-0")).toBe("habis");
  });

  it("stok 1 → Hampir habis", async () => {
    expect(await statusStok("uji-stok-1")).toBe("hampir_habis");
  });

  it("stok 20 → Hampir habis", async () => {
    expect(await statusStok("uji-stok-20")).toBe("hampir_habis");
  });

  it("stok 21 → Tersedia", async () => {
    expect(await statusStok("uji-stok-21")).toBe("tersedia");
  });

  it("kedaluwarsa kemarin (WIB) → Habis walaupun stoknya 50", async () => {
    expect(await statusStok("uji-kedaluwarsa-kemarin")).toBe("habis");
  });

  it("kedaluwarsa hari ini (WIB) → mengikuti stok (50 → Tersedia)", async () => {
    expect(await statusStok("uji-kedaluwarsa-hari-ini")).toBe("tersedia");
  });
});
