// Proxy = "satpam" yang berjalan sebelum halaman Staf dibuka (SPEC 4.1, 4.6).
//
// Tugasnya sengaja sedikit dan cepat:
// 1. Memperbarui sesi login (token login Supabase berumur pendek; bila sudah
//    kedaluwarsa, diganti token baru dan cookie-nya ditulis ulang).
// 2. Yang belum login dan membuka /staf/* diarahkan ke /masuk.
// 3. Yang sudah login dan membuka /masuk diarahkan ke /staf.
// 4. Halaman /staf/* ditandai "jangan disimpan", supaya tombol Kembali setelah
//    Keluar tidak memperlihatkan salinan lama halaman Staf.
//
// Peran (Admin/Kasir) TIDAK dicek di sini, karena butuh bertanya ke database
// dan panduan Next.js melarang proxy dipakai untuk mengambil data. Peran dicek
// oleh halaman lewat lib/staf.ts, dan datanya dijaga RLS (ADR 0003).
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Token baru diteruskan ke halaman (request) dan ke browser (response).
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          for (const [kunci, nilai] of Object.entries(headers)) {
            response.headers.set(kunci, nilai);
          }
        },
      },
    },
  );

  // Memeriksa tanda tangan token, sekaligus memicu pembaruan sesi bila perlu.
  const { data } = await supabase.auth.getClaims();
  const sudahMasuk = Boolean(data?.claims?.sub);
  const alamat = request.nextUrl.pathname;
  const halamanStaf = alamat === "/staf" || alamat.startsWith("/staf/");

  if (halamanStaf && !sudahMasuk) {
    return arahkan(request, response, "/masuk");
  }
  if (alamat === "/masuk" && sudahMasuk) {
    return arahkan(request, response, "/staf");
  }

  if (halamanStaf) {
    response.headers.set("Cache-Control", "private, no-store");
  }
  return response;
}

/** Mengarahkan ke alamat lain tanpa membuang cookie sesi yang baru diperbarui. */
function arahkan(request: NextRequest, response: NextResponse, tujuan: string) {
  const pengalihan = NextResponse.redirect(new URL(tujuan, request.url));
  for (const cookie of response.cookies.getAll()) {
    pengalihan.cookies.set(cookie);
  }
  pengalihan.headers.set("Cache-Control", "private, no-store");
  return pengalihan;
}

// Hanya halaman yang memakai sesi Staf. Katalog (/) tidak lewat proxy, jadi
// Pengunjung tidak menunggu pemeriksaan login yang tidak mereka butuhkan.
export const config = {
  matcher: ["/staf", "/staf/:path*", "/masuk"],
};
