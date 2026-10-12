// /staf/laporan: Laporan (khusus Admin; F-11). Sementara masih kerangka.
import { Kerangka } from "@/components/staf/Kerangka";
import { wajibAdmin } from "@/lib/staf";

export default async function HalamanLaporan() {
  await wajibAdmin();
  return (
    <Kerangka
      judul="Laporan"
      keterangan="Laporan pendapatan per periode, siap cetak."
      tiket={12}
    />
  );
}
