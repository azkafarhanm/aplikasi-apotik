# Penjelasan: Data awal 38 obat (tiket #7)

> Dokumen ini menjelaskan data awal tiket #7 untuk orang yang belum pernah membuat aplikasi web. Istilah domain (Obat, Harga acuan, Satuan jual, Golongan obat, Status stok) mengikuti [`CONTEXT.md`](../../CONTEXT.md). Istilah teknis lain ada di kamus [`KENAPA.md`](../KENAPA.md#kamus-istilah-teknis). Daftar lengkap obat beserta sumbernya ada di [`riset/data-awal-obat.md`](../riset/data-awal-obat.md).

## 1. Masalahnya

Sampai tiket #6, Katalog berisi 11 obat **contoh**: harganya angka bulat karangan, dan harga acuannya sengaja dikosongkan. Untuk demo dan pengujian, ApotikKu butuh data yang **bisa dipertanggungjawabkan**:

- **Harga acuan** dari sumber resmi, supaya peringatan "harga jual melebihi HET" (F-13, masalah M-05) punya patokan yang benar.
- **Golongan** dari sumber resmi, karena tanda lingkaran hijau, biru, dan merah-K adalah inti Katalog (masalah M-06). Golongan yang salah berarti mengajari Pengunjung hal yang salah.
- **Stok dan kedaluwarsa yang beragam**, supaya saat demo terlihat obat Tersedia, Hampir habis, Habis, Segera kedaluwarsa, dan Sudah kedaluwarsa.

## 2. Dari mana datanya

```
KMK 092/2012 (Kemenkes) ──▶ harga per kemasan ──÷ isi kemasan──▶ harga acuan per Satuan jual
cekbpom (BPOM)          ──▶ nomor izin edar    ──huruf ke-2──▶   golongan obat
karangan untuk demo     ──▶ stok, tanggal kedaluwarsa (beragam)
```

### Harga: Keputusan Menteri Kesehatan No. 092 Tahun 2012

KMK ini memuat **HET (Harga Eceran Tertinggi)** 498 obat generik: harga paling mahal yang boleh dipasang apotek. *Analogi:* tarif batas atas tiket pesawat. Maskapai boleh menjual lebih murah, tetapi tidak boleh lebih mahal.

Ada dua hal yang perlu diketahui:

