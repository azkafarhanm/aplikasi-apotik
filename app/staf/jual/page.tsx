// /staf/jual: layar kasir (Kasir, Admin; F-06). Sementara masih kerangka.
import { Kerangka } from "@/components/staf/Kerangka";
import { wajibStaf } from "@/lib/staf";

export default async function HalamanJual() {
  await wajibStaf();
  return (
    <Kerangka
      judul="Jual"
      keterangan="Cari obat, susun keranjang, Cek resep, lalu bayar."
      tiket={8}
    />
  );
}
