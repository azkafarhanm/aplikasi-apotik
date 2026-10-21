"use server";
// Server Action halaman Penjualan hari ini: meneruskan Pembatalan ke fungsi
// database batalkan_penjualan, lalu meminta halaman memuat ulang daftarnya.
//
// Server Action bisa dipanggil langsung lewat internet, jadi tidak ada aturan
// yang dipercayakan ke sini: Admin atau bukan, alasan, hari ini atau bukan,
// dan sudah dibatalkan atau belum, semuanya dicek database (SPEC 4.4).
import { refresh } from "next/cache";
import type { HasilPembatalan } from "@/lib/penjualan";
import { ambilStaf } from "@/lib/staf";
import { buatSupabaseServer } from "@/lib/supabase/server";

export type HasilBatal =
  | { berhasil: true; pembatalan: HasilPembatalan }
  | { berhasil: false; pesan: string };

const pesanGangguan = "Penjualan belum dibatalkan karena gangguan. Coba lagi.";

export async function batalkanPenjualan(nomor: string, alasan: string): Promise<HasilBatal> {
  const staf = await ambilStaf();
  if (!staf) {
    return { berhasil: false, pesan: "Sesi masuk sudah berakhir. Muat ulang halaman, lalu masuk lagi." };
  }

  const supabase = await buatSupabaseServer();
  const { data, error } = await supabase.rpc("batalkan_penjualan", {
    nomor: typeof nomor === "string" ? nomor : "",
    alasan: typeof alasan === "string" ? alasan : "",
  });

  if (error) {
    // P0001 = penolakan dari aturan Pembatalan (RAISE EXCEPTION di
    // batalkan_penjualan). Pesannya sudah bahasa sehari-hari.
    if (error.code === "P0001") {
      return { berhasil: false, pesan: error.message };
    }
    console.error("Gagal membatalkan Penjualan:", error.code, error.message);
    return { berhasil: false, pesan: pesanGangguan };
  }

  // Muat ulang daftar (baris jadi Dibatalkan, jumlah di atas berubah) dalam
  // perjalanan pulang yang sama; pesan hasil di layar tetap.
  refresh();
  return { berhasil: true, pembatalan: data as HasilPembatalan };
}
