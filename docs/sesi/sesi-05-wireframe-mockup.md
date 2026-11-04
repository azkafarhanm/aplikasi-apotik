# Konsep dan Prinsip Perangkat Lunak: Wireframe dan Mockup ApotikKu

> Bahan tugas Sesi 5 mata kuliah Rekayasa Perangkat Lunak (TI25B). Versi di repo ini sengaja **tanpa nama dan NIM**; PDF yang memuat identitas kelompok dibuat di luar repo.
> Desain dibuat di Figma (halaman *Wireframe* dan *Mockup*); gambar di [`gambar/sesi-05/`](gambar/sesi-05/).

## Soal

1. Buat *wireframe* / *mockup* tiap halaman.
2. Desain layout dengan Figma/Canva.
3. Review desain bersama dosen/kelompok.
4. Dikumpulkan dalam bentuk PDF, paling lambat H-1 pertemuan berikutnya.

## Jawaban

### Pengantar

Sesi ini adalah tahap perancangan tampilan ApotikKu. Kebutuhan yang sudah dibakukan di SKPL (Sesi 4) diterjemahkan menjadi gambar setiap halaman, sebelum halaman itu dibuat dalam kode. Gambar dibuat dalam dua tingkat:

| | Wireframe | Mockup |
|---|---|---|
| Apa itu | Kerangka halaman hitam-putih: letak kotak, tombol, dan teks | Wireframe yang sudah diberi warna, huruf, dan isi contoh yang nyata |
| Analogi | Denah rumah: posisi kamar dan pintu | Gambar rumah yang sudah dicat dan diberi perabot |
| Yang dinilai | Apakah alurnya masuk akal dan semua informasi ada | Apakah tampilannya jelas, mudah dibaca, dan sesuai identitas ApotikKu |

Desain dibuat di **Figma** dalam satu file berisi dua halaman, *Wireframe* dan *Mockup*, masing-masing 10 layar. Setiap layar wireframe diberi catatan kuning berisi alasan desainnya. File Figma: https://www.figma.com/design/zCH1ZOMzjVVLHDKauHgjZo

<figure><img src="gambar/sesi-05/figma.png" width="100%"><figcaption>Ruang kerja Figma: halaman Wireframe dan Mockup, daftar layer, dan 10 layar ApotikKu</figcaption></figure>


### 1. Daftar halaman

| No | Halaman | Pengguna | Perangkat | Fitur di SKPL |
|---|---|---|---|---|
| 01 | Katalog | Pengunjung | HP | F-01, F-02, F-12 |
| 02 | Detail obat | Pengunjung | HP | F-03, F-04 |
| 03 | Masuk Staf | Kasir, Admin | HP dan laptop | F-05 |
| 04 | Struk | Pembeli (hasil cetak) | Printer 58 mm | F-07 |
| 05 | Katalog versi laptop | Pengunjung | Laptop | F-01, F-02 |
| 06 | Ringkasan | Admin | Laptop | F-09 |
| 07 | Jual | Kasir, Admin | Laptop/tablet | F-06, F-12 |
| 08 | Penjualan hari ini | Kasir, Admin | Laptop | F-08, F-14 |
| 09 | Kelola obat | Admin | Laptop | F-10, F-13 |
| 10 | Laporan | Admin | Laptop | F-11 |

Katalog dirancang untuk HP lebih dulu karena Pengunjung biasanya mengecek obat dari rumah lewat HP. Halaman Staf dirancang untuk laptop atau tablet karena dipakai di meja kasir.

### 2. Prinsip desain yang dipakai

