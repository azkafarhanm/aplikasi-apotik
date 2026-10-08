# ADR 0003: Peran Admin & Kasir, ditegakkan dengan RLS sejak awal

| | |
|---|---|
| Status | Diterima |
| Tanggal | 6 Oktober 2026 |
| Terkait | NF-01, NF-06; F-05, F-14; Bagian 4 (hak akses) di [`PRD.md`](../PRD.md) |

## Konteks

Versi 1 hanya punya satu jenis pengguna, dan pengecekan login hanya ada di halaman Dashboard (PRD 3.2 no. 2 dan 9). Siapa pun yang tahu alamat halaman lain bisa langsung masuk.

Di apotek nyata, tidak semua staf boleh melakukan semua hal. Kasir perlu mencatat Penjualan dengan cepat, tetapi tidak seharusnya bisa mengubah harga, membatalkan Penjualan, atau melihat total pendapatan. Itu wewenang pemilik atau apoteker penanggung jawab.

Ada satu hal penting tentang Supabase: aplikasi di browser tersambung ke database memakai **kunci publik (anon key)** yang memang terlihat oleh siapa pun yang membuka DevTools. Jadi kalau aturan hak akses hanya ada di tampilan (misalnya tombol "Hapus" disembunyikan untuk Kasir), orang yang paham teknis tetap bisa mengirim perintah langsung ke database.

## Keputusan

1. **Dua peran Staf**: **Admin** (semua hal) dan **Kasir** (Jual, Penjualan hari ini). Hak akses lengkap ada di tabel PRD Bagian 4.
2. **Hak akses ditegakkan di database dengan RLS, sejak migrasi pertama**, bukan ditambahkan belakangan.
   > **RLS (Row Level Security)** = aturan di dalam database yang menentukan *siapa boleh membaca atau mengubah baris data yang mana*. *Analogi:* loker karyawan dengan kunci masing-masing. Walaupun seseorang berhasil masuk ke ruang loker, ia tetap hanya bisa membuka lokernya sendiri. Aturannya menempel di loker, bukan di pintu ruangan.
3. **Pengunjung (tanpa login) hanya bisa membaca data Katalog**: nama, Bentuk, Keluhan, harga jual, golongan, Status stok. Harga acuan, jumlah stok persis, dan seluruh data Penjualan tertutup.
4. **Tidak ada pendaftaran akun untuk umum.** Akun Staf dibuat oleh pengelola lewat dasbor Supabase. Peran tiap Staf disimpan di tabel profil (detailnya di `SPEC.md`).
5. **Penjualan dicatat lewat satu fungsi database** yang mengambil harga dari database, mengecek dan mengurangi stok, lalu menyimpan semua Item penjualan **dalam satu transaksi database**: berhasil semua atau batal semua.
   > **Transaksi database** (istilah teknis, beda dengan "Penjualan") = sekumpulan langkah yang diperlakukan sebagai satu kesatuan. *Analogi:* transfer bank. Uang keluar dari rekening A dan masuk ke rekening B harus terjadi bersamaan; tidak boleh uang sudah keluar tapi tidak pernah masuk.
6. **Kunci rahasia Supabase (service role key) tidak dipakai di kode aplikasi**, karena kunci itu melewati RLS.

Penjagaan berlapis:

| Lapisan | Tugas | Kalau lapisan ini gagal… |
|---|---|---|
| Tampilan | Menyembunyikan menu yang bukan haknya (Kasir tidak melihat menu Laporan) | Hanya soal kenyamanan; data tetap aman |
| Proxy/middleware | Mengarahkan yang belum login dari `/staf/*` ke halaman login | Halaman terbuka, tetapi datanya kosong karena ditolak database |
| **RLS di database** | Penjaga terakhir yang menentukan data boleh dibaca/diubah atau tidak | (Inilah yang tidak boleh gagal, maka diuji otomatis) |

## Pilihan yang ditolak

