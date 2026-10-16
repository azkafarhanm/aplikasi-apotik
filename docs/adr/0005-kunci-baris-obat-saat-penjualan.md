# ADR 0005: Stok dijaga dengan mengunci baris obat di dalam fungsi database

| | |
|---|---|
| Status | Diterima |
| Tanggal | 16 Oktober 2026 |
| Terkait | M-01, NF-06, F-06, F-12; tiket #8; [ADR 0003](0003-peran-admin-kasir-rls.md) keputusan 5 |

## Konteks

ADR 0003 sudah memutuskan bahwa Penjualan dicatat lewat **satu fungsi database dalam satu transaksi**. Satu pertanyaan masih terbuka: **bagaimana stok tetap benar bila dua Kasir menjual obat yang sama pada saat yang sama?**

Contoh nyata: stok Amoksisilin tinggal 1 strip. Kasir 1 dan Kasir 2 sama-sama menekan Simpan pada detik yang sama.

Tanpa penjagaan, keduanya bisa sama-sama membaca "stok 1", sama-sama lolos pengecekan, lalu sama-sama mengurangi stok. Akibatnya dua strip "terjual" padahal hanya ada satu, dan stok tercatat −1. Masalah ini disebut **race condition** (kondisi balapan). *Analogi:* dua orang memesan kursi bioskop terakhir lewat dua loket berbeda, dan keduanya diberi tiket kursi yang sama.

M-01 di PRD menuntut "stok tidak pernah minus, termasuk saat dua kasir menjual bersamaan", dan NF-06 meminta hal ini diuji otomatis.

## Keputusan

Fungsi `catat_penjualan` **mengunci baris obat yang ada di keranjang sebelum membaca stoknya**, dengan perintah PostgreSQL `SELECT … FOR UPDATE`. Baris dikunci **berurutan menurut id obat**.

> **Mengunci baris (row lock)** = menandai satu baris tabel sebagai "sedang dipakai" sampai transaksi selesai. Transaksi lain yang ingin mengubah baris itu harus menunggu. *Analogi:* kamar pas di toko baju. Selama ada orang di dalam, pintunya terkunci; orang berikutnya menunggu di depan, lalu masuk setelah kamar kosong.

Langkah fungsi, berurutan:

1. Cek pemanggil (Staf aktif) dan bentuk keranjang.
2. **Kunci** baris semua obat di keranjang, urut id.
3. Baca stok, harga, dan kedaluwarsa. Karena baris sudah terkunci, angkanya pasti terbaru.
4. Cek semua aturan. Bila ada yang dilanggar, hentikan dengan pesan, dan seluruh transaksi dibatalkan.
5. Simpan Penjualan dan Item penjualan, lalu kurangi stok.
6. Transaksi selesai, dan kunci otomatis dilepas.

Pada contoh di atas: Kasir 1 mengunci Amoksisilin lebih dulu. Kasir 2 **menunggu** sepersekian detik. Setelah Kasir 1 selesai (stok jadi 0), Kasir 2 membaca stok 0 dan ditolak dengan pesan "Stok Amoksisilin 500 mg habis." Stok akhir 0, tidak pernah −1.

**Kenapa urut id?** Bila Kasir 1 membeli Obat A lalu B, sedangkan Kasir 2 membeli B lalu A, keduanya bisa saling menunggu selamanya: Kasir 1 memegang A dan menunggu B, Kasir 2 memegang B dan menunggu A. Ini disebut **kebuntuan (deadlock)**. Dengan selalu mengunci dari id terkecil, semua Kasir antre dengan urutan yang sama, jadi kebuntuan tidak bisa terjadi.

> **Kebuntuan (deadlock)** = dua pihak saling menunggu yang lain melepas sesuatu, sehingga tidak ada yang bisa maju. *Analogi:* dua mobil berhadapan di jalan sempit, masing-masing menunggu yang lain mundur.

## Pilihan yang ditolak

