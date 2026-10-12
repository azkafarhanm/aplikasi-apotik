// Tes database untuk login Staf (tiket #6, SPEC 4.5 dan 5.2).
// Tes berperan sebagai Pengunjung, Kasir, Admin, dan Staf nonaktif, lalu
// memanggil database lewat jalur yang sama dengan aplikasi (supabase-js +
// kunci publik). Akun uji dibuat lewat dasbor project apotikku-uji; profilnya
// dipasang oleh supabase/uji/data-uji.sql. Password tidak pernah ada di repo:
// dibaca dari .env.local (laptop) atau secrets GitHub (CI).
import { beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_UJI_URL;
const kunciPublik = process.env.SUPABASE_UJI_PUBLISHABLE_KEY;

const akunUji = {
  admin: {
    email: "admin@apotikku.test",
    password: process.env.SUPABASE_UJI_ADMIN_PASSWORD,
  },
  kasir: {
    email: "kasir@apotikku.test",
    password: process.env.SUPABASE_UJI_KASIR_PASSWORD,
  },
  nonaktif: {
    email: "nonaktif@apotikku.test",
    password: process.env.SUPABASE_UJI_NONAKTIF_PASSWORD,
  },
};

if (!url || !kunciPublik) {
  throw new Error(
    "Isi SUPABASE_UJI_URL dan SUPABASE_UJI_PUBLISHABLE_KEY (alamat dan kunci publik project apotikku-uji).",
  );
}
for (const [peran, akun] of Object.entries(akunUji)) {
  if (!akun.password) {
    throw new Error(
      `Password akun uji ${peran} belum diisi. Isi SUPABASE_UJI_${peran.toUpperCase()}_PASSWORD di .env.local atau secrets GitHub.`,
    );
  }
}

function buatPenghubung() {
  return createClient(url!, kunciPublik!, { auth: { persistSession: false } });
}

async function masuk(akun: { email: string; password?: string }) {
  const supabase = buatPenghubung();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: akun.email,
    password: akun.password!,
  });
  if (error) {
    throw new Error(`Gagal masuk sebagai ${akun.email}: ${error.message}`);
  }
  return { supabase, id: data.user.id };
}

const pengunjung = buatPenghubung();
let admin: { supabase: SupabaseClient; id: string };
let kasir: { supabase: SupabaseClient; id: string };
let nonaktif: { supabase: SupabaseClient; id: string };

beforeAll(async () => {
  [admin, kasir, nonaktif] = await Promise.all([
    masuk(akunUji.admin),
    masuk(akunUji.kasir),
    masuk(akunUji.nonaktif),
  ]);
});

describe("Login", () => {
  it("password salah ditolak dengan pesan umum (tidak menyebut email ada atau tidak)", async () => {
    const supabase = buatPenghubung();
    const salahPassword = await supabase.auth.signInWithPassword({
      email: akunUji.kasir.email,
      password: "bukan-password-yang-benar",
    });
    const emailTidakAda = await supabase.auth.signInWithPassword({
      email: "tidak-ada@apotikku.test",
      password: "bukan-password-yang-benar",
    });
    expect(salahPassword.error).not.toBeNull();
    expect(emailTidakAda.error).not.toBeNull();
    // Supabase memberi jawaban yang sama untuk keduanya, jadi orang asing
    // tidak bisa menebak email mana yang terdaftar.
    expect(salahPassword.error!.code).toBe(emailTidakAda.error!.code);
  });

  it("pendaftaran akun umum ditutup (user story 71)", async () => {
    // Dibaca dari pengaturan publik Supabase Auth, bukan dengan mencoba
    // mendaftar: percobaan mendaftar bisa ditolak karena alasan lain (misalnya
    // domain .test dianggap email tidak valid) sehingga tes lulus walau
    // pendaftaran sebenarnya masih terbuka.
    const jawaban = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: kunciPublik! },
    });
    expect(jawaban.ok).toBe(true);
    const pengaturan = await jawaban.json();
    expect(pengaturan.disable_signup).toBe(true);
  });
});

