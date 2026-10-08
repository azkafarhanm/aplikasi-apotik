# PRD: ApotikKu

> **PRD (Product Requirements Document)** = dokumen yang menjelaskan *produk ini apa, untuk siapa, dan harus bisa apa*. Dokumen ini belum membahas cara membuatnya; itu ada di `SPEC.md`.
> Istilah yang dipakai di sini mengikuti [`CONTEXT.md`](../CONTEXT.md).

| | |
|---|---|
| Mata kuliah | Rekayasa Perangkat Lunak (TI25B), dosen Anggun Fergina, S.Kom., M.Kom |
| Kelompok | Kelompok ApotikKu, TI25B |
| Versi | 1.0, 6 Oktober 2026 |
| Status | Disetujui untuk tahap Analisis Kebutuhan (sesi 3) |

---

## 1. Ringkasan

ApotikKu adalah sistem informasi untuk **satu apotek** dengan dua sisi:

1. **Katalog** (publik, tanpa login): siapa pun bisa mencari obat, melihat harga, tahu apakah obat itu perlu resep, dan mengecek apakah stoknya ada.
2. **Area staf** (wajib login): Kasir melayani Penjualan dengan cepat, Admin mengelola obat dan melihat laporan.

ApotikKu adalah versi lanjutan dari aplikasi ApotikKu versi 1 (HTML + localStorage) yang sudah ada, dengan memperbaiki kelemahan-kelemahannya.

## 2. Prinsip: "bukan kita yang butuh teknologi, tapi teknologi yang butuh kita"

Setiap fitur harus berangkat dari **masalah nyata seseorang**. Kalau sebuah fitur tidak bisa ditelusuri ke sebuah masalah di Bagian 5, fitur itu **tidak dibuat**, sekeren apa pun teknologinya. Karena itu, misalnya, ApotikKu versi ini *tidak* memakai fitur AI, slider promosi, atau checkout online.

## 3. Latar belakang masalah

Masalah dikumpulkan lewat **studi pustaka** (membaca jurnal dan artikel tentang apotek di Indonesia), ditambah pengecekan kode ApotikKu versi 1. Masalah yang berasal dari studi pustaka masih **asumsi** sampai dibuktikan di tahap pengujian.

### 3.1 Dari studi pustaka

| Kode | Masalah | Sumber |
|---|---|---|
| M-01 | Pencatatan stok manual (buku/kertas) rawan salah catat, data hilang, dan stok di catatan tidak sesuai dengan yang ada di rak. | [1], [2] |
| M-02 | Apotek terlambat tahu bahwa stok hampir habis atau obat mendekati kedaluwarsa, karena informasinya harus dicari manual. | [1], [3] |
| M-03 | Proses penjualan di kasir lama dan menimbulkan antrean, terutama saat pembeli membeli beberapa obat. | [4], [5] |
| M-04 | Laporan penjualan disusun manual, sehingga lambat dan rawan salah hitung. | [2], [4] |
| M-05 | Harga obat generik di lapangan kadang melebihi Harga Eceran Tertinggi (HET) yang ditetapkan pemerintah. | [6] |
| M-06 | Banyak masyarakat belum memperhatikan logo golongan obat (hijau, biru, merah K), sehingga BPOM dan dinas kesehatan masih perlu mengedukasi obat mana yang boleh dibeli bebas dan mana yang perlu resep. | [7], [8] |
| M-07 | Untuk tahu apakah sebuah obat tersedia dan berapa harganya, pembeli harus datang atau bertanya langsung ke apotek. | Asumsi kelompok |

### 3.2 Dari kode ApotikKu versi 1

| No | Kelemahan | Ditangani oleh |
|---|---|---|
| 1 | Data hanya tersimpan di browser; hilang bila riwayat dihapus, tidak bisa dibuka di perangkat lain | NF-02 |
| 2 | Hanya Dashboard yang mengecek login | NF-01 |
| 3 | Tombol Logout tidak benar-benar menghapus sesi | F-05 |
| 4 | Password disimpan apa adanya | NF-01 |
| 5 | Angka di Dashboard selalu 0 | F-09 |
| 6 | Pilihan jenis laporan tidak berfungsi | F-11 |
| 7 | Satu transaksi hanya untuk satu obat | F-06 |
| 8 | Tombol penjualan bernama "Beli" | Istilah "Penjualan" di `CONTEXT.md` |
| 9 | Hanya ada satu jenis pengguna | Peran Admin & Kasir (Bagian 4) |
| 10 | Belum ada tanggal kedaluwarsa, supplier, stok masuk | F-10 (kedaluwarsa); supplier & stok masuk di Bagian 9 |

