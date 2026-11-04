// Identitas apotek yang tercetak di Struk (SPEC 4.9, 7).
//
// ApotikKu bukan apotek sungguhan, jadi alamatnya CONTOH dan Struk mencetak
// tanda "(alamat contoh)". Alamat bukan rahasia dan sama di semua tempat
// aplikasi berjalan, jadi cukup ditulis di sini.
//
// Nomor WhatsApp BEDA: ia disimpan di variabel lingkungan (SPEC 4.7), supaya
// bisa diganti tanpa mengubah kode. Bila belum diisi, dipakai nomor contoh dan
// layar menuliskan "(nomor contoh)", sehingga tombolnya tidak pernah mati.
// File ini juga dipakai kode browser, jadi tidak boleh ada kode khusus server.
const nomorContoh = "6281234567890";

/** Hanya angka; NEXT_PUBLIC_ ikut terkirim ke browser, dan nomor ini memang bukan rahasia. */
const nomorWhatsApp = (process.env.NEXT_PUBLIC_WHATSAPP_APOTEK ?? "").replace(/\D/g, "");

export const apotek = {
  nama: "ApotikKu",
  alamat: "Jl. Contoh Sehat No. 1, Kota Contoh",
  alamatContoh: true,
  whatsapp: nomorWhatsApp || nomorContoh,
  whatsappContoh: nomorWhatsApp === "",
  whatsappTertulis: tulisNomorLokal(nomorWhatsApp || nomorContoh),
} as const;

/** "6281234567890" → "0812-3456-7890", bentuk yang biasa dibaca dan disalin orang. */
function tulisNomorLokal(nomor: string): string {
  const lokal = nomor.startsWith("62") ? "0" + nomor.slice(2) : nomor;
  return lokal.replace(/^(\d{4})(\d{4})(\d+)$/, "$1-$2-$3");
}

/** Tautan yang membuka WhatsApp apotek dengan pesan awal yang sudah terisi. */
export function tautanWhatsApp(pesan: string): string {
  return `https://wa.me/${apotek.whatsapp}?text=${encodeURIComponent(pesan)}`;
}