| Prinsip | Penerapan di ApotikKu |
|---|---|
| Sederhana | Satu halaman punya satu tugas utama. Contoh: layar Jual hanya untuk mencari obat dan mengisi keranjang |
| Konsisten | Semua kotak informasi berbentuk "etiket" yang sama (pita hijau di atas), menu Staf selalu di bagian atas, tombol utama selalu hijau |
| Jelas, tidak bergantung warna | Golongan obat ditampilkan dengan logo resmi **dan** tulisan ("Perlu resep dokter"), supaya tetap terbaca oleh orang yang buta warna |
| Mencegah kesalahan | Harga tidak bisa diketik Kasir (diambil dari database), Cek resep wajib bila ada Obat keras, Pembatalan dan Arsipkan meminta konfirmasi |
| Bahasa pengguna | Semua tulisan memakai bahasa Indonesia sehari-hari: "Hampir habis", bukan "low stock" |
| Sesuai perangkat | Katalog satu kolom di HP dan tiga kolom di laptop; isi kartunya sama |

### 3. Wireframe dan mockup tiap halaman

Gambar kiri atau atas adalah wireframe, gambar kanan atau bawah adalah mockup.

#### 01 Katalog (HP)

<div class="dua"><img src="gambar/sesi-05/w-01.png"><img src="gambar/sesi-05/m-01.png"></div>

Kotak pencarian dan laci Keluhan ada di atas, karena itu dua cara utama Pengunjung mencari obat. Setiap kartu langsung menampilkan harga, golongan, dan status stok, sehingga harga ditemukan dalam paling banyak 2 langkah. Tautan "Masuk Staf" sengaja kecil di pojok kanan atas: Pengunjung tidak terganggu, tetapi Staf tidak perlu menggulir ke bawah.

#### 02 Detail obat (HP)

<div class="dua"><img src="gambar/sesi-05/w-02.png"><img src="gambar/sesi-05/m-02.png"></div>

Golongan obat diberi kotak tersendiri berisi logo dan penjelasan singkat, karena banyak orang belum memperhatikan logo golongan (M-06). Ada catatan "Informasi ini bersifat umum" dan tombol "Tanya lewat WhatsApp", tetapi tidak ada tombol beli, karena ApotikKu tidak melayani pemesanan online.

#### 03 Masuk Staf (HP)

<div class="dua"><img src="gambar/sesi-05/w-03.png"><img src="gambar/sesi-05/m-03.png"></div>

Di HP kotak masuk diletakkan dekat bagian atas, bukan di tengah, supaya tombol Masuk tidak tertutup keyboard. Pesan gagal selalu "Email atau password salah." agar orang lain tidak bisa menebak email mana yang terdaftar.

#### 04 Struk 58 mm

<div class="satu-kecil"><img src="gambar/sesi-05/w-04.png"><img src="gambar/sesi-05/m-04.png"></div>

Lebar mengikuti kertas printer thermal 58 mm yang umum dipakai kasir. Angka memakai huruf monospace (setiap karakter sama lebar) supaya kolom harga lurus seperti struk pada umumnya.

#### 05 Katalog (laptop)

<img src="gambar/sesi-05/w-05.png" width="100%"><img src="gambar/sesi-05/m-05.png" width="100%">

Isi kartu sama persis dengan versi HP, hanya disusun tiga kolom. Pengguna tidak perlu belajar dua tampilan yang berbeda.

#### 06 Ringkasan (Admin)

<img src="gambar/sesi-05/w-06.png" width="100%"><img src="gambar/sesi-05/m-06.png" width="100%">

Halaman pertama Admin menjawab dua pertanyaan pemilik apotek: berapa pendapatan hari ini, dan obat mana yang perlu dibeli atau ditarik dari rak (M-02, M-04). Kelompok sengaja tidak memakai grafik, karena angka dan daftar nama obat lebih cepat dibaca dan langsung bisa ditindaklanjuti.

#### 07 Jual (Kasir)

<img src="gambar/sesi-05/w-07.png" width="100%"><img src="gambar/sesi-05/m-07.png" width="100%">

Bagian kiri untuk mencari obat, bagian kanan untuk keranjang, sehingga Kasir tidak perlu berpindah halaman (target 3 obat selesai ≤ 30 detik, M-03). Kotak Cek resep berwarna kuning dan hanya muncul bila keranjang berisi Obat keras. Total ditulis paling besar karena itu angka yang disebutkan Kasir ke pembeli.

#### 08 Penjualan hari ini

