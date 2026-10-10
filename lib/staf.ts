// Siapa Staf yang sedang login, dan bolehkah ia membuka halaman ini (SPEC 4.6).
//
// Semua halaman /staf/* bertanya lewat file ini, jadi aturannya ada di satu
// tempat. Ini pengecekan untuk TAMPILAN (menu, arah halaman). Penjaga datanya
// tetap RLS di database: walaupun pengecekan di sini salah, data yang bukan
// hak Staf tetap ditolak database (ADR 0003).
import { cache } from "react";
import { redirect } from "next/navigation";
import { buatSupabaseServer } from "@/lib/supabase/server";

export type Peran = "admin" | "kasir";

export type Staf = {
  id: string;
  namaTampilan: string;
  /** null hanya untuk akun yang profilnya belum dipasang (selalu tidak aktif). */
  peran: Peran | null;
  aktif: boolean;
};

export const tulisanPeran: Record<Peran, string> = {
  admin: "Admin",
  kasir: "Kasir",
};

/** Halaman pertama setiap peran setelah masuk (user story 23). */
export const halamanAwal: Record<Peran, string> = {
  admin: "/staf/ringkasan",
  kasir: "/staf/jual",
};

/**
 * Staf yang sedang login, atau null bila belum login. `cache` membuat profil dibaca sekali saja per permintaan halaman,
 * walaupun ditanyakan oleh layout dan halaman sekaligus.
 */
export const ambilStaf = cache(async (): Promise<Staf | null> => {
  const supabase = await buatSupabaseServer();

  // getClaims memeriksa tanda tangan token login, bukan sekadar membaca
  // cookie, jadi cookie palsu tidak lolos.
  const { data: login } = await supabase.auth.getClaims();
  const id = login?.claims?.sub;
  if (!id) {
    return null;
  }

  // RLS mengizinkan setiap Staf membaca profilnya sendiri, termasuk yang
  // nonaktif (supaya pesan "sudah tidak aktif" bisa ditampilkan).
  const { data: profil, error } = await supabase
    .from("profil_staf")
    .select("nama_tampilan, peran, aktif")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal membaca profil Staf: ${error.message}`);
  }
  if (!profil) {
    // Akun login ada tetapi profilnya belum dipasang (lihat
    // supabase/data/profil-staf.sql). Diperlakukan seperti akun nonaktif:
    // bukan null, karena null berarti "belum login" dan akan membuat
    // /masuk ↔ /staf saling mengarahkan tanpa henti.
    return { id, namaTampilan: "Staf", peran: null, aktif: false };
  }

  return {
    id,
    namaTampilan: profil.nama_tampilan,
    peran: profil.peran as Peran,
    aktif: profil.aktif,
  };
});

/** Untuk semua halaman /staf/*: yang belum login diarahkan ke /masuk. */
export async function wajibStaf(): Promise<Staf> {
  const staf = await ambilStaf();
  if (!staf) {
    redirect("/masuk");
  }
  return staf;
}

/** Untuk halaman khusus Admin: Kasir diarahkan ke layar Jual (SPEC 4.2). */
export async function wajibAdmin(): Promise<Staf> {
  const staf = await wajibStaf();
  if (staf.aktif && staf.peran !== "admin") {
    redirect(halamanAwal.kasir);
  }
  return staf;
}
