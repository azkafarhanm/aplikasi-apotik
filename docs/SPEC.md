# SPEC: ApotikKu versi 1

> **SPEC (spesifikasi)** = dokumen yang menjelaskan *bagaimana* produk di [`PRD.md`](PRD.md) akan dibuat: bentuk database, alamat halaman, aturan keamanan, dan cara mengujinya.
> *Analogi:* PRD itu daftar keinginan pemilik rumah ("tiga kamar, dapur terbuka"). SPEC itu gambar kerja tukang (ukuran, letak pipa, jenis semen).
> Istilah domain mengikuti [`CONTEXT.md`](../CONTEXT.md). Alasan keputusan besar ada di [`KENAPA.md`](KENAPA.md) dan [`adr/`](adr/).

| | |
|---|---|
| Versi | 1.1, 9 Oktober 2026 (tiket #2: skema `private`, kunci lewat connector, data uji) |
| Status | Siap dipecah menjadi tiket (langkah 5) |
| Dasar | PRD 1.0, ADR 0001–0004, prototipe Katalog (kartu etiket + laci Keluhan) |

---

## 1. Masalah

Dilihat dari sisi pengguna (lengkapnya di PRD bagian 3):

- **Pengunjung** harus datang atau bertanya langsung untuk tahu obat ada atau tidak dan berapa harganya. Banyak juga yang belum paham mana obat yang perlu resep.
- **Kasir** melayani lama kalau pembeli membeli beberapa obat, dan stok di catatan sering tidak sama dengan yang ada di rak.
- **Admin** terlambat tahu stok hampir habis atau obat mendekati kedaluwarsa, menyusun laporan secara manual, dan tidak punya pengingat bila harga jual melewati HET.
- ApotikKu versi 1 tidak bisa diandalkan: data hanya ada di satu browser, login bisa dilewati, satu Penjualan hanya untuk satu obat.

## 2. Solusi

Satu aplikasi web dengan dua sisi:

- **Katalog** (publik, untuk HP): Pengunjung mencari obat lewat nama atau laci Keluhan. Kartu etiket langsung menampilkan harga jual, Golongan obat dalam bahasa sederhana, dan Status stok. Ada tombol untuk bertanya lewat WhatsApp.
- **Area staf** (wajib login, untuk laptop/tablet): Kasir mencatat Penjualan berisi banyak obat dan mencetak Struk. Admin juga mengelola obat, melihat Ringkasan, membuat Laporan, dan melakukan Pembatalan.

Semua aturan penting (siapa boleh apa, stok tidak boleh minus, harga diambil dari database) ditegakkan **di database**, sehingga tetap berlaku walaupun tampilan punya bug atau ada orang yang mencoba mengirim perintah langsung.

## 3. User story

> **User story** = kebutuhan yang ditulis dari sudut pandang pengguna: "Sebagai *siapa*, saya ingin *apa*, supaya *manfaatnya apa*." *Analogi:* catatan pesanan pelanggan di restoran, bukan resep di dapur.

### Pengunjung

1. Sebagai Pengunjung, saya ingin membuka Katalog tanpa daftar atau login, supaya bisa langsung mengecek obat. (F-01)
2. Sebagai Pengunjung, saya ingin mengetik sebagian nama obat (misalnya "para") dan langsung melihat hasilnya, supaya tidak perlu tahu ejaan lengkapnya. (F-01)
3. Sebagai Pengunjung, saya ingin pencarian tidak membedakan huruf besar dan kecil, supaya "Parasetamol" dan "parasetamol" sama-sama ketemu. (F-01)
4. Sebagai Pengunjung yang hanya tahu keluhannya, saya ingin mengetuk laci Keluhan (misalnya "Batuk & Flu"), supaya melihat obat yang relevan tanpa tahu namanya. (F-02)
5. Sebagai Pengunjung, saya ingin mengetuk laci yang sama sekali lagi untuk membatalkan saringan, supaya bisa kembali melihat semua obat. (F-02)
6. Sebagai Pengunjung tanpa resep dokter, saya ingin menyalakan pilihan "Tanpa resep", supaya hanya melihat obat yang boleh saya beli. (F-02)
7. Sebagai Pengunjung, saya ingin melihat harga jual, golongan, dan Status stok langsung di kartu, supaya harga ketemu dalam ≤ 2 langkah. (F-03, NF-03)
8. Sebagai Pengunjung, saya ingin setiap kartu menampilkan tanda golongan resmi beserta tulisannya ("Perlu resep dokter"), supaya saya belajar mengenali tanda di kemasan obat. (F-03, M-06)
9. Sebagai Pengunjung buta warna, saya ingin golongan obat tidak hanya dibedakan dengan warna, supaya tetap bisa memahaminya. (ADR 0004)
10. Sebagai Pengunjung, saya ingin melihat satuan jual beserta isinya ("per strip · 10 tablet"), supaya tahu apa yang saya dapat dengan harga itu. (aturan bisnis 4)
11. Sebagai Pengunjung, saya ingin tahu obat itu Tersedia, Hampir habis, atau Habis, supaya bisa memutuskan datang atau tidak. (F-03)
12. Sebagai Pengunjung, saya ingin obat yang Habis tetap tampil dengan tanda Habis (tidak disembunyikan), supaya tahu apotek ini biasanya menjualnya. (F-03)
13. Sebagai Pengunjung, saya ingin membuka halaman detail obat berisi kegunaan umum dan penjelasan golongan, supaya lebih yakin sebelum datang. (F-03)
14. Sebagai Pengunjung, saya ingin tombol Kembali di HP menutup halaman detail dan mengembalikan saya ke daftar, supaya tidak tersesat. (NF-03)
15. Sebagai Pengunjung, saya ingin bisa mengirim tautan halaman detail obat ke keluarga, supaya mereka bisa ikut mengecek. (F-03)
16. Sebagai Pengunjung, saya ingin selalu melihat catatan "Informasi ini bersifat umum. Tanyakan apoteker sebelum memakai obat.", supaya tidak memakai obat hanya berdasarkan Katalog. (aturan bisnis 8)
17. Sebagai Pengunjung, saya ingin mengetuk tombol WhatsApp yang sudah berisi nama obat, supaya bisa langsung bertanya ke apotek. (F-04)
18. Sebagai Pengunjung yang tidak menemukan obat, saya ingin pesan "Obat tidak ditemukan" beserta ajakan bertanya lewat WhatsApp, supaya tidak berhenti di jalan buntu. (F-01, F-04)
19. Sebagai Pengunjung dengan koneksi 4G biasa, saya ingin Katalog terbuka dalam < 3 detik, supaya tidak menunggu lama. (NF-05)
20. Sebagai Pengunjung, saya ingin Katalog nyaman dibaca di layar HP selebar 360 px, supaya tidak perlu memperbesar layar. (NF-04)

### Staf (Kasir dan Admin)

21. Sebagai Staf, saya ingin masuk dengan email dan password, supaya hanya orang apotek yang bisa membuka Area staf. (F-05)
22. Sebagai Staf yang salah mengetik password, saya ingin pesan "Email atau password salah" tanpa keterangan mana yang salah, supaya orang asing tidak bisa menebak email Staf. (NF-01)
23. Sebagai Staf, saya ingin langsung diarahkan ke halaman kerja saya setelah masuk (Kasir ke Jual, Admin ke Ringkasan), supaya tidak perlu mencari menu. (NF-03)
24. Sebagai Staf, saya ingin tombol Keluar benar-benar mengakhiri sesi, supaya orang berikutnya di komputer yang sama tidak bisa memakai akun saya. (F-05, kelemahan v1 no. 3)
25. Sebagai Staf, saya ingin tetap masuk walaupun halaman dimuat ulang, supaya tidak perlu login berkali-kali dalam satu shift. (F-05)
26. Sebagai orang yang belum login, saya ingin diarahkan ke halaman masuk saat membuka alamat Area staf, supaya jelas bahwa halaman itu khusus Staf. (F-05)
27. Sebagai Staf, saya ingin melihat menu sesuai peran saya saja, supaya tidak bingung dengan tombol yang tidak bisa saya pakai. (PRD bagian 4)

### Kasir

28. Sebagai Kasir, saya ingin mencari obat dengan mengetik nama di layar Jual, supaya cepat menemukan obat yang diminta pembeli. (F-06)
29. Sebagai Kasir, saya ingin melihat jumlah stok persis setiap obat saat mencari, supaya tahu apakah permintaan pembeli bisa dipenuhi. (PRD bagian 4)
30. Sebagai Kasir, saya ingin menambahkan beberapa obat ke keranjang dalam satu Penjualan, supaya pembeli yang membeli 3 obat cukup dilayani sekali. (F-06, M-03)
31. Sebagai Kasir, saya ingin mengubah jumlah atau menghapus obat dari keranjang sebelum Penjualan disimpan, supaya kesalahan bisa diperbaiki. (F-06)
32. Sebagai Kasir, saya ingin total dihitung otomatis, supaya tidak salah hitung. (F-06)
33. Sebagai Kasir, saya ingin obat Habis atau Sudah kedaluwarsa tidak bisa ditambahkan ke keranjang, supaya tidak menjual obat yang tidak boleh dijual. (F-12)
34. Sebagai Kasir, saya ingin diingatkan bila jumlah di keranjang melebihi stok, supaya tidak menjanjikan barang yang tidak ada. (F-12)
35. Sebagai Kasir, saya ingin diminta mencentang "Cek resep" bila keranjang berisi Obat keras, supaya saya ingat memeriksa resep dokter. (F-06, aturan bisnis 3)
36. Sebagai Kasir, saya ingin memilih cara bayar tunai atau QRIS/transfer, supaya pencatatan sesuai kenyataan. (aturan bisnis 6)
37. Sebagai Kasir, saya ingin mengetik uang yang diterima dan melihat kembalian otomatis, supaya tidak salah memberi kembalian. (F-06)
38. Sebagai Kasir, saya ingin tombol simpan ditolak bila uang yang diterima kurang dari total, supaya tidak terjadi kekurangan bayar. (F-06)
39. Sebagai Kasir, saya ingin pesan yang jelas bila Penjualan gagal (misalnya "Stok Ambroksol tinggal 3 strip"), supaya tahu apa yang harus diperbaiki. (NF-03)
40. Sebagai Kasir, saya ingin keranjang tidak hilang bila penyimpanan gagal, supaya tidak perlu memasukkan ulang semua obat. (NF-03)
41. Sebagai Kasir, saya ingin mencetak Struk 58 mm setelah Penjualan tersimpan, supaya pembeli mendapat bukti. (F-07)
42. Sebagai Kasir, saya ingin mencetak ulang Struk dari daftar Penjualan hari ini, supaya bisa melayani pembeli yang meminta struk lagi. (F-07, F-08)
43. Sebagai Kasir, saya ingin melihat daftar Penjualan yang saya catat hari ini, supaya bisa mengecek pekerjaan saya. (F-08)
44. Sebagai Kasir, saya ingin menyelesaikan Penjualan 3 jenis obat dalam ≤ 30 detik, supaya antrean tidak menumpuk. (NF-03)
45. Sebagai Kasir baru, saya ingin bisa memakai layar Jual setelah ≤ 5 menit penjelasan, supaya cepat bekerja. (NF-03)

### Admin

46. Sebagai Admin, saya ingin semua yang bisa dilakukan Kasir, supaya bisa menggantikan Kasir saat ramai. (PRD bagian 4)
47. Sebagai Admin, saya ingin melihat pendapatan hari ini di Ringkasan, supaya tahu kondisi apotek tanpa membuka laporan. (F-09)
48. Sebagai Admin, saya ingin melihat daftar obat Hampir habis di Ringkasan, supaya bisa memesan ulang sebelum Habis. (F-09, M-02)
49. Sebagai Admin, saya ingin melihat daftar obat Segera kedaluwarsa dan Sudah kedaluwarsa di Ringkasan, supaya bisa menariknya dari rak tepat waktu. (F-09, M-02)
50. Sebagai Admin, saya ingin menambah obat baru lengkap dengan nama, Bentuk, Keluhan, golongan, Satuan jual dan isinya, kegunaan, harga jual, harga acuan, stok, dan tanggal kedaluwarsa, supaya Katalog dan kasir langsung memakainya. (F-10)
51. Sebagai Admin, saya ingin mengubah data obat, termasuk menambah stok saat barang datang, supaya data sesuai rak. (F-10)
52. Sebagai Admin, saya ingin diperingatkan (tetapi tidak dihalangi) bila harga jual lebih tinggi dari harga acuan, supaya sadar sedang melewati HET. (F-13, M-05)
53. Sebagai Admin, saya ingin mengosongkan harga acuan untuk obat yang tidak punya HET, supaya data tetap jujur. (aturan bisnis 5)
54. Sebagai Admin, saya ingin Mengarsipkan obat yang tidak dijual lagi, supaya hilang dari Katalog dan kasir tanpa menghapus riwayat Penjualannya. (F-10, aturan bisnis 7)
55. Sebagai Admin, saya ingin mengembalikan obat dari arsip, supaya kesalahan arsip bisa dibatalkan. (F-10)
56. Sebagai Admin, saya ingin perubahan harga tidak mengubah harga di Penjualan yang sudah tercatat, supaya laporan lama tetap benar. (NF-06, aturan bisnis 5)
57. Sebagai Admin, saya ingin membuat laporan pendapatan untuk hari ini, bulan ini, atau rentang tanggal tertentu, supaya tidak menyusun laporan manual. (F-11, M-04)
58. Sebagai Admin, saya ingin laporan memuat total pendapatan, jumlah Penjualan, rincian per hari, dan rincian per obat, supaya tahu obat mana yang paling laku. (F-11)
59. Sebagai Admin, saya ingin mencetak laporan, supaya bisa diarsipkan di kertas. (F-11)
60. Sebagai Admin, saya ingin Penjualan yang Dibatalkan tidak dihitung sebagai pendapatan, supaya laporan sesuai uang yang benar-benar masuk. (F-14)
61. Sebagai Admin, saya ingin membatalkan Penjualan dengan menuliskan alasannya, supaya stok kembali dan ada catatan kenapa dibatalkan. (F-14)
62. Sebagai Admin, saya ingin Penjualan yang dibatalkan tetap terlihat dengan tanda Dibatalkan, supaya jejaknya tidak hilang. (F-14, aturan bisnis 7)
63. Sebagai Admin, saya ingin melihat Penjualan semua Kasir, supaya bisa memeriksa pekerjaan mereka. (PRD bagian 4)
64. Sebagai Admin, saya ingin diminta konfirmasi sebelum membatalkan Penjualan atau mengarsipkan obat, supaya tidak terjadi salah klik. (NF-03)

### Sistem dan keamanan

65. Sebagai pemilik apotek, saya ingin Pengunjung tidak bisa mengubah data apa pun walau mencoba langsung ke database, supaya data aman. (NF-01)
66. Sebagai pemilik apotek, saya ingin jumlah stok persis dan harga acuan tidak terlihat oleh Pengunjung, supaya data bisnis tetap internal. (PRD bagian 4, ADR 0002)
67. Sebagai pemilik apotek, saya ingin stok tidak pernah minus, termasuk saat dua Kasir menjual obat terakhir bersamaan, supaya stok di sistem selalu sama dengan rak. (NF-06, M-01)
68. Sebagai pemilik apotek, saya ingin Penjualan tersimpan utuh atau tidak sama sekali, supaya tidak ada stok berkurang tanpa catatan Penjualan. (NF-06)
69. Sebagai pemilik apotek, saya ingin harga di Penjualan selalu diambil dari database, bukan dari layar kasir, supaya harga tidak bisa dimanipulasi. (aturan bisnis 6)
70. Sebagai pemilik apotek, saya ingin Kasir tidak bisa mengubah harga atau stok secara langsung, supaya tidak ada celah kecurangan. (ADR 0003)
71. Sebagai pemilik apotek, saya ingin tidak ada pendaftaran akun untuk umum, supaya orang asing tidak bisa membuat akun Staf. (NF-01)
72. Sebagai pemilik apotek, saya ingin "hari ini" dihitung menurut waktu Indonesia Barat, supaya Penjualan pukul 23.30 tidak terhitung sebagai hari berikutnya. (F-08, F-09)
73. Sebagai pemilik apotek, saya ingin seluruh layanan memakai paket gratis, supaya biaya bulanan Rp0. (NF-07)

## 4. Keputusan implementasi

### 4.1 Bagian-bagian aplikasi

| Bagian | Tugas | Siapa yang memakai |
|---|---|---|
| **Halaman Katalog** | Menampilkan daftar dan detail obat dari tampilan database `katalog`; menyaring di HP Pengunjung | Pengunjung |
| **Halaman Area staf** | Layar Jual, Penjualan hari ini, Struk, Ringkasan, Obat, Laporan | Kasir, Admin |
| **Proxy (satpam halaman)** | Memperbarui sesi login dan mengarahkan yang belum login dari `/staf/*` ke `/masuk`; mengarahkan Kasir yang membuka halaman khusus Admin ke layar Jual | Semua |
| **Penghubung Supabase** | Dua jenis: untuk browser dan untuk server. Keduanya memakai kunci publik (anon key) dan sesi Staf yang login, sehingga RLS selalu berlaku. Sesi disimpan di cookie lewat pustaka resmi `@supabase/ssr` | Semua |
| **Database** | Tabel, tampilan `katalog`, fungsi database, dan aturan RLS. **Semua aturan bisnis yang wajib benar tinggal di sini** | Semua |

> **Cookie** = catatan kecil yang disimpan browser dan dikirim setiap kali membuka halaman. *Analogi:* gelang pengunjung di kolam renang; selama gelang dipakai, petugas tahu kamu sudah membayar.

Kunci rahasia Supabase (service role key) **tidak pernah** dipakai di aplikasi (ADR 0003). Data awal dan akun Staf dibuat lewat file SQL dan dasbor Supabase.

### 4.2 Alamat halaman (route)

> **Route** = alamat halaman di aplikasi. *Analogi:* nomor ruangan di gedung.

| Alamat | Isi | Boleh dibuka | Fitur |
|---|---|---|---|
| `/` | Katalog: pencarian, laci Keluhan, "Tanpa resep", kartu etiket | Semua orang | F-01, F-02, F-03 |
| `/obat/[slug]` | Detail obat dalam bentuk etiket + tombol WhatsApp | Semua orang | F-03, F-04 |
| `/masuk` | Formulir login Staf | Semua orang | F-05 |
| `/staf` | Hanya mengarahkan: Kasir ke `/staf/jual`, Admin ke `/staf/ringkasan` | Staf | F-05 |
| `/staf/jual` | Layar kasir: cari obat, keranjang, Cek resep, bayar | Kasir, Admin | F-06 |
| `/staf/penjualan` | Penjualan hari ini (Kasir: miliknya; Admin: semua, dengan tombol Batalkan) | Kasir, Admin | F-08, F-14 |
| `/staf/penjualan/[nomor]/struk` | Struk 58 mm siap cetak | Kasir (miliknya), Admin | F-07 |
| `/staf/ringkasan` | Pendapatan hari ini, Hampir habis, Segera/Sudah kedaluwarsa | Admin | F-09 |
| `/staf/obat` | Daftar obat (termasuk yang diarsipkan, bisa disaring) | Admin | F-10 |
| `/staf/obat/baru` | Formulir obat baru | Admin | F-10, F-13 |
| `/staf/obat/[id]` | Ubah, arsipkan, atau kembalikan obat | Admin | F-10, F-13 |
| `/staf/laporan` | Laporan per periode, siap cetak | Admin | F-11 |

Keluar (logout) adalah tombol di semua halaman `/staf/*`, bukan halaman tersendiri.

- `slug` = versi nama obat yang aman untuk alamat web, misalnya `parasetamol-500-mg`. Dibuat otomatis dari nama saat obat ditambahkan dan tidak berubah walau nama diubah, supaya tautan yang sudah dibagikan tetap jalan.
- **Detail obat punya alamat sendiri** (bukan sekadar jendela di atas daftar seperti di prototipe), supaya tombol Kembali di HP bekerja wajar dan tautannya bisa dikirim lewat WhatsApp (user story 14 dan 15). Tampilannya tetap etiket seperti di prototipe.

### 4.3 Skema database

> **Skema** = rancangan bentuk tabel: tabel apa saja, kolom apa saja, dan aturannya. *Analogi:* format kolom di buku besar sebelum diisi.

Prinsip umum:
- **Uang disimpan sebagai bilangan bulat rupiah** (misalnya `4000`), bukan angka desimal. Angka desimal di komputer bisa meleset sedikit (0,1 + 0,2 tidak persis 0,3), dan rupiah tidak punya sen.
- **Data tidak pernah dihapus.** Obat diarsipkan, Penjualan dibatalkan (aturan bisnis 7). Tidak ada izin hapus (DELETE) untuk siapa pun dari aplikasi.
- Pilihan yang terbatas (golongan, Satuan jual, Keluhan, dll.) dijaga dengan aturan di database, supaya data salah ketik ditolak sejak awal.

**Tabel `profil_staf`** (satu baris per akun Staf)

| Kolom | Isi | Aturan |
|---|---|---|
| `id` | Sama dengan id akun login Supabase | Kunci utama, merujuk akun login |
| `nama_tampilan` | Nama yang muncul di layar dan Struk, misalnya "Kasir 1" | Wajib |
| `peran` | `admin` atau `kasir` | Wajib, hanya dua nilai ini |
| `aktif` | Akun masih boleh dipakai atau tidak | Bawaan: ya. Staf nonaktif ditolak semua fungsi |
| `dibuat_pada` | Waktu dibuat | Otomatis |

**Tabel `obat`**

| Kolom | Isi | Aturan |
|---|---|---|
| `id` | Nomor urut | Kunci utama |
| `slug` | Nama untuk alamat web | Unik, otomatis dari nama |
| `nama` | Misalnya "Parasetamol 500 mg" | Wajib |
| `bentuk` | Tablet, kapsul, tablet kunyah, sirup, salep, krim, cairan, serbuk, tetes | Hanya nilai dari daftar |
| `keluhan` | Satu dari 6 Keluhan di F-02 | Hanya nilai dari daftar |
| `golongan` | `bebas`, `bebas_terbatas`, `keras` | Hanya nilai dari daftar |
| `satuan_jual` | strip, botol, tube, sachet | Hanya nilai dari daftar |
| `isi_per_satuan` | Misalnya "10 tablet", "60 ml", "5 g" | Wajib (dipakai di kartu: "per strip · 10 tablet") |
| `kegunaan` | Kalimat singkat tanpa dosis | Wajib |
| `harga_jual` | Rupiah | Wajib, lebih dari 0 |
| `harga_acuan` | HET dalam rupiah | Boleh kosong, bila diisi lebih dari 0 |
| `stok` | Jumlah dalam Satuan jual | Wajib, tidak boleh kurang dari 0 |
| `tanggal_kedaluwarsa` | Tanggal kedaluwarsa terdekat | Wajib (aturan bisnis 2) |
| `diarsipkan` | Disembunyikan dari Katalog dan kasir | Bawaan: tidak |
| `dibuat_pada`, `diubah_pada` | Waktu | Otomatis |

Satu obat **satu Keluhan** di versi 1. Hampir semua obat di data awal punya satu kegunaan utama, dan satu kolom jauh lebih sederhana daripada tabel penghubung banyak-ke-banyak. Bila nanti ada obat yang benar-benar perlu dua Keluhan, kolom ini bisa diubah menjadi daftar lewat migrasi baru.

**Tabel `penjualan`**

| Kolom | Isi | Aturan |
|---|---|---|
| `id` | Nomor urut | Kunci utama |
| `nomor` | Nomor yang tercetak di Struk, misalnya `PJ-000123` | Unik, dibuat otomatis dari `id` |
| `kasir_id` | Staf yang mencatat | Merujuk `profil_staf` |
| `waktu` | Waktu Penjualan | Otomatis |
| `total` | Jumlah semua Item penjualan, rupiah | Dihitung fungsi database |
| `metode_bayar` | `tunai` atau `qris_transfer` | Hanya dua nilai ini |
| `uang_diterima` | Untuk tunai | Wajib bila tunai dan ≥ total; kosong bila QRIS/transfer |
| `kembalian` | Untuk tunai | Dihitung fungsi database |
| `cek_resep` | Kasir sudah memeriksa resep | Wajib "ya" bila ada Obat keras |
| `status` | `selesai` atau `dibatalkan` | Bawaan: selesai |
| `dibatalkan_oleh`, `dibatalkan_pada`, `alasan_batal` | Data Pembatalan | Wajib terisi ketiganya bila Dibatalkan |

**Tabel `item_penjualan`**

| Kolom | Isi | Aturan |
|---|---|---|
| `id` | Nomor urut | Kunci utama |
| `penjualan_id` | Penjualan induknya | Merujuk `penjualan` |
| `obat_id` | Obat yang dijual | Merujuk `obat` |
| `jumlah` | Banyaknya dalam Satuan jual | Lebih dari 0 |
| `harga_satuan` | **Harga jual saat terjual** (salinan, bukan rujukan) | Diisi fungsi database |
| `subtotal` | `jumlah × harga_satuan` | Diisi fungsi database |

Satu obat hanya boleh muncul sekali dalam satu Penjualan (jumlahnya yang ditambah, bukan barisnya).

**Status stok dihitung di satu tempat.** Fungsi database `status_stok` menerima stok dan tanggal kedaluwarsa, lalu mengembalikan `habis`, `hampir_habis`, atau `tersedia`. Fungsi ini dipakai oleh tampilan Katalog, layar kasir, dan Ringkasan, sehingga aturannya tidak mungkin berbeda di tiga tempat. Aturannya mengikuti PRD bagian 8:

| Keadaan | Status stok |
|---|---|
| Tanggal kedaluwarsa sudah lewat (sebelum hari ini) | Habis |
| Stok 0 | Habis |
| Stok 1–20 | Hampir habis |
| Stok > 20 | Tersedia |

Obat dianggap **Segera kedaluwarsa** bila tanggal kedaluwarsanya hari ini sampai 90 hari ke depan, dan **Sudah kedaluwarsa** bila sebelum hari ini. Obat yang tanggal kedaluwarsanya *hari ini* masih boleh dijual.

**"Hari ini" selalu menurut WIB (Asia/Jakarta)**, bukan waktu server (yang biasanya UTC, 7 jam di belakang). Ini berlaku untuk kedaluwarsa, Penjualan hari ini, Ringkasan, dan Laporan.

**Tampilan `katalog`** (yang dibaca Pengunjung)

> **Tampilan (view)** = "jendela" ke tabel yang hanya memperlihatkan kolom tertentu. *Analogi:* etalase toko; pembeli melihat barang dan harga, tetapi tidak melihat buku stok di gudang.

Isinya hanya obat yang tidak diarsipkan, dengan kolom: `slug`, `nama`, `bentuk`, `keluhan`, `golongan`, `satuan_jual`, `isi_per_satuan`, `kegunaan`, `harga_jual`, dan `status_stok`. **Tidak ada** `stok`, `harga_acuan`, atau tanggal kedaluwarsa.

**Fungsi bantu tinggal di skema `private`** (ditambahkan 9 Oktober 2026, tiket #2): `status_stok`, `hari_ini`, dan fungsi pembentuk slug. PostgreSQL mengecek izin *fungsi* di dalam tampilan memakai hak si pembaca, bukan hak pemilik tampilan, jadi Pengunjung perlu izin menjalankan `status_stok`. Karena Supabase hanya membuka skema `public` ke internet, fungsi di `private` tetap tidak bisa dipanggil langsung dari luar (sesuai SPEC 5.2), tetapi bisa dipakai tampilan `katalog`. Fungsi yang memang dipanggil aplikasi (`catat_penjualan`, dll.) tetap di `public`.

> **Skema** = folder di dalam database untuk mengelompokkan tabel dan fungsi. *Analogi:* ruang depan toko (dibuka untuk pembeli) dan ruang belakang (hanya untuk petugas).

Pengunjung tidak diberi izin membaca tabel `obat` sama sekali. Tampilan ini berjalan dengan hak pemiliknya, sehingga bisa menghitung Status stok dari kolom `stok` tanpa membocorkan angka stoknya. Alat pemeriksa Supabase akan memberi peringatan untuk tampilan seperti ini. Peringatan itu disengaja dan dicatat di migrasi, karena tampilan ini justru dirancang sebagai satu-satunya pintu yang aman untuk Pengunjung.

### 4.4 Fungsi database

> **Fungsi database** = perintah tetap yang disimpan dan dijalankan di dalam database. *Analogi:* loket resmi di kantor pos. Kamu tidak boleh masuk ke ruang sortir; kamu menyerahkan paket di loket, dan petugas yang mengerjakan sesuai prosedur.

Semua fungsi di bawah **mengecek sendiri** siapa pemanggilnya (Staf aktif? Admin?) dan **ditulis supaya tidak bisa dibelokkan**, misalnya dengan menetapkan dengan pasti tabel mana yang dipakai. Setiap fungsi berjalan sebagai satu transaksi database: berhasil semua atau batal semua.

| Fungsi | Dipanggil oleh | Yang dilakukan | Ditolak bila… |
|---|---|---|---|
| `peran_saya()` | Aturan RLS | Mengembalikan `admin`/`kasir` untuk Staf aktif yang sedang login, atau kosong | (tidak pernah menolak; dipakai sebagai alat bantu) |
| `catat_penjualan(keranjang, metode_bayar, uang_diterima, cek_resep)` | Layar Jual | Mengunci baris obat yang dibeli, mengecek semuanya, mengambil harga dari database, menghitung total dan kembalian, menyimpan Penjualan + Item penjualan, mengurangi stok. Mengembalikan nomor Penjualan | Bukan Staf aktif; keranjang kosong; jumlah ≤ 0; obat diarsipkan, Habis, atau Sudah kedaluwarsa; stok kurang; ada Obat keras tetapi `cek_resep` tidak dicentang; tunai tetapi uang kurang; QRIS/transfer tetapi uang diterima diisi |
| `batalkan_penjualan(nomor, alasan)` | Halaman Penjualan (Admin) | Mengubah status menjadi Dibatalkan, mencatat siapa, kapan, dan alasannya, lalu mengembalikan stok setiap Item penjualan | Bukan Admin; Penjualan tidak ada; sudah Dibatalkan; alasan kosong |
| `ringkasan()` | Halaman Ringkasan (Admin) | Pendapatan dan jumlah Penjualan hari ini, daftar Hampir habis, Segera kedaluwarsa, Sudah kedaluwarsa | Bukan Admin |
| `laporan_pendapatan(dari, sampai)` | Halaman Laporan (Admin) | Total pendapatan dan jumlah Penjualan (status selesai saja), rincian per hari, dan rincian per obat (jumlah terjual, pendapatan) | Bukan Admin; `dari` lebih besar dari `sampai` |

Detail penting `catat_penjualan`:
- **Keranjang dari layar hanya berisi `obat` dan `jumlah`.** Harga apa pun yang dikirim layar diabaikan (aturan bisnis 6).
- **Baris obat dikunci dalam urutan id.** Bila dua Kasir menjual obat yang sama bersamaan, Kasir kedua menunggu sepersekian detik lalu melihat stok terbaru. Urutan id mencegah dua Kasir saling menunggu selamanya (kebuntuan).
- **Pesan penolakan ditulis dalam bahasa sehari-hari dan menyebut obatnya**, misalnya "Stok Ambroksol 30 mg tinggal 3 strip", supaya bisa langsung ditampilkan ke Kasir.
- Kasir **tidak punya izin mengubah tabel `obat` secara langsung**. Pengurangan stok hanya terjadi di dalam fungsi ini.

### 4.5 Aturan hak akses (RLS)

> **RLS** = aturan di dalam database tentang siapa boleh membaca atau mengubah baris yang mana. *Analogi:* loker dengan kunci masing-masing (lihat ADR 0003).

✅ = boleh langsung · 🔧 = hanya lewat fungsi database · ❌ = ditolak

| Data | Aksi | Pengunjung | Kasir | Admin |
|---|---|:-:|:-:|:-:|
| Tampilan `katalog` | Baca | ✅ | ✅ | ✅ |
| Tabel `obat` | Baca | ❌ | ✅ (yang tidak diarsipkan) | ✅ (semua) |
| | Tambah / ubah | ❌ | ❌ (stok berkurang 🔧 lewat Penjualan) | ✅ |
| | Hapus | ❌ | ❌ | ❌ (pakai Arsipkan) |
| Tabel `profil_staf` | Baca | ❌ | ✅ (miliknya) | ✅ (semua) |
| | Tambah / ubah / hapus | ❌ | ❌ | ❌ (lewat dasbor Supabase sampai milestone 2) |
| Tabel `penjualan` | Baca | ❌ | ✅ (miliknya, hari ini) | ✅ (semua) |
| | Tambah | ❌ | 🔧 `catat_penjualan` | 🔧 `catat_penjualan` |
| | Batalkan | ❌ | ❌ | 🔧 `batalkan_penjualan` |
| | Hapus | ❌ | ❌ | ❌ |
| Tabel `item_penjualan` | Baca | ❌ | ✅ (milik Penjualannya) | ✅ (semua) |
| | Tambah / ubah / hapus | ❌ | 🔧 / ❌ / ❌ | 🔧 / ❌ / ❌ |
| Ringkasan, Laporan | Panggil | ❌ | ❌ | 🔧 |

**Kasir hanya melihat Penjualan miliknya hari ini.** Itu cukup untuk mengecek pekerjaan dan mencetak ulang Struk (F-07, F-08). Daftar Penjualan semua Kasir sama saja dengan laporan pendapatan harian, dan laporan pendapatan adalah wewenang Admin (PRD bagian 4).

Semua aturan RLS dipasang **di migrasi pertama**, sebelum ada fitur (ADR 0003).

### 4.6 Login dan sesi

- Login memakai Supabase Auth dengan email + password. **Pendaftaran akun umum dimatikan** di pengaturan Supabase.
- Sesi disimpan di cookie oleh `@supabase/ssr` dan diperbarui oleh proxy setiap kali halaman dibuka.
- Keluar memanggil fungsi keluar Supabase, yang menghapus cookie sesi (memperbaiki kelemahan v1 no. 3).
- Pesan gagal login selalu sama: "Email atau password salah."
- Akun Staf yang `aktif`-nya dimatikan masih bisa login, tetapi semua fungsi dan data menolaknya. Halaman menampilkan "Akun ini sudah tidak aktif. Hubungi Admin."

### 4.7 Katalog (dari prototipe)

Keputusan tata letak ada di ADR 0004 (kartu etiket + laci Keluhan). Perilakunya:

- Semua obat di tampilan `katalog` (±40 baris) dimuat **sekali** oleh server saat halaman dibuka. Pencarian dan saringan berjalan di HP Pengunjung tanpa meminta data lagi, jadi hasilnya muncul seketika (NF-05).
- Halaman Katalog **dibuat ulang setiap kali dibuka** (tidak disimpan di cache), supaya Status stok selalu sesuai Penjualan terakhir. Untuk ±40 obat ini tetap cepat.
- Pencarian: bagian dari nama, tanpa membedakan huruf besar-kecil.
- Laci Keluhan: hanya satu laci aktif; ketuk lagi untuk membatalkan. Setiap laci menampilkan jumlah obatnya.
- "Tanpa resep": menyembunyikan Obat keras.
- Urutan: menurut nama (A–Z). Obat Habis tetap tampil dengan status Habis.
- Kartu: Keluhan, Satuan jual + isi, tanda golongan, nama, Bentuk, tulisan golongan, Status stok, harga jual.
- WhatsApp: nomor apotek disimpan di pengaturan aplikasi (variabel lingkungan), bukan di kode. Tombol membuka WhatsApp dengan pesan awal "Halo ApotikKu, saya mau tanya tentang [nama obat]." Nomornya juga ditulis sebagai teks biasa, supaya bisa disalin bila tombol tidak bekerja.
- Warna merah hanya dipakai untuk tanda Obat keras. Status Habis memakai abu-abu (ADR 0004).

### 4.8 Layar Jual (Kasir)

- Kotak pencarian mendapat fokus otomatis; Kasir bisa mengetik nama lalu menekan Enter untuk menambahkan hasil teratas ke keranjang.
- Setiap hasil menampilkan stok persis dan Status stok. Obat Habis atau Sudah kedaluwarsa tampil tetapi tidak bisa dipilih.
- Keranjang disimpan di memori browser saja. Jumlah bisa diubah dengan tombol +/− atau diketik.
- Bila keranjang berisi Obat keras, kotak "Saya sudah memeriksa resep dokter" muncul dan wajib dicentang sebelum tombol simpan aktif.
- Cara bayar tunai: kolom uang diterima + tombol cepat (uang pas, 50.000, 100.000). Kembalian tampil langsung.
- Total di layar hanya perkiraan. Angka resmi datang dari `catat_penjualan`. Bila harga di database ternyata sudah berubah, Struk memakai harga database dan layar menampilkan pemberitahuan.
- Setelah berhasil: keranjang dikosongkan dan Struk dibuka, siap dicetak. Bila gagal: keranjang tetap, dan pesan dari database ditampilkan.

### 4.9 Struk dan Laporan cetak

- Struk memakai lebar kertas 58 mm lewat pengaturan cetak browser (aturan CSS khusus cetak). Isinya: nama apotek, alamat, nomor Penjualan, waktu (WIB), nama tampilan Kasir, daftar Item penjualan (nama, jumlah × harga, subtotal), total, cara bayar, uang diterima dan kembalian (bila tunai), serta tulisan "Terima kasih. Simpan struk ini sebagai bukti pembelian."
- Struk Penjualan yang Dibatalkan diberi tanda besar "DIBATALKAN".
- Laporan dicetak di kertas A4 dengan tombol Cetak browser.

### 4.10 Halaman Obat (Admin)

- Formulir memuat semua kolom tabel `obat` kecuali yang otomatis.
- Saat harga jual diisi lebih tinggi dari harga acuan, muncul peringatan kuning "Harga jual melebihi HET (Rp…)" tetapi tetap bisa disimpan (F-13).
- Menambah stok dilakukan dengan mengubah kolom stok. Pencatatan stok masuk dari supplier ada di milestone 2.
- Tombol Arsipkan dan Kembalikan selalu meminta konfirmasi.

### 4.11 Data awal

- **±40 obat generik** yang tersebar di 6 Keluhan, dengan harga acuan dari Keputusan Menteri Kesehatan tentang HET obat generik (PRD sumber [9]) dan golongan dicek ke sumber resmi BPOM. Setiap obat di data awal mencatat sumber harga acuannya. Harga jual awal = harga acuan (aturan bisnis 5). Stok dan tanggal kedaluwarsa dibuat beragam supaya semua Status stok dan keadaan kedaluwarsa muncul saat demo.
- **Dua akun uji** (satu Admin, satu Kasir) dengan email umum seperti `admin@apotikku.test`. Password tidak disimpan di repo.
- Data awal ditulis sebagai file SQL terpisah dari migrasi, supaya bisa dipasang ulang kapan saja.

> **Migrasi** = file berurutan berisi perubahan bentuk database. *Analogi:* resep langkah demi langkah; siapa pun yang mengikutinya mendapat database yang sama (ADR 0001).

### 4.12 Pengaturan Supabase

Disepakati 7 Oktober 2026:

| Hal | Keputusan | Alasan |
|---|---|---|
| Kapan dibuat | Saat tiket koding pertama dimulai | Project gratis dijeda bila ±7 hari tidak dipakai; tidak ada gunanya dibuat lebih awal |
| Pemilik | Satu akun milik pemilik repo, login dengan akun GitHub yang 2FA-nya aktif | Tidak ada password bersama yang beredar di grup. Anggota kelompok menguji lewat akun Staf uji di aplikasi, bukan lewat dasbor |
| Lokasi server database | Singapura | Terdekat dengan Indonesia, membantu NF-05. Tidak bisa diubah setelah project dibuat |
| Lokasi server aplikasi (Vercel) | Singapura (`sin1`), diatur di `vercel.json` (9 Oktober 2026, #18) | Sekota dengan database: setiap pertanyaan ke database tidak perlu menyeberang AS ↔ Singapura. Bawaan Vercel adalah Washington (`iad1`). Tanpa server cadangan: fiturnya berbayar dan database juga hanya di Singapura. Hasil ukur (PR #19): waktu tunggu database turun dari median 817 ms (server di AS) ke 38 ms; halaman Katalog selesai dimuat dari 1,09 s ke 0,51 s (diukur dari tempat yang sama) |
| Jumlah project | Dua: `apotikku` (asli) dan `apotikku-uji` (khusus tes otomatis) | Paket gratis mengizinkan 2 project. Project uji bisa dipakai dari laptop, sesi cloud, dan GitHub Actions tanpa Docker |
| Bila tertidur | Dasbor → Resume project (bisa sampai 90 hari). Lewat 90 hari: unduh cadangan atau bangun ulang dari migrasi + data awal di repo | Bentuk database dan data awal selalu tersimpan di repo |

**Kunci Supabase** (diperbarui 9 Oktober 2026, tiket #2): alamat project dan kunci publik (*publishable key*, nama baru untuk anon key) disimpan sebagai variabel lingkungan di tiga tempat saja: file `.env.local` di laptop (tidak ikut ke repo, contohnya di `.env.example`), pengaturan Vercel, dan *secrets* GitHub Actions untuk project uji. **Tidak ada kunci atau password database di pengaturan environment sesi cloud.** Migrasi dan data dipasang lewat connector Supabase yang tersambung ke akun pemilik repo, jadi sesi cloud tidak perlu memegang kunci apa pun. Kunci rahasia (service role / secret key) tidak disimpan di mana pun dalam aplikasi atau repo. Akun Staf uji dibuat sekali lewat dasbor.

> **Connector** = sambungan resmi antara asisten koding dan layanan lain (di sini Supabase) yang izinnya diberikan pemilik akun, bukan lewat kunci yang ditempel. *Analogi:* memberi kurir surat kuasa bertanda tangan untuk mengambil paket, bukan meminjamkan kunci rumah.

| File di repo | Isi | Dipasang di |
|---|---|---|
| `supabase/migrations/*.sql` | Bentuk database (tabel, fungsi, tampilan, RLS), berurutan | Kedua project |
| `supabase/data/contoh.sql` | Data contoh Katalog (diganti data awal lengkap di tiket #7) | `apotikku` |
| `supabase/uji/data-uji.sql` | Baris uji yang tetap + jadwal penyegar tanggal | `apotikku-uji` saja |

> **Variabel lingkungan** = pengaturan yang dibaca aplikasi saat berjalan, disimpan di luar kode. *Analogi:* PIN brankas yang dihafal penjaga, bukan ditulis di pintu brankas.

## 5. Keputusan pengujian

### 5.1 Satu titik uji: database

Semua aturan yang wajib benar tinggal di database, jadi **database adalah satu-satunya titik uji otomatis**. Tes berperan sebagai tiga orang (Pengunjung tanpa login, Kasir, Admin), lalu memanggil database **lewat jalur yang sama dengan aplikasi** (pustaka `supabase-js` dengan kunci publik). Dengan begitu, yang teruji adalah aturan sungguhan: izin, RLS, dan fungsi database sekaligus.

**Tes yang baik menguji perilaku yang terlihat dari luar, bukan cara kerjanya di dalam.** Contoh: "Kasir menjual 2 strip, stok berkurang 2 dan Struk berisi harga database" adalah tes yang baik. "Fungsi memanggil perintah UPDATE satu kali" bukan, karena tes itu rusak setiap kali isi fungsi dirapikan walaupun perilakunya tetap benar.

> **Tes otomatis** = program kecil yang memeriksa aplikasi bekerja sesuai aturan, dan bisa dijalankan ulang kapan saja dengan satu perintah. *Analogi:* daftar periksa pilot sebelum terbang, dijalankan setiap kali, bukan hanya sekali.

### 5.2 Daftar perilaku yang diuji

**Hak akses (NF-01)**
- Pengunjung bisa membaca `katalog`, dan kolomnya tidak memuat stok, harga acuan, atau tanggal kedaluwarsa.
- Pengunjung tidak bisa membaca `obat`, `penjualan`, `item_penjualan`, `profil_staf`, dan tidak bisa menambah atau mengubah apa pun.
- Pengunjung tidak bisa memanggil fungsi apa pun selain membaca `katalog`.
- Kasir tidak bisa mengubah `obat` secara langsung (termasuk harga dan stok).
- Kasir tidak bisa melihat Penjualan Kasir lain atau Penjualan kemarin.
- Kasir tidak bisa memanggil `batalkan_penjualan`, `ringkasan`, `laporan_pendapatan`.
- Staf yang dinonaktifkan ditolak semua fungsi.
- Obat yang diarsipkan tidak muncul di `katalog` dan tidak terbaca Kasir.

**Penjualan (NF-06, F-06, F-12)**
- Penjualan berhasil: stok berkurang sesuai jumlah, total dan kembalian benar, `harga_satuan` sama dengan harga jual di database.
- Harga yang dikirim dari layar diabaikan.
- Ditolak: keranjang kosong, jumlah ≤ 0, obat diarsipkan, Habis, Sudah kedaluwarsa, stok kurang.
- Ditolak: ada Obat keras tanpa Cek resep. Diterima: keranjang tanpa Obat keras walau Cek resep tidak dicentang.
- Ditolak: tunai dengan uang kurang; QRIS/transfer dengan uang diterima terisi.
- **Utuh atau tidak sama sekali**: keranjang berisi satu obat valid dan satu obat Habis ditolak seluruhnya, dan stok obat yang valid tidak berkurang.
- **Dua Kasir bersamaan**: obat dengan stok 1 dijual oleh dua panggilan serentak; tepat satu berhasil, satu ditolak, dan stok akhir 0.
- Mengubah harga jual setelah Penjualan tidak mengubah `harga_satuan` dan total Penjualan lama.

**Pembatalan (F-14)**
- Admin membatalkan: status Dibatalkan, stok kembali, siapa/kapan/alasan tercatat.
- Ditolak: membatalkan dua kali, alasan kosong.
- Penjualan Dibatalkan tidak dihitung di Ringkasan dan Laporan.

**Status stok dan kedaluwarsa (aturan bisnis 1–2)**
- Batas stok: 0 → Habis, 1 → Hampir habis, 20 → Hampir habis, 21 → Tersedia.
- Kedaluwarsa kemarin → Habis dan tidak bisa dijual; kedaluwarsa hari ini → masih bisa dijual.
- Segera kedaluwarsa: 90 hari lagi masuk Ringkasan, 91 hari lagi tidak.

**Ringkasan dan Laporan (F-09, F-11)**
- Total di laporan sama dengan penjumlahan manual data uji (ukuran M-04 di PRD).
- Penjualan pukul 23.30 WIB terhitung hari itu, bukan hari berikutnya.
- Rincian per obat menjumlahkan jumlah terjual dengan benar.

### 5.3 Alat dan tempat menjalankan

- **Database uji** terpisah dari database asli: project Supabase gratis kedua `apotikku-uji` (SPEC 4.12), sehingga tes bisa dijalankan dari laptop, sesi cloud, dan GitHub Actions tanpa Docker.
- **Alat tes**: Vitest (penjalan tes untuk JavaScript/TypeScript) + `supabase-js`. Tes hanya memegang kunci publik, jadi tes **tidak** membentuk ulang database. Database uji dibentuk dari migrasi yang sama dan diisi data uji yang tetap (`supabase/uji/data-uji.sql`) setiap kali ada migrasi baru, lewat connector Supabase.
- **Tanggal yang bergeser**: tes "kedaluwarsa kemarin" dan "kedaluwarsa hari ini" butuh tanggal yang selalu relatif terhadap hari ini (WIB). Project uji punya jadwal kecil (pg_cron) yang menyegarkan dua baris itu setiap menit. Jadwal ini hanya ada di project uji, tidak di project asli.
- **Tes yang mengubah data** (Penjualan, kelola obat) mulai tiket #6 dan #8 berjalan sebagai Staf uji dan membersihkan atau memakai data miliknya sendiri, supaya tes bisa diulang.

> **pg_cron** = penjadwal tugas di dalam PostgreSQL. *Analogi:* alarm yang setiap menit mengingatkan petugas mengganti kertas tanggal di papan.
- **Dijalankan otomatis** setiap ada Pull Request lewat GitHub Actions (gratis untuk repo publik), supaya perubahan yang merusak aturan ketahuan sebelum digabung.

> **GitHub Actions** = layanan GitHub yang menjalankan perintah otomatis setiap ada perubahan. *Analogi:* petugas QC di pabrik yang memeriksa setiap barang sebelum masuk gudang.

### 5.4 Yang diuji manual

- **Kemudahan pakai (NF-03)**: anggota kelompok berperan sebagai Pengunjung dan Kasir, diukur dengan stopwatch: harga ditemukan ≤ 2 langkah; Penjualan 3 obat ≤ 30 detik; Kasir baru siap setelah ≤ 5 menit penjelasan.
- **Tampilan (NF-04)**: Katalog dicek di layar 360 px; layar Jual di laptop/tablet.
- **Kecepatan (NF-05)**: Katalog dibuka di HP dengan koneksi 4G, waktu muat < 3 detik.
- **Cetak (F-07, F-11)**: Struk dicek di pratinjau cetak 58 mm; Laporan di A4.

Tampilan **tidak** diuji otomatis di versi 1. Aturan pentingnya sudah dijaga di database, dan tes tampilan otomatis mudah rusak setiap kali desain berubah. Bisa ditambahkan setelah tampilan stabil.

### 5.5 Contoh sebelumnya

Belum ada. ApotikKu versi 1 tidak punya tes otomatis. Tes Penjualan menjadi contoh pertama yang diikuti tes lain.

## 6. Di luar cakupan

Sama dengan PRD bagian 9:

- **Milestone 2**: stok masuk dan data supplier, kedaluwarsa per batch, impor obat dari Excel/CSV, catatan siapa mengubah harga dan stok, kelola akun Staf dari aplikasi, foto obat.
- **Tidak dikerjakan**: checkout atau pemesanan online, QRIS sungguhan, penjualan per butir, penyimpanan resep atau data pasien, platform banyak apotek, fitur AI.
- Juga tidak di versi 1: tes tampilan otomatis, mode gelap, satu obat dengan lebih dari satu Keluhan.

## 7. Catatan lanjutan

**Yang masih harus dipastikan sebelum atau saat koding**
- Data HET dan golongan setiap obat di data awal harus dicek ke sumber resmi dan dicantumkan sumbernya (validasi lewat studi pustaka).
- Nomor WhatsApp dan alamat apotek untuk Struk: pakai data contoh yang jelas bertanda contoh, karena ApotikKu bukan apotek sungguhan.
- Paket gratis Supabase dijeda bila ±1 minggu tidak dipakai; buka aplikasi sebelum demo (PRD bagian 11).

**Kalau dosen bertanya…**

**"Kenapa logika Penjualan ditaruh di database, bukan di kode Next.js?"**
Karena di Supabase browser bisa tersambung langsung ke database. Kalau aturannya hanya ada di kode Next.js, orang bisa melewati kode itu dan menulis langsung ke tabel. Fungsi database adalah satu-satunya pintu untuk mencatat Penjualan, jadi aturannya tidak bisa dilewati. Bonusnya, fungsi database berjalan dalam satu transaksi, sehingga stok tidak bisa minus walau dua Kasir menjual bersamaan.

**"Kenapa uangnya disimpan sebagai bilangan bulat?"**
Rupiah tidak punya sen, dan angka desimal di komputer bisa meleset sedikit. Bilangan bulat selalu tepat.

**"Kenapa Kasir tidak bisa melihat Penjualan Kasir lain?"**
Daftar semua Penjualan hari ini sama dengan laporan pendapatan harian, dan laporan pendapatan adalah wewenang Admin. Kasir cukup melihat Penjualannya sendiri untuk mengecek dan mencetak ulang Struk.

**"Kenapa tampilan `katalog` diberi peringatan oleh Supabase, kok dibiarkan?"**
Peringatan itu mengingatkan bahwa tampilan berjalan dengan hak pemiliknya. Itu memang tujuannya: Pengunjung tidak boleh membaca tabel `obat` (karena ada angka stok dan harga acuan), tetapi perlu melihat Status stok. Tampilan ini menghitung statusnya lalu hanya memperlihatkan kolom yang aman. Ada tes yang memastikan kolom rahasia tidak pernah muncul.

**"Kenapa hanya database yang diuji otomatis?"**
Karena semua aturan yang kalau salah merugikan (hak akses, stok, harga, laporan) ada di sana. Tampilan diuji manual dengan target waktu yang terukur. Ini pilihan sadar supaya waktu kelompok dipakai untuk menguji hal yang paling berisiko.

**"Kenapa satu obat hanya satu Keluhan?"**
Data awal kami tidak membutuhkan lebih, dan satu kolom jauh lebih sederhana. Bila nanti dibutuhkan, bisa diubah lewat migrasi baru tanpa merombak aplikasi.

**"Kenapa `status_stok` disimpan di skema `private`, bukan `public`?"**
Karena tampilan `katalog` dibaca Pengunjung, dan PostgreSQL mengecek izin fungsi di dalam tampilan memakai hak Pengunjung. Jadi Pengunjung harus boleh menjalankan `status_stok`. Kalau fungsinya di `public`, Supabase otomatis membukanya sebagai alamat API, dan siapa pun bisa memanggilnya langsung. Di `private`, fungsi itu hanya bisa dipakai dari dalam database. Kesalahan ini justru ditemukan oleh tes otomatis pertama kami.

**"Kalau tes cuma memegang kunci publik, bagaimana data ujinya selalu benar?"**
Data uji dipasang sekali lewat connector Supabase dan tidak bisa diubah Pengunjung (itu juga yang diuji). Dua baris yang tanggalnya harus selalu "kemarin" dan "hari ini" disegarkan oleh jadwal pg_cron setiap menit, hanya di project uji.