describe("Profil Staf", () => {
  it("Kasir hanya membaca profilnya sendiri", async () => {
    const { data, error } = await kasir.supabase.from("profil_staf").select("id, peran, aktif");
    expect(error).toBeNull();
    expect(data).toEqual([{ id: kasir.id, peran: "kasir", aktif: true }]);
  });

  it("Admin membaca profil semua Staf", async () => {
    const { data, error } = await admin.supabase.from("profil_staf").select("id, peran");
    expect(error).toBeNull();
    const id = data!.map((baris) => baris.id);
    expect(id).toEqual(expect.arrayContaining([admin.id, kasir.id, nonaktif.id]));
  });

  it("Staf nonaktif hanya melihat profilnya sendiri (untuk pesan 'Akun ini sudah tidak aktif')", async () => {
    const { data, error } = await nonaktif.supabase.from("profil_staf").select("id, aktif");
    expect(error).toBeNull();
    expect(data).toEqual([{ id: nonaktif.id, aktif: false }]);
  });

  it("Pengunjung tidak bisa membaca profil Staf", async () => {
    const { data, error } = await pengunjung.from("profil_staf").select("*");
    expect(data).toBeNull();
    expect(error?.code).toBe("42501"); // 42501 = izin ditolak
  });

  it("tidak ada yang bisa mengubah profil Staf dari aplikasi, termasuk Admin", async () => {
    // Kasir mencoba menaikkan perannya sendiri menjadi Admin.
    const naikPangkat = await kasir.supabase
      .from("profil_staf")
      .update({ peran: "admin" })
      .eq("id", kasir.id);
    expect(naikPangkat.error?.code).toBe("42501");

    // Staf nonaktif mencoba mengaktifkan dirinya sendiri.
    const aktifkanDiri = await nonaktif.supabase
      .from("profil_staf")
      .update({ aktif: true })
      .eq("id", nonaktif.id);
    expect(aktifkanDiri.error?.code).toBe("42501");

    // Admin pun tidak: akun dikelola lewat dasbor Supabase sampai milestone 2.
    const adminMengubah = await admin.supabase
      .from("profil_staf")
      .update({ nama_tampilan: "Diubah" })
      .eq("id", kasir.id);
    expect(adminMengubah.error?.code).toBe("42501");

    const tambah = await admin.supabase
      .from("profil_staf")
      .insert({ id: admin.id, nama_tampilan: "Kembar", peran: "admin" });
    expect(tambah.error?.code).toBe("42501");

    const hapus = await admin.supabase.from("profil_staf").delete().eq("id", kasir.id);
    expect(hapus.error?.code).toBe("42501");
  });

  it("percobaan di atas tidak mengubah apa pun", async () => {
    const { data } = await admin.supabase
      .from("profil_staf")
      .select("id, peran, aktif")
      .in("id", [kasir.id, nonaktif.id])
      .order("aktif");
    expect(data).toEqual([
      { id: nonaktif.id, peran: "kasir", aktif: false },
      { id: kasir.id, peran: "kasir", aktif: true },
    ]);
  });
});

describe("Tabel obat untuk Staf", () => {
  it("Kasir membaca obat yang tidak diarsipkan, termasuk stok persis", async () => {
    const { data, error } = await kasir.supabase
      .from("obat")
      .select("slug, stok, harga_acuan, diarsipkan");
    expect(error).toBeNull();
    const slug = data!.map((baris) => baris.slug);
    expect(slug).toContain("uji-stok-21");
    expect(slug).not.toContain("uji-diarsipkan");
    expect(data!.find((baris) => baris.slug === "uji-stok-21")!.stok).toBe(21);
  });

  it("Admin membaca semua obat, termasuk yang diarsipkan", async () => {
    const { data, error } = await admin.supabase.from("obat").select("slug");
    expect(error).toBeNull();
    expect(data!.map((baris) => baris.slug)).toContain("uji-diarsipkan");
  });

  it("Kasir tidak bisa mengubah, menambah, atau menghapus obat", async () => {
    const ubah = await kasir.supabase
      .from("obat")
      .update({ harga_jual: 1, stok: 999 })
      .eq("slug", "uji-stok-21");
    expect(ubah.error?.code).toBe("42501");

    const tambah = await kasir.supabase.from("obat").insert({
      nama: "Obat Selundupan Kasir",
      bentuk: "tablet",
      keluhan: "demam_nyeri",
      golongan: "bebas",
      satuan_jual: "strip",
      isi_per_satuan: "10 tablet",
      kegunaan: "Tidak boleh masuk.",
      harga_jual: 1,
      stok: 1,
      tanggal_kedaluwarsa: "2099-01-01",
    });
    expect(tambah.error?.code).toBe("42501");

    const hapus = await kasir.supabase.from("obat").delete().eq("slug", "uji-stok-21");
    expect(hapus.error?.code).toBe("42501");

    const { data } = await kasir.supabase
      .from("obat")
      .select("harga_jual, stok")
      .eq("slug", "uji-stok-21")
      .single();
    expect(data).toEqual({ harga_jual: 1000, stok: 21 });
  });

  it("Staf nonaktif tidak bisa membaca obat sama sekali (peran_saya kosong)", async () => {
    const { data, error } = await nonaktif.supabase.from("obat").select("slug");
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});

describe("Fungsi bantu tidak terbuka ke internet", () => {
  // peran_saya tinggal di skema private: dipakai aturan RLS, tidak bisa
  // dipanggil langsung. Bukti bahwa ia kosong untuk Pengunjung dan Staf
  // nonaktif ada di tes "tidak bisa membaca" di atas.
  it("peran_saya tidak bisa dipanggil langsung oleh siapa pun", async () => {
    for (const supabase of [pengunjung, kasir.supabase, admin.supabase]) {
      const { data, error } = await supabase.rpc("peran_saya");
      expect(data).toBeNull();
      expect(error?.code).toBe("PGRST202"); // fungsi tidak ditemukan di API
    }
  });

  // rls_auto_enable() dibuat Supabase untuk pengaturan "automatic RLS". Ia
  // berjalan dengan hak penuh, jadi tidak boleh bisa dipanggil lewat API.
  // Sebelum diperbaiki, panggilan lolos pemeriksaan izin dan baru gagal di
  // langkah berikutnya (kode 0A000); sesudahnya harus ditolak di pintu.
  it("rls_auto_enable tidak bisa dipanggil Pengunjung maupun Staf", async () => {
    for (const supabase of [pengunjung, kasir.supabase, admin.supabase]) {
      const { error } = await supabase.rpc("rls_auto_enable");
      expect(["42501", "PGRST202"]).toContain(error?.code);
    }
  });
});