| Pilihan | Kenapa ditolak |
|---|---|
| **Cek stok di layar Kasir saja** | Layar bisa dilewati (ADR 0003). Selain itu, dua layar yang dibuka bersamaan sama-sama melihat "stok 1", karena keduanya memuat data sebelum ada yang menjual. |
| **"Kurangi stok bila cukup" tanpa kunci** (`UPDATE obat SET stok = stok − n WHERE stok >= n`) | Aman untuk stok, karena database menjalankan satu UPDATE per baris secara bergantian. Tetapi pengecekan lain (kedaluwarsa, Cek resep, uang kurang) dan pesan "Stok Ambroksol tinggal 3 strip" membutuhkan stok yang dibaca **sebelum** mengubah. Akibatnya urutan langkah jadi rumit, pesan bisa tidak akurat, dan keranjang berisi banyak obat harus dicek satu per satu setelah sebagian sudah dikurangi. |
| **Mode transaksi paling ketat (`SERIALIZABLE`)** | Database menolak salah satu transaksi yang bertabrakan dengan kesalahan teknis "could not serialize", lalu **aplikasi harus mencoba ulang sendiri**. Ini menambah kode di layar Jual, dan Kasir bisa melihat kegagalan yang bukan salahnya. Kunci baris membuat Kasir kedua cukup menunggu, tanpa mencoba ulang. |
| **Kolom versi (optimistic locking)** | Cocok bila tabrakan sangat jarang dan pengguna bisa diminta mengulang. Di kasir, mengulang berarti pembeli menunggu. Kunci baris lebih sederhana dan hasilnya pasti. |

## Konsekuensi

**Yang didapat**
- Stok tidak pernah minus, termasuk saat dua Kasir menjual obat terakhir bersamaan (M-01). Diuji otomatis di `tests/penjualan.test.ts` ("Dua Kasir bersamaan", diulang 3 ronde).
- Pesan penolakan selalu memakai angka stok terbaru ("tinggal 3 strip").
- Tidak ada kode coba-ulang di layar Jual.

**Yang harus diterima**
- Kasir kedua menunggu sampai Penjualan Kasir pertama selesai. Satu Penjualan hanya berisi beberapa obat dan selesai dalam hitungan milidetik, jadi tunggu ini tidak terasa. Obat yang berbeda tidak saling menunggu.
- Fungsi lain yang kelak mengubah stok (Pembatalan #13, Kelola obat #9) juga harus mengunci baris obat **urut id**, supaya aturan antre ini tetap berlaku.

## Kalau dosen bertanya…

**"Bagaimana kalau dua kasir menjual obat terakhir di detik yang sama?"**
Fungsi database mengunci baris obat itu sebelum membaca stok. Kasir kedua menunggu sepersekian detik sampai Kasir pertama selesai, lalu membaca stok 0 dan ditolak dengan pesan "Stok … habis". Ada tes otomatis yang menjalankan dua penjualan serentak tiga kali, dan setiap kali tepat satu yang berhasil, dengan stok akhir 0.

**"Kenapa tidak cek stok dulu di layar, baru simpan?"**
Karena di antara "cek" dan "simpan" ada jeda. Dalam jeda itu Kasir lain bisa menjual obat yang sama. Pengecekan dan pengurangan harus terjadi di satu tempat dan satu waktu, sambil baris obatnya dikunci. Tempat itu adalah fungsi database.

**"Kalau dikunci, apakah kasir lain jadi lambat?"**
Hanya Kasir yang menjual **obat yang sama pada saat yang sama**, dan ia hanya menunggu sampai Penjualan pertama selesai (hitungan milidetik). Obat lain tidak ikut terkunci.

**"Apa itu deadlock, dan bagaimana kalian mencegahnya?"**
Deadlock terjadi bila dua transaksi saling menunggu baris yang dipegang lawannya. Kami mencegahnya dengan selalu mengunci obat menurut urutan id, jadi tidak mungkin ada dua Kasir yang memegang kunci dengan urutan terbalik.

**"Kenapa tidak pakai SERIALIZABLE saja, kan paling aman?"**
SERIALIZABLE memang aman, tetapi caranya menolak transaksi yang bertabrakan dan menyuruh aplikasi mencoba ulang. Untuk kasir, itu berarti layar harus punya logika coba-ulang dan pembeli bisa menunggu lebih lama. Kunci baris memberi hasil yang sama untuk kasus kami dengan kode yang lebih sederhana.