| Pilihan | Kenapa ditolak |
|---|---|
| **Satu peran saja** (seperti versi 1) | Kasir jadi bisa mengubah harga dan membatalkan Penjualan tanpa jejak. Itu celah kecurangan yang umum di toko. |
| **Hak akses hanya dicek di tampilan / kode Next.js** | Kunci anon Supabase bersifat publik. Siapa pun bisa melewati tampilan dan mengirim perintah langsung ke database. Menyembunyikan tombol bukan pengamanan. |
| **Tambahkan RLS nanti, setelah fitur jadi** | Memasang aturan keamanan di atas puluhan fitur yang sudah jadi itu seperti memasang fondasi setelah rumah berdiri: mahal dan mudah bocor. Bila sejak awal, setiap fitur baru langsung diuji di bawah aturan yang benar. |
| **Lebih banyak peran** (Apoteker, Gudang, Pemilik terpisah) | Tidak ada masalah di PRD yang membutuhkannya. Untuk satu apotek kecil, pemilik dan apoteker penanggung jawab biasanya orang yang sama (= Admin). Bisa ditambah kelak tanpa merombak, karena peran tersimpan di tabel. |
| **Pendaftaran akun terbuka** (siapa saja bisa daftar lalu Admin menyetujui) | Membuka pintu untuk spam dan percobaan masuk. Jumlah Staf satu apotek hanya beberapa orang, jadi cukup dibuat manual. Kelola akun dari dalam aplikasi dijadwalkan di milestone 2. |
| **Penjualan disimpan lewat beberapa perintah terpisah dari browser** (simpan Penjualan, lalu kurangi stok satu per satu) | Bila koneksi putus di tengah jalan, stok sudah berkurang tetapi Penjualan tidak tercatat. Bila dua kasir menjual obat terakhir bersamaan, stok bisa jadi minus. Harga juga bisa dimanipulasi dari browser. Fungsi database dalam satu transaksi menutup ketiga celah ini (NF-06, aturan bisnis 6). |

## Konsekuensi

**Yang didapat**
- Pengunjung tidak bisa mengubah apa pun walau mencoba langsung ke database (ukuran NF-01).
- Kasir tidak bisa melihat laporan atau membatalkan Penjualan walau mencoba lewat DevTools.
- Stok tidak bisa minus dan harga tidak bisa dimanipulasi dari layar kasir (NF-06).
- Bug di kode tampilan tidak otomatis menjadi kebocoran data.

**Yang harus diterima**
- Kelompok harus belajar menulis aturan RLS dan fungsi database dengan SQL.
- Aturan RLS harus **diuji**: minimal satu uji per peran (Pengunjung, Kasir, Admin) untuk tiap tabel penting. Kesalahan RLS sering diam-diam: tidak muncul error, datanya hanya tidak tampil.
- Menambah akun Staf masih manual lewat dasbor Supabase sampai milestone 2.

## Kalau dosen bertanya…

**"Kenapa tidak cukup cek login di halaman saja?"**
Karena di Supabase, browser tersambung langsung ke database dengan kunci yang publik. Cek di halaman hanya menyembunyikan tombol; orang yang paham teknis tetap bisa mengirim perintah ke database. RLS memasang aturan di database itu sendiri, sehingga perintah dari mana pun tetap dicek.

**"Apa bedanya RLS dengan middleware?"**
Middleware itu satpam di pintu halaman: mencegah orang yang belum login membuka halaman staf. RLS itu kunci di setiap loker data: walaupun halaman berhasil dibuka, data yang bukan haknya tetap tidak bisa diambil. Kami pakai keduanya, tetapi yang menentukan aman atau tidak adalah RLS.

**"Kenapa Kasir tidak boleh membatalkan Penjualan?"**
Pembatalan mengembalikan stok dan mengurangi pendapatan. Jika Kasir bisa melakukannya sendiri, ia bisa menerima uang lalu membatalkan Penjualannya, dan uangnya tidak tercatat. Memisahkan wewenang ini adalah praktik umum di toko (pemisahan tugas). Penjualan yang dibatalkan juga tidak dihapus, hanya ditandai, jadi jejaknya tetap ada.

**"Bagaimana kalau dua kasir menjual obat terakhir pada detik yang sama?"**
Fungsi database mengunci baris obat itu selama transaksi berjalan. Kasir kedua menunggu sepersekian detik, lalu mendapati stok sudah 0 dan Penjualannya ditolak dengan pesan yang jelas. Stok tidak pernah minus.

**"Kenapa tidak ada tombol Daftar?"**
Staf apotek hanya beberapa orang dan dikenal pemiliknya. Pendaftaran terbuka justru mengundang orang asing mencoba masuk.
