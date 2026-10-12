// POST /keluar: tombol Keluar di semua halaman /staf/* (SPEC 4.2, 4.6).
//
// Sengaja berupa formulir biasa ke alamat ini (Route Handler), bukan Server
// Action. Setelah keluar, browser membuka /masuk sebagai halaman BARU (dimuat
// ulang penuh). Next.js menyimpan halaman yang baru dikunjungi dalam keadaan
// tersembunyi di memori supaya bisa kembali cepat; tanpa muat ulang penuh,
// isi halaman Staf (nama, nanti juga daftar Penjualan) masih tersimpan
// tersembunyi di browser walau sudah keluar. Muat ulang penuh menghapusnya.
import { NextResponse, type NextRequest } from "next/server";
import { buatSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  // Hanya menerima kiriman dari halaman ApotikKu sendiri, supaya situs lain
  // tidak bisa diam-diam membuat Staf keluar.
  const asal = request.headers.get("origin");
  if (asal && asal !== request.nextUrl.origin) {
    return new NextResponse("Ditolak.", { status: 403 });
  }

  // Sesi di perangkat ini diakhiri di server Supabase dan cookie-nya dihapus
  // (kelemahan v1 no. 3). Scope "local": sesi akun yang sama di perangkat lain
  // tidak ikut diputus (Admin yang login di laptop dan tablet tidak ikut
  // terlempar dari tablet saat keluar di laptop).
  const supabase = await buatSupabaseServer();
  await supabase.auth.signOut({ scope: "local" });

  // 303 = "buka alamat ini dengan GET", jawaban baku setelah formulir dikirim.
  const tujuan = NextResponse.redirect(new URL("/masuk?keluar=1", request.url), 303);
  tujuan.headers.set("Cache-Control", "private, no-store");
  return tujuan;
}
