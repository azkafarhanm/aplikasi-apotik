// /staf/obat: kelola obat (khusus Admin; F-10). Sementara masih kerangka.
import { Kerangka } from "@/components/staf/Kerangka";
import { wajibAdmin } from "@/lib/staf";

export default async function HalamanObat() {
  await wajibAdmin();
  return (
    <Kerangka
      judul="Obat"
      keterangan="Tambah, ubah, arsipkan, dan kembalikan obat."
      tiket={9}
    />
  );
}