## 4. Pengguna (aktor)

| Aktor | Siapa | Butuh apa | Login? |
|---|---|---|---|
| **Pengunjung** | Masyarakat umum, biasanya membuka dari HP | Tahu obat ada atau tidak, harganya, dan apakah perlu resep | Tidak |
| **Kasir** | Staf yang melayani pembeli di meja kasir | Mencatat Penjualan secepat mungkin tanpa salah | Ya |
| **Admin** | Pemilik atau apoteker penanggung jawab | Mengatur obat dan harga, tahu kondisi stok, melihat pendapatan | Ya |

### Hak akses

| Aksi | Pengunjung | Kasir | Admin |
|---|:-:|:-:|:-:|
| Melihat Katalog (nama, harga jual, golongan, status stok) | ✅ | ✅ | ✅ |
| Melihat jumlah stok persis dan harga acuan | ❌ | ✅ | ✅ |
| Mencatat Penjualan dan mencetak Struk | ❌ | ✅ | ✅ |
| Menambah, mengubah, dan mengarsipkan obat | ❌ | ❌ | ✅ |
| Melihat Ringkasan dan Laporan pendapatan | ❌ | ❌ | ✅ |
| Membatalkan Penjualan | ❌ | ❌ | ✅ |

## 5. Ketertelusuran: masalah → kebutuhan → fitur → cara menguji

> **Ketertelusuran (traceability)** = setiap fitur bisa dilacak ke masalah yang ia selesaikan, dan setiap masalah punya cara untuk menguji apakah sudah terselesaikan.

| Masalah | Siapa | Kebutuhan | Fitur | Cara menguji |
|---|---|---|---|---|
| M-07 | Pengunjung | Cek obat dan harga sendiri dari HP | F-01, F-02, F-03 | Harga satu obat ditemukan dalam ≤ 2 langkah |
| M-06 | Pengunjung | Tahu obat mana yang perlu resep, dengan bahasa sederhana | F-03 | Obat keras selalu berlabel "Perlu resep dokter" |
| M-03 | Kasir | Satu Penjualan untuk banyak obat, kembalian dihitung otomatis | F-06, F-07 | Penjualan 3 jenis obat selesai ≤ 30 detik |
| M-01 | Kasir, Admin | Stok berkurang otomatis dan tidak bisa salah | F-06, F-12 | Stok tidak pernah minus, termasuk saat dua kasir menjual bersamaan |
| M-02 | Admin | Diberi tahu tanpa harus mengecek | F-09, F-12 | Obat dengan stok ≤ 20 atau kedaluwarsa ≤ 90 hari muncul di Ringkasan |
| M-04 | Admin | Laporan otomatis per periode | F-11 | Total di laporan sama dengan penjumlahan manual data uji |
| M-05 | Admin | Diingatkan bila harga jual melebihi HET | F-13 | Peringatan muncul saat harga jual > harga acuan |

## 6. Kebutuhan fungsional

> **Kebutuhan fungsional** = apa yang *bisa dilakukan* sistem. Ditulis dengan pola "Sistem dapat …".

### Katalog (Pengunjung)

| Kode | Sistem dapat … | Aktor |
|---|---|---|
| F-01 | Mencari obat berdasarkan nama | Pengunjung |
| F-02 | Menyaring obat berdasarkan Keluhan (Demam & Nyeri, Batuk & Flu, Maag & Pencernaan, Alergi, Luka & Kulit, Vitamin) dan pilihan "Tanpa resep" | Pengunjung |
| F-03 | Menampilkan detail obat: nama, Bentuk, harga jual, Golongan obat dalam bahasa sederhana, kegunaan umum (tanpa dosis), dan Status stok | Pengunjung |
| F-04 | Menghubungkan Pengunjung ke WhatsApp apotek untuk bertanya | Pengunjung |

### Area staf