1. **Harganya harga tahun 2012.** Kami belum menemukan daftar HET obat generik umum yang lebih baru. Karena itu, Admin tetap bisa mengubah harga jual kapan saja (tiket #9).
2. **HET ditulis per kemasan pabrik**, bukan per strip. Contoh: "Parasetamol 500 mg, kotak 10 × 10 tablet, Rp14.175". ApotikKu menjual per strip, jadi:

```
14.175 ÷ 10 strip = 1.417,5  →  dibulatkan ke bawah  →  Rp1.417 per strip
```

Kenapa ke **bawah**? Kalau dibulatkan ke atas (Rp1.418), harganya sudah melewati HET walaupun hanya 50 sen. *Analogi:* batas kecepatan 60 km/jam. Mobil yang melaju 60,5 tetap melanggar, jadi kita pakai 60.

### Golongan: nomor izin edar BPOM

Setiap obat resmi punya nomor izin edar yang tercetak di kemasan, misalnya **GKL2640102210A1**. Huruf keduanya menunjukkan golongan: **B** = bebas (hijau), **T** = bebas terbatas (biru), **K** = keras (merah, perlu resep). *Analogi:* huruf depan plat nomor kendaraan; dari situ kita tahu asal daerahnya tanpa bertanya.

Untuk setiap obat, kami mencari semua nomor generik yang masih berlaku di cekbpom.pom.go.id, lalu menghitung hurufnya. Contoh: Ambroksol 30 mg punya 25 nomor, semuanya K, jadi Ambroksol adalah **obat keras**. Banyak orang mengira obat batuk ini obat bebas; temuan seperti inilah alasan golongan dicek ke sumber, bukan ditebak.

Bila nomornya berbeda-beda (Setirizin 10 mg: 40 nomor T dan 8 nomor K), kami memakai yang terbanyak dan mencatat jumlahnya.

## 3. Yang sengaja dibuang

| Obat | Kenapa |
|---|---|
| Dekstrometorfan (obat batuk kering) | Izin edar sediaan tunggalnya dibatalkan BPOM pada 2013 karena disalahgunakan. Obat ini ada di data contoh lama |
| Vitamin C, B kompleks | Sekarang terdaftar sebagai **suplemen kesehatan**, bukan obat, jadi tidak punya golongan obat. Memberinya lingkaran hijau sama dengan mengajari Pengunjung hal yang salah |
| CTM | Jumlah nomor bebas terbatas dan keras hampir seimbang (9 dan 8), sehingga golongannya tidak bisa dipastikan |
| Obat dalam botol 250–1000 butir | Harus dikemas ulang per 10 butir, dan itu butuh Satuan jual baru ("klip") yang tidak ada di skema |

Hasilnya **38 obat**, bukan tepat 40. Tiket meminta "±40"; lebih jujur 38 obat bersumber daripada 40 obat yang dua di antaranya ditebak.

## 4. Tanggal kedaluwarsa yang "ikut berjalan"

Tanggal kedaluwarsa tidak ditulis sebagai tanggal tetap seperti `2026-11-30`, tetapi **relatif terhadap hari pemasangan**:

```sql
private.hari_ini() + 45    -- 45 hari setelah data dipasang
private.hari_ini() - 10    -- sudah kedaluwarsa 10 hari lalu
```

Kalau ditulis tetap, obat yang hari ini "Segera kedaluwarsa" tiga bulan lagi sudah menjadi "Sudah kedaluwarsa", dan demo kehilangan contoh. Dengan tanggal relatif, cukup **pasang ulang data sebelum demo**, dan semua keadaan muncul lagi. *Analogi:* kalender sobek yang diganti setiap pagi, bukan kalender yang dicetak sekali untuk selamanya.

`private.hari_ini()` adalah fungsi yang sudah ada sejak tiket #2: tanggal hari ini menurut WIB, bukan menurut jam server (UTC).

| Keadaan saat dipasang | Jumlah |
|---|--:|
| Tersedia | 27 |
| Hampir habis (stok 1–20) | 6 |
| Habis karena stok 0 | 3 |
| Sudah kedaluwarsa (tampil Habis) | 2 |
| Segera kedaluwarsa (≤ 90 hari; tetap Tersedia/Hampir habis) | 4 |

## 5. File dan cara kerjanya

| File | Isinya | Analogi |
|---|---|---|
| `supabase/data/data-awal.sql` | 38 obat, masing-masing dengan komentar sumber (nomor baris KMK, perhitungan harga, contoh nomor izin edar) | Daftar belanja yang setiap barisnya disertai bon |
| `docs/riset/data-awal-obat.md` | Tabel riset lengkap dan cara mengecek ulang | Map berisi fotokopi bon |
| `supabase/data/contoh.sql` | **Dihapus**, digantikan file di atas | Barang pajangan sementara, sudah diganti barang asli |

`data-awal.sql` bekerja dalam tiga langkah:

1. **Penjaga riwayat.** Bila sudah ada Penjualan (tabelnya baru dibuat di tiket #8), file berhenti dengan pesan "Data awal tidak dipasang: sudah ada Penjualan…". Obat yang pernah terjual tidak boleh dihapus (aturan bisnis 7). *Analogi:* petugas gudang yang menolak mengosongkan rak kalau ada barang yang tercatat di nota penjualan.
2. **Mengosongkan tabel obat.**
3. **Mengisi 38 obat.** Slug (nama untuk alamat web) dibuat otomatis oleh database, sama seperti obat yang ditambahkan Admin.

File ini **bukan migrasi**. Migrasi mengubah *bentuk* database dan dijalankan sekali; data awal adalah *isi* dan boleh dipasang ulang (SPEC 4.11). *Analogi:* migrasi itu membangun rak; data awal itu menata barang di rak.

## 6. Bagaimana kami mengujinya

- **Di project uji, tanpa merusak data uji.** Isi file dijalankan di dalam **transaksi** yang di ujungnya sengaja dibatalkan. Sebelum dibatalkan, database menghitung hasilnya: 38 obat, 4–10 per Keluhan, golongan 11/9/18, Status stok 27 Tersedia, 6 Hampir habis, 5 Habis, 2 Sudah kedaluwarsa, 4 Segera kedaluwarsa, dan semua harga jual sama dengan harga acuan. Setelah dibatalkan, data uji tetap 7 baris seperti semula.
  > **Transaksi** = sekumpulan langkah yang berhasil semua atau batal semua. *Analogi:* menulis dengan pensil lalu menghapusnya; kita sudah melihat hasilnya, tetapi kertasnya kembali bersih.
- **Tes otomatis yang sudah ada tetap lulus**, karena data uji tidak disentuh.
- Aturan isi yang salah (Bentuk di luar daftar, harga 0, stok minus) **ditolak database sendiri** lewat aturan di migrasi tiket #2, jadi kesalahan ketik di file ini langsung gagal saat dipasang.

## 7. Memasang atau memasang ulang dari HP

1. Buka **supabase.com/dashboard** → project **apotikku** → **SQL Editor** → **New query**.
2. Buka file [`supabase/data/data-awal.sql`](../../supabase/data/data-awal.sql) di GitHub → tombol **Raw** → salin semua isinya.
3. Tempel di SQL Editor → **Run**. Supabase akan bertanya karena ada perintah hapus; pilih **Run this query**.
4. Buka https://apotikku.vercel.app; Katalog langsung berisi 38 obat.

Lakukan ini sebelum demo supaya tanggal kedaluwarsa kembali beragam. Mulai tiket #8, langkah ini akan ditolak bila sudah ada Penjualan.

## Kalau dosen bertanya…

**"HET-nya dari 2012, bukankah sudah kedaluwarsa?"**
Itu daftar HET obat generik umum terakhir yang kami temukan di situs resmi Kemenkes. Aturan yang lebih baru hanya khusus obat COVID-19 atau mengatur cara menulis HET di label. Risikonya sudah dicatat di PRD bagian 11, dan Admin bisa mengubah harga jual.

**"Kenapa tidak dibulatkan ke ratusan saja supaya kasir mudah memberi kembalian?"**
Harga acuan harus sama dengan sumber, karena dipakai untuk mendeteksi harga yang melewati HET. Membulatkan *harga jual* adalah keputusan Admin, dan bisa dilakukan nanti lewat halaman Obat. Kalau dibulatkan ke atas, kami justru melanggar HET.

**"Kenapa golongan tidak diambil dari satu daftar resmi saja?"**
Kami tidak menemukan daftar golongan per zat aktif yang lengkap dan terbaru. Nomor izin edar adalah data resmi BPOM yang tercetak di setiap kemasan dan bisa dicek siapa pun di cekbpom. Bila pabrik yang berbeda mendapat golongan berbeda, kami memakai yang terbanyak dan mencatat angkanya.

**"Kenapa vitamin C tidak ada? Bukankah apotek menjualnya?"**
Apotek memang menjualnya, tetapi BPOM sekarang mendaftarkannya sebagai suplemen kesehatan, bukan obat, jadi tidak punya golongan obat. Katalog kami mengajarkan arti tanda golongan (M-06), jadi kami tidak mau menempelkan lingkaran hijau pada sesuatu yang bukan obat bebas. Kalau nanti dibutuhkan, bisa ditambah jenis "suplemen" lewat migrasi baru.

**"Stoknya dari mana?"**
Dikarang, dan itu dinyatakan terang-terangan. Stok dan tanggal kedaluwarsa disusun supaya setiap Status stok muncul saat demo. Hanya harga acuan dan golongan yang wajib bersumber.

**"Kenapa tanggal kedaluwarsanya tidak ditulis biasa?"**
Supaya data tetap berguna untuk demo kapan pun. Tanggal relatif terhadap hari pemasangan membuat obat "Segera kedaluwarsa" tetap 45 hari lagi, berapa kali pun data dipasang ulang.
