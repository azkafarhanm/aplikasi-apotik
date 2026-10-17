// Identitas apotek yang tercetak di Struk (SPEC 4.9, 7).
//
// ApotikKu bukan apotek sungguhan, jadi alamatnya CONTOH dan Struk mencetak
// tanda "(alamat contoh)". Alamat bukan rahasia dan sama di semua tempat
// aplikasi berjalan, jadi cukup ditulis di sini (bukan variabel lingkungan,
// yang dipakai untuk nomor WhatsApp di tiket #5).
export const apotek = {
  nama: "ApotikKu",
  alamat: "Jl. Contoh Sehat No. 1, Kota Contoh",
  alamatContoh: true,
} as const;