| Kode | Sistem dapat … | Aktor |
|---|---|---|
| F-05 | Login dan logout Staf; menolak akses ke Area staf tanpa login | Admin, Kasir |
| F-06 | Mencatat Penjualan berisi banyak obat (keranjang), menghitung total dan kembalian, serta meminta Cek resep bila ada Obat keras | Kasir, Admin |
| F-07 | Mencetak Struk ukuran kertas kasir 58 mm | Kasir, Admin |
| F-08 | Menampilkan daftar Penjualan hari ini | Kasir, Admin |
| F-09 | Menampilkan Ringkasan: pendapatan hari ini, obat Hampir habis, obat Segera kedaluwarsa dan Sudah kedaluwarsa | Admin |
| F-10 | Menambah, mengubah, dan mengarsipkan obat, termasuk harga jual, harga acuan, stok, dan tanggal kedaluwarsa | Admin |
| F-11 | Membuat laporan pendapatan per periode (hari ini, bulan ini, rentang tanggal) dan mencetaknya | Admin |
| F-12 | Menghitung Status stok otomatis dan menolak penjualan obat yang Habis atau Sudah kedaluwarsa | Sistem |
| F-13 | Memberi peringatan bila harga jual melebihi harga acuan (HET) | Admin |
| F-14 | Membatalkan Penjualan: stok dikembalikan, Penjualan tetap tercatat dengan tanda Dibatalkan | Admin |

## 7. Kebutuhan non-fungsional

> **Kebutuhan non-fungsional** = seberapa *baik* sistem bekerja: aman, cepat, mudah dipakai.

| Kode | Aspek | Kebutuhan | Ukuran |
|---|---|---|---|
| NF-01 | Keamanan | Area staf hanya bisa dibuka setelah login; password disimpan teracak (hash); aturan hak akses ditegakkan di database, bukan hanya di tampilan; tidak ada pendaftaran akun untuk umum | Pengunjung tidak bisa mengubah data apa pun walau mencoba langsung ke database |
| NF-02 | Ketersediaan | Data disimpan di database online dan bisa dibuka dari perangkat mana saja | Data sama di laptop dan HP |
| NF-03 | Kemudahan pakai | Bahasa Indonesia sehari-hari, tanpa istilah teknis; tombol berbahaya selalu minta konfirmasi | Harga ditemukan ≤ 2 langkah; Penjualan 3 obat ≤ 30 detik; kasir baru bisa memakai setelah ≤ 5 menit penjelasan |
| NF-04 | Tampilan | Katalog dirancang untuk HP lebih dulu; layar kasir untuk laptop/tablet; huruf besar dan kontras tinggi | Nyaman dipakai di layar lebar 360 px ke atas |
| NF-05 | Kecepatan | Halaman dan hasil pencarian tampil cepat | Katalog terbuka < 3 detik di koneksi 4G |
| NF-06 | Keandalan | Stok tidak bisa minus; Penjualan tersimpan utuh atau tidak sama sekali; harga yang tercatat di Penjualan tidak berubah walau harga jual diubah kemudian | Uji otomatis untuk fungsi Penjualan lulus |
| NF-07 | Biaya | Seluruh layanan memakai paket gratis | Rp0 per bulan |

## 8. Aturan bisnis

1. **Status stok**: stok 0 → Habis; 1–20 → Hampir habis; di atas 20 → Tersedia. Obat yang Sudah kedaluwarsa selalu dianggap Habis.
2. **Kedaluwarsa**: setiap obat punya satu tanggal kedaluwarsa (yang terdekat). Tinggal ≤ 90 hari → Segera kedaluwarsa. Sudah lewat → tidak boleh dijual.
3. **Golongan obat**: Obat keras ditampilkan sebagai "Perlu resep dokter", dan Kasir wajib melakukan Cek resep sebelum Penjualan selesai. Isi resep tidak disimpan.
4. **Satuan jual**: setiap obat dijual dalam satu satuan tetap (strip, botol, tube, sachet). Penjualan eceran per butir tidak didukung.
5. **Harga**: Harga jual ditetapkan Admin dan awalnya sama dengan harga acuan (HET). Harga acuan boleh kosong. Setiap Item penjualan menyimpan harga saat terjual.
6. **Penjualan**: harga selalu diambil dari database, bukan dari layar kasir. Pembayaran dicatat sebagai tunai (dengan kembalian) atau QRIS/transfer (hanya dicatat, tidak tersambung ke bank).
7. **Riwayat tidak boleh hilang**: obat yang pernah terjual tidak dihapus, melainkan diarsipkan. Penjualan tidak dihapus, melainkan dibatalkan oleh Admin.
8. **Informasi kesehatan**: kegunaan obat ditulis singkat dan umum, tanpa dosis, disertai catatan "Informasi ini bersifat umum. Tanyakan apoteker sebelum memakai obat."

## 9. Cakupan

### Dikerjakan di versi 1
F-01 sampai F-14, NF-01 sampai NF-07, ditambah data awal ±40 obat generik.

