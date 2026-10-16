// Alat bersama untuk tes database: penghubung ke project apotikku-uji dan
// login sebagai akun Staf uji. Dipakai tests/staf.test.ts, tests/penjualan.test.ts,
// dan tes berikutnya, supaya cara masuknya sama di semua tes.
//
// Akun uji dibuat lewat dasbor project apotikku-uji; profilnya dipasang oleh
// supabase/uji/data-uji.sql. Password tidak pernah ada di repo: dibaca dari
// .env.local (laptop) atau secrets GitHub (CI).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_UJI_URL;
const kunciPublik = process.env.SUPABASE_UJI_PUBLISHABLE_KEY;

if (!url || !kunciPublik) {
  throw new Error(
    "Isi SUPABASE_UJI_URL dan SUPABASE_UJI_PUBLISHABLE_KEY (alamat dan kunci publik project apotikku-uji).",
  );
}

export const alamatUji = url;
export const kunciPublikUji = kunciPublik;

export const akunUji = {
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

export type PeranUji = keyof typeof akunUji;

/** Staf uji yang sudah login: penghubungnya dan id akunnya. */
export type StafUji = { supabase: SupabaseClient; id: string };

/** Penghubung baru tanpa login (Pengunjung), memakai kunci publik seperti aplikasi. */
export function buatPenghubung(): SupabaseClient {
  return createClient(url!, kunciPublik!, { auth: { persistSession: false } });
}

/** Login sebagai salah satu akun Staf uji. Setiap panggilan = sesi baru. */
export async function masukSebagai(peran: PeranUji): Promise<StafUji> {
  const akun = akunUji[peran];
  if (!akun.password) {
    throw new Error(
      `Password akun uji ${peran} belum diisi. Isi SUPABASE_UJI_${peran.toUpperCase()}_PASSWORD di .env.local atau secrets GitHub.`,
    );
  }
  const supabase = buatPenghubung();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: akun.email,
    password: akun.password,
  });
  if (error) {
    throw new Error(`Gagal masuk sebagai ${akun.email}: ${error.message}`);
  }
  return { supabase, id: data.user.id };
}
