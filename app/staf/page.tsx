// /staf hanya mengarahkan: Kasir ke Jual, Admin ke Ringkasan (SPEC 4.2).
import { redirect } from "next/navigation";
import { halamanAwal, wajibStaf } from "@/lib/staf";

export default async function HalamanStaf() {
  const staf = await wajibStaf();
  if (staf.aktif && staf.peran) {
    redirect(halamanAwal[staf.peran]);
  }
  // Staf nonaktif: pesannya sudah ditampilkan oleh layout.
  return null;
}
