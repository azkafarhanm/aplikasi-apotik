# ADR 0002: Katalog publik + Area staf

| | |
|---|---|
| Status | Diterima |
| Tanggal | 6 Oktober 2026 |
| Terkait | M-03, M-06, M-07; F-01 s/d F-04; Bagian 4 dan 9 di [`PRD.md`](../PRD.md) |

## Konteks

ApotikKu versi 1 hanya untuk orang di dalam apotek. Padahal studi pustaka dan pengamatan kelompok menunjukkan dua masalah yang dialami **orang di luar apotek**:

- **M-07**: untuk tahu obat ada atau tidak dan berapa harganya, pembeli harus datang atau bertanya langsung.
- **M-06**: banyak orang belum paham logo golongan obat, jadi tidak tahu obat mana yang perlu resep.

Di sisi lain, masalah **di dalam** apotek (M-01 s/d M-05: stok, antrean kasir, laporan, harga) tetap harus diselesaikan. Pertanyaannya: ApotikKu melayani siapa saja, dan seberapa jauh?

## Keputusan

ApotikKu punya **dua sisi** dalam satu aplikasi, untuk **satu apotek**:

1. **Katalog** (publik, tanpa login): cari obat, saring berdasarkan Keluhan, lihat harga jual, Golongan obat dalam bahasa sederhana, dan Status stok. Ada tombol WhatsApp untuk bertanya.
2. **Area staf** (wajib login, alamat `/staf/*`): Kasir melayani Penjualan, Admin mengelola obat dan melihat laporan.

Batas yang sengaja dipasang:

- Katalog **hanya menampilkan Status stok** (Tersedia / Hampir habis / Habis), **bukan jumlah persis**.
- Katalog **tidak punya keranjang atau checkout**. Pembeli tetap datang ke apotek.
- Katalog **tidak menampilkan dosis**, hanya kegunaan umum dan catatan "Tanyakan apoteker sebelum memakai obat."

*Analogi:* apotek dengan papan daftar harga di jendela depan. Orang yang lewat bisa membaca papan itu kapan saja tanpa masuk. Tetapi untuk membeli, tetap masuk dan dilayani di meja kasir.

## Pilihan yang ditolak

| Pilihan | Kenapa ditolak |
|---|---|
| **Hanya Area staf** (seperti versi 1) | Tidak menyelesaikan M-06 dan M-07. Cakupan juga terlalu sempit untuk tugas RPL: hanya satu jenis aktor dari luar. |
| **Toko online dengan checkout dan pengiriman** | Menjual obat secara online diatur ketat (izin apotek daring, apoteker harus memeriksa resep, data pasien harus dilindungi). Fiturnya juga jauh lebih banyak (alamat, ongkir, status pesanan) tanpa masalah nyata di PRD yang menuntutnya. Melanggar prinsip "teknologi yang butuh kita". |
| **Platform untuk banyak apotek** (marketplace) | Butuh pendaftaran apotek, verifikasi, pemisahan data antar-apotek. Kompleksitasnya berlipat untuk masalah yang tidak ada di PRD. |
| **Dua aplikasi terpisah** (satu untuk Katalog, satu untuk staf) | Data obat sama dipakai keduanya. Dua aplikasi berarti dua kali kerja hosting, dua kali kode login, dan risiko tampilan tidak seragam. Next.js bisa memisahkan keduanya cukup dengan alamat (`/` dan `/staf`). |
| **Menampilkan jumlah stok persis di Katalog** | Angka stok adalah data internal apotek (pesaing tidak perlu tahu). Angka persis juga cepat basi: "tersisa 3" bisa sudah 0 saat pembeli tiba. Tiga status cukup untuk keputusan Pengunjung: datang atau tidak. |
| **Pengunjung wajib daftar/login** | Menambah langkah tanpa manfaat. Tujuannya hanya melihat harga, dan target ≤ 2 langkah (NF-03) jadi mustahil bila harus daftar dulu. |

## Konsekuensi

**Yang didapat**
- Dua aktor dari luar dan dalam (Pengunjung, Kasir, Admin), sehingga analisis kebutuhan RPL lebih lengkap.
- Katalog sekaligus menjadi sarana edukasi golongan obat (M-06).
- Pembeli bisa mengecek dulu sebelum datang (M-07).

**Yang harus diterima**
- Katalog terbuka untuk siapa saja, jadi database **wajib** mencegah Pengunjung mengubah atau melihat data internal. Ini ditangani RLS ([ADR 0003](0003-peran-admin-kasir-rls.md)).
- Ada tanggung jawab informasi kesehatan: kegunaan obat ditulis umum, tanpa dosis, dengan catatan untuk bertanya ke apoteker (aturan bisnis 8).
- Katalog harus cepat di HP dengan koneksi biasa (NF-04, NF-05).

## Kalau dosen bertanya…

**"Kenapa tidak sekalian bisa pesan online? Kan lebih modern."**
Karena tidak ada masalah di PRD yang menuntutnya, dan penjualan obat online punya aturan khusus (resep diperiksa apoteker, izin apotek daring). Membuatnya setengah jadi justru berbahaya, misalnya Obat keras bisa dipesan tanpa resep. Katalog kami menjawab kebutuhan "ada atau tidak, berapa harganya", lalu WhatsApp untuk pertanyaan lebih lanjut.

**"Kenapa stoknya tidak ditampilkan angkanya?"**
Angka persis adalah data bisnis apotek dan cepat berubah. Pengunjung hanya perlu tahu: ada, hampir habis, atau habis. Staf tetap melihat angka persisnya.

**"Apa bedanya Katalog ini dengan website toko biasa?"**
Katalog terhubung langsung ke stok yang sama dengan kasir. Begitu Kasir mencatat Penjualan, Status stok di Katalog ikut berubah tanpa ada yang memperbarui manual.

**"Kenapa hanya satu apotek?"**
Masalah yang kami angkat ada di level satu apotek. Mendukung banyak apotek menambah pendaftaran, verifikasi, dan pemisahan data, tanpa menyelesaikan masalah tambahan di PRD. Itu dicatat di "Tidak dikerjakan" (PRD 9).