<img src="gambar/sesi-05/w-08.png" width="100%"><img src="gambar/sesi-05/m-08.png" width="100%">

Tombol Batalkan hanya terlihat oleh Admin. Kasir tidak bisa membatalkan Penjualan, supaya uang yang sudah diterima tidak bisa "dihilangkan" dengan membatalkan transaksinya. Penjualan yang dibatalkan tetap tampil dengan status merah, tidak dihapus.

#### 09 Kelola obat (Admin)

<img src="gambar/sesi-05/w-09.png" width="100%"><img src="gambar/sesi-05/m-09.png" width="100%">

Daftar obat di kiri dan formulir di kanan, sehingga Admin bisa membandingkan sambil mengubah. Peringatan kuning muncul bila harga jual melebihi HET (M-05), tetapi tetap bisa disimpan karena harga resmi bisa sudah berubah. Tidak ada tombol Hapus, hanya Arsipkan, agar riwayat penjualan obat itu tidak hilang.

#### 10 Laporan (Admin)

<img src="gambar/sesi-05/w-10.png" width="100%"><img src="gambar/sesi-05/m-10.png" width="100%">

Admin cukup memilih rentang tanggal lalu menekan Tampilkan. Pilihan "jenis laporan" di aplikasi versi lama dihapus karena tidak berfungsi dan membingungkan. Tombol Cetak menghasilkan halaman A4.

### 4. Warna dan huruf pada mockup

| Unsur | Pilihan | Alasan |
|---|---|---|
| Latar | Krem kertas #F4EFE2 dan etiket #FFFCF3 | Meniru kertas etiket apotek; lebih nyaman di mata daripada putih terang |
| Warna utama | Hijau apotek tua #1F4A36 | Warna apotek yang tenang dan dipercaya; kontras tinggi dengan tulisan putih |
| Warna golongan | Hijau, biru, dan merah mengikuti logo resmi BPOM | Tidak diubah, supaya sama dengan logo pada kemasan obat |
| Peringatan | Kuning (Cek resep, HET) dan coklat (Hampir habis) | Menarik perhatian tanpa terkesan "error" |
| Huruf isi | IBM Plex Sans | Huruf gratis yang jelas di layar kecil, dengan angka yang mudah dibedakan |
| Huruf harga | IBM Plex Mono | Setiap angka sama lebar, sehingga harga dalam satu daftar sejajar |

### 5. Review desain bersama kelompok

Desain ditinjau bersama anggota kelompok. Masukan dan keputusannya:

| No | Halaman | Masukan | Keputusan |
|---|---|---|---|
| 1 | Katalog | Tautan Masuk Staf di bagian paling bawah membuat Staf harus menggulir melewati semua obat | Dipindah ke pojok kanan atas, dibuat kecil |
| 2 | Masuk Staf | Di HP, kotak di tengah layar membuat tombol Masuk tertutup keyboard | Di HP kotak diletakkan di atas, di laptop tetap di tengah |
| 3 | Katalog | Nama obat yang panjang menumpuk dengan baris di bawahnya | Nama tampilan dipersingkat, misalnya "OBH 100 ml" |
| 4 | Detail obat | Perlu ditegaskan bahwa ApotikKu tidak menjual online | Tidak ada tombol beli; diganti "Tanya lewat WhatsApp" |
| 5 | Jual | Kasir bisa lupa menanyakan resep untuk Obat keras | Kotak Cek resep kuning muncul otomatis dan wajib dicentang |
| 6 | Penjualan hari ini | Bila Kasir bisa membatalkan, uang bisa tidak tercatat | Tombol Batalkan hanya untuk Admin |

### 6. Kesimpulan

Sepuluh halaman ApotikKu sudah dirancang dalam bentuk wireframe dan mockup di Figma. Setiap keputusan tampilan bisa ditelusuri ke masalah dan kebutuhan di SKPL, misalnya letak Cek resep (Obat keras wajib resep) atau tidak adanya tombol Hapus pada obat (riwayat penjualan harus utuh). Desain ini menjadi acuan saat setiap halaman dibuat dalam kode pada tahap berikutnya.
