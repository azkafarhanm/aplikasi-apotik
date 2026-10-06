# ApotikKu

Sistem informasi untuk satu apotek: pengunjung umum melihat katalog obat tanpa login, sedangkan staf apotek mengelola obat, melayani penjualan, dan melihat laporan.

## Orang

**Pengunjung**:
Siapa pun yang membuka katalog tanpa login.
_Hindari_: user, tamu, customer

**Staf**:
Orang apotek yang punya akun dan login; selalu berperan sebagai Admin atau Kasir.
_Hindari_: user, karyawan, pegawai

**Admin**:
Staf yang mengelola obat, harga, dan melihat laporan; bisa melakukan semua hal yang bisa dilakukan Kasir.
_Hindari_: pemilik, owner, superuser

**Kasir**:
Staf yang melayani penjualan dan melihat stok, tetapi tidak bisa mengubah data obat atau melihat laporan.
_Hindari_: operator, petugas

## Tempat

**Katalog**:
Bagian publik ApotikKu yang menampilkan obat, harga jual, golongan, dan status stok kepada Pengunjung.
_Hindari_: etalase, toko, landing page

**Area staf**:
Bagian ApotikKu yang hanya bisa dibuka setelah login.
_Hindari_: dashboard, admin panel, backoffice

## Obat

**Obat**:
Satu produk yang dijual apotek, dengan nama, golongan, harga jual, stok, dan tanggal kedaluwarsa.
_Hindari_: produk, barang, item

**Bentuk**:
Wujud fisik obat: tablet, kapsul, sirup, salep, dan sejenisnya.
_Hindari_: kategori, bentuk sediaan, jenis

**Keluhan**:
Kelompok masalah kesehatan yang dibantu sebuah obat (misalnya Demam & Nyeri, Batuk & Flu); cara utama Pengunjung menelusuri Katalog.
_Hindari_: kategori, kegunaan, indikasi

**Satuan jual**:
Satu-satunya satuan tempat sebuah obat dijual dan stoknya dihitung (strip, botol, tube, sachet).
_Hindari_: unit, kemasan

**Golongan obat**:
Penggolongan resmi BPOM berdasarkan keamanan dan cara memperolehnya: obat bebas (lingkaran hijau), obat bebas terbatas (lingkaran biru), dan obat keras (lingkaran merah huruf K).
_Hindari_: jenis obat, tipe obat

**Obat keras**:
Obat golongan keras yang hanya boleh diserahkan dengan resep dokter; di Katalog ditulis "Perlu resep dokter".
_Hindari_: obat resep, obat K

**Status stok**:
Keterangan ketersediaan obat: Habis (stok 0 atau sudah kedaluwarsa), Hampir habis (stok 1–20), atau Tersedia (stok di atas 20).
_Hindari_: menipis, ketersediaan, stock level

**Segera kedaluwarsa**:
Keadaan obat yang tanggal kedaluwarsanya tinggal 90 hari atau kurang.
_Hindari_: hampir expired, near expiry

**Sudah kedaluwarsa**:
Keadaan obat yang tanggal kedaluwarsanya sudah lewat; tidak boleh dijual walaupun stoknya masih ada.
_Hindari_: expired, kadaluarsa

**Arsipkan**:
Menyembunyikan obat dari Katalog dan kasir tanpa menghapus riwayat penjualannya.
_Hindari_: hapus, delete, nonaktifkan

**Harga acuan**:
Harga eceran tertinggi (HET) dari sumber resmi Kemenkes, dipakai sebagai patokan dan hanya terlihat oleh Staf.
_Hindari_: harga dasar, harga modal, HPP

**Harga jual**:
Harga yang ditetapkan Admin dan dibayar pembeli; awalnya sama dengan Harga acuan. Harga acuan boleh kosong bila obat tidak punya HET.
_Hindari_: harga, price

## Penjualan

**Penjualan**:
Satu kali pembeli dilayani di kasir, berisi satu atau lebih Item penjualan.
_Hindari_: transaksi, pembelian, beli, order

**Item penjualan**:
Satu baris dalam Penjualan: satu obat, jumlahnya, dan Harga jual saat itu terjual.
_Hindari_: detail transaksi, line item

**Struk**:
Bukti cetak sebuah Penjualan untuk pembeli.
_Hindari_: nota, kuitansi, receipt

**Cek resep**:
Konfirmasi Kasir bahwa pembeli membawa resep dokter saat Penjualan berisi Obat keras; isi resepnya tidak disimpan.
_Hindari_: validasi resep, input resep

**Pembatalan**:
Tindakan Admin menandai Penjualan sebagai Dibatalkan: stok dikembalikan, Penjualan tetap tercatat, dan tidak dihitung sebagai pendapatan.
_Hindari_: void, refund, hapus transaksi, retur
