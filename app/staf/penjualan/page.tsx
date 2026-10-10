// /staf/penjualan: Penjualan hari ini (Kasir: miliknya, Admin: semua; F-08). Sementara masih kerangka.
import { Kerangka } from "@/components/staf/Kerangka";
import { wajibStaf } from "@/lib/staf";

export default async function HalamanPenjualan() {
  await wajibStaf();
  return (
    <Kerangka
      judul="Penjualan hari ini"
      keterangan="Daftar Penjualan hari ini dan cetak ulang Struk."
      tiket={10}
    />
  );
}
