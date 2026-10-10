"use server";
// Server Action = fungsi yang dijalankan di server saat formulir dikirim.
// Password dikirim dari browser ke server kita, lalu ke Supabase; cookie sesi
// ditulis oleh server. Formulir tetap bekerja walau JavaScript belum termuat.
import { redirect } from "next/navigation";
import { buatSupabaseServer } from "@/lib/supabase/server";

// email dikembalikan supaya Staf tidak perlu mengetik ulang; password tidak.
export type HasilMasuk = { pesan: string; email: string } | null;

// Satu pesan untuk semua kesalahan masuk (user story 22, NF-01): tidak pernah
// menyebut apakah email terdaftar atau password yang salah.
const pesanGagal = "Email atau password salah.";

export async function masuk(_sebelumnya: HasilMasuk, formulir: FormData): Promise<HasilMasuk> {
  const email = String(formulir.get("email") ?? "").trim();
  const password = String(formulir.get("password") ?? "");
  if (!email || !password) {
    return { pesan: pesanGagal, email };
  }

  const supabase = await buatSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Kode 4xx = masalah di data masuk (salah password, email tidak ada,
    // terlalu sering mencoba). Semuanya mendapat pesan yang sama. Kode 5xx /
    // tanpa kode = gangguan server, yang tidak membocorkan apa pun dan perlu
    // pesan berbeda supaya Staf tidak mengira passwordnya salah.
    if (error.status && error.status < 500) {
      return { pesan: pesanGagal, email };
    }
    console.error("Gagal masuk:", error.message);
    return { pesan: "Sedang tidak bisa masuk. Coba lagi sebentar lagi.", email };
  }

  // /staf mengarahkan lagi sesuai peran (Kasir → Jual, Admin → Ringkasan).
  redirect("/staf");
}
