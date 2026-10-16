"use server";
// Server Action layar Jual: meneruskan keranjang ke fungsi database
// catat_penjualan, lalu meminta halaman memuat ulang daftar obat (stok baru).
//
// Server Action bisa dipanggil langsung lewat internet, jadi tidak ada aturan
// yang dipercayakan ke sini: siapa pemanggilnya, harga, stok, Cek resep, dan
// uang semuanya dicek ulang oleh database (SPEC 4.4).
import { refresh } from "next/cache";
import type { CaraBayar, HasilPenjualan, IsiKeranjang } from "@/lib/penjualan";
import { ambilStaf } from "@/lib/staf";
import { buatSupabaseServer } from "@/lib/supabase/server";

export type MasukanPenjualan = {
  keranjang: IsiKeranjang[];
  metodeBayar: CaraBayar;
  uangDiterima: number | null;
  cekResep: boolean;
};

export type HasilSimpan =
  | { berhasil: true; penjualan: HasilPenjualan }
  | { berhasil: false; pesan: string };

const pesanGangguan = "Penjualan belum tersimpan karena gangguan. Coba lagi.";

export async function simpanPenjualan(masukan: MasukanPenjualan): Promise<HasilSimpan> {
  const staf = await ambilStaf();
  if (!staf) {
    return { berhasil: false, pesan: "Sesi masuk sudah berakhir. Muat ulang halaman, lalu masuk lagi." };
  }

  // Hanya obat_id dan jumlah yang diteruskan: harga apa pun dari browser
  // dibuang di sini, dan database pun mengabaikannya.
  const keranjang = Array.isArray(masukan?.keranjang)
    ? masukan.keranjang.map((isi) => ({ obat_id: isi?.obat_id, jumlah: isi?.jumlah }))
    : [];

  const supabase = await buatSupabaseServer();
  const { data, error } = await supabase.rpc("catat_penjualan", {
    keranjang,
    metode_bayar: masukan?.metodeBayar,
    uang_diterima: masukan?.metodeBayar === "tunai" ? masukan.uangDiterima : null,
    cek_resep: masukan?.cekResep === true,
  });

  if (error) {
    // P0001 = penolakan dari aturan Penjualan (RAISE EXCEPTION di
    // catat_penjualan). Pesannya sudah bahasa sehari-hari dan menyebut obatnya.
    if (error.code === "P0001") {
      return { berhasil: false, pesan: error.message };
    }
    console.error("Gagal mencatat Penjualan:", error.code, error.message);
    return { berhasil: false, pesan: pesanGangguan };
  }

  // Muat ulang daftar obat di layar (stok sudah berkurang) dalam perjalanan
  // pulang yang sama; isi layar lain (pesan hasil) tetap.
  refresh();
  return { berhasil: true, penjualan: data as HasilPenjualan };
}