### Tahap berikutnya (milestone 2)
- Stok masuk dari supplier dan data supplier
- Kedaluwarsa per batch (tiap kedatangan barang punya tanggal sendiri)
- Impor banyak obat sekaligus dari file Excel/CSV
- Catatan siapa mengubah harga dan stok (log perubahan)
- Kelola akun Staf dari dalam aplikasi
- Foto obat (opsional, tambahan dari kartu etiket)

### Tidak dikerjakan
- Checkout atau pemesanan online oleh Pengunjung
- Pembayaran QRIS sungguhan yang tersambung ke bank
- Penjualan eceran per butir
- Penyimpanan data resep atau data pasien
- Platform untuk banyak apotek
- Fitur AI. Kandidat masa depan bila ada kebutuhan nyata: prediksi kapan stok habis berdasarkan riwayat penjualan.

## 10. Teknologi (ringkas)

| Bagian | Pilihan | Alasan singkat |
|---|---|---|
| Kerangka aplikasi | Next.js | Satu kerangka untuk Katalog dan Area staf, tampilan modern, sudah dikenal pengembang |
| Database & login | Supabase (PostgreSQL) | Database, login, dan aturan hak akses dalam satu paket gratis |
| Hosting | Vercel | Gratis untuk non-komersial dan paling cocok untuk Next.js |

Alasan lengkap beserta pilihan lain yang dipertimbangkan ada di `docs/KENAPA.md` dan `docs/adr/`.

## 11. Asumsi dan risiko

| Asumsi / risiko | Dampak | Penanganan |
|---|---|---|
| Masalah M-01 s/d M-07 berasal dari studi pustaka, belum dari apotek tertentu | Fitur bisa kurang tepat sasaran | Diuji ulang oleh anggota kelompok sebagai pengguna percobaan |
| Paket gratis Supabase dijeda bila tidak dipakai ±1 minggu | Aplikasi tidak bisa dibuka saat demo | Membuka aplikasi sebelum demo; klik "Restore" bila perlu |
| Data HET yang tersedia publik bisa jadi bukan versi terbaru | Harga acuan kurang akurat | Harga jual tetap bisa diatur Admin |
| Paket gratis Vercel hanya untuk non-komersial | Tidak bisa dipakai apotek sungguhan secara komersial | Pindah ke paket berbayar atau Cloudflare bila dikomersialkan |

## 12. Sumber

1. Pengembangan Sistem Manajemen Stok Obat Berbasis Web dengan Metode Lean Software Development untuk Monitoring dan Klasifikasi Waktu Kedaluwarsa pada Obat. https://scholar.ummetro.ac.id/index.php/JMSI/article/view/10219
2. ROUTERS: Jurnal Sistem dan Teknologi Informasi, Politeknik Negeri Lampung. https://jurnal.polinela.ac.id/routers/article/download/3582/2164
3. Sistem Informasi Manajemen Stok Obat pada Apotek Jafna Menggunakan Metode FEFO. https://www.researchgate.net/publication/394749794
4. Pengembangan Sistem Informasi Kasir Penjualan Obat pada Apotek dengan Pendekatan Metode FAST, Jurnal INFOS AMIKOM. https://jurnal.amikom.ac.id/index.php/infos/article/view/2328
5. 7 Kelebihan dan Kekurangan Sistem Kasir Apotek Berbasis Digital, GPOS. https://www.gpos.id/blog/kelebihan-dan-kekurangan-sistem-kasir-apotek-berbasis-digital/
6. 38 jenis obat generik dijual melebihi HET, ANTARA News. https://www.antaranews.com/berita/293361/38-jenis-obat-generik-dijual-melebihi-het
7. Sudahkah Sahabat BPOM memperhatikan logo obat yang Anda beli?, BPOM Serang. https://serang.pom.go.id/berita/sudahkah-sahabat-bpom-memperhatikan-logo-obat-yang-anda-beli
8. Penandaan Kemasan Obat Berdasarkan Golongan Obat, Dinas Kesehatan Kota Yogyakarta. https://kesehatan.jogjakota.go.id/berita/id/205/penandaan-kemasan-obat-berdasarkan-golongan-obat/
9. Keputusan Menteri Kesehatan No. 092/MENKES/SK/II/2012 tentang Harga Eceran Tertinggi Obat Generik. https://web.rshs.go.id/public_html/wp-content/uploads/2014/04/KMK-No.-092-ttg-Harga-Eceran-Tertinggi-Obat-Generik-Tahun-20122.pdf
