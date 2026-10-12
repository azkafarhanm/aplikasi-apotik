// /staf/ringkasan: Ringkasan (khusus Admin; F-09). Sementara masih kerangka.
import { Kerangka } from "@/components/staf/Kerangka";
import { wajibAdmin } from "@/lib/staf";

export default async function HalamanRingkasan() {
  await wajibAdmin();
  return (
    <Kerangka
      judul="Ringkasan"
      keterangan="Pendapatan hari ini, obat Hampir habis, Segera kedaluwarsa, dan Sudah kedaluwarsa."
      tiket={11}
    />
  );
}
