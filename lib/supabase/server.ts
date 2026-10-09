// Penghubung Supabase untuk kode yang berjalan di server (SPEC 4.1).
// Memakai kunci publik, jadi RLS selalu berlaku. Kunci rahasia (service role)
// tidak pernah dipakai di aplikasi ini (ADR 0003).
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function buatSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const kunciPublik = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !kunciPublik) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum diisi. Lihat .env.example.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, kunciPublik, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Halaman (Server Component) tidak boleh menulis cookie. Sesi login
          // akan diperbarui oleh proxy, yang dibuat bersama tiket login Staf.
        }
      },
    },
  });
}
