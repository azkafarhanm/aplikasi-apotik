# Panduan: cara kerja project ApotikKu

> Dokumen ini menjawab pertanyaan sehari-hari: **"ini dikerjakan bagaimana, dan cara mengeceknya seperti apa?"**
> Ditulis untuk anggota kelompok yang belum pernah membuat aplikasi web. Istilah domain (Penjualan, Obat keras, Status stok) ada di [`CONTEXT.md`](../CONTEXT.md); istilah teknis ada di kamus [`KENAPA.md`](KENAPA.md#kamus-istilah-teknis).

## 1. Dokumen mana untuk pertanyaan apa

| Pertanyaan | Buka |
|---|---|
| Aplikasi ini untuk siapa dan fiturnya apa saja? | [`docs/PRD.md`](PRD.md) |
| Dibangunnya bagaimana? (tabel, halaman, aturan hak akses, rencana uji) | [`docs/SPEC.md`](SPEC.md) |
| Kenapa pilih ini, bukan itu? | [`docs/KENAPA.md`](KENAPA.md), detailnya di [`docs/adr/`](adr/) |
| Kode fitur X bekerjanya bagaimana? | [`docs/penjelasan/`](penjelasan/) |
| Istilah "Penjualan" / "Keluhan" artinya apa? | [`CONTEXT.md`](../CONTEXT.md) |
| Angka atau klaim ini dari mana? | [`docs/riset/`](riset/) |
| Bahan tugas tiap sesi kuliah | [`docs/sesi/`](sesi/) |
| **Project sudah sampai mana?** | [Issue #1](https://github.com/azkafarhanm/aplikasi-apotik/issues/1) dan Matriks Keterunutan SKPL bagian 4.4 |
| Cara mengerjakan dan mengecek perubahan | **dokumen ini** |

## 2. Alur satu tiket, dari awal sampai selesai

Aturan dasarnya: **satu tiket = satu branch = satu Pull Request = satu sesi kerja.**

> **Branch** = salinan kerja terpisah, supaya versi utama tidak terganggu selagi fitur dikerjakan. *Analogi:* menulis draf di kertas lain sebelum disalin ke buku utama.
> **Pull Request (PR)** = permintaan agar isi branch digabung ke versi utama, sambil diperiksa dulu. *Analogi:* menyerahkan draf ke ketua kelompok untuk dicek sebelum masuk laporan.

Urutannya:

| # | Langkah | Siapa | Keterangan |
|---|---|---|---|
| 1 | **Setujui tiket berikutnya** | Pemilik repo | Lihat urutan di issue #1 |
| 2 | **Buka sesi kerja baru** | Claude | Satu sesi untuk satu tiket, supaya riwayatnya tidak tercampur |
| 3 | **Ronde pertanyaan** | Claude → pemilik repo | Hal yang belum ditetapkan SPEC ditanyakan dulu, bernomor, dengan rekomendasi dan alasannya |
| 4 | **Buat branch** `fitur/<nomor>-<nama>` | Claude | Dari `main` yang sudah berisi tiket sebelumnya |
| 5 | **Migrasi ke database uji** (bila ada perubahan database) | Claude | Dipasang ke `apotikku-uji` dulu, **tidak pernah langsung ke yang asli** |
| 6 | **Tulis kode + tes** | Claude | Aturan penting selalu diuji otomatis |
| 7 | **Periksa sendiri** | Claude | `tsc`, `eslint`, `next build`, dan lihat tampilannya di browser |
| 8 | **Commit + buka PR** | Claude | Body PR memuat ringkasan, bukti, dan risiko |
| 9 | **Tunggu CI hijau** | GitHub Actions | Seluruh tes database dijalankan ulang |
| 10 | **Migrasi ke database asli** | Claude | Baru setelah CI hijau, isi filenya sama persis |
| 11 | **Coba di Preview** | Pemilik repo | Tautan ada di komentar `vercel[bot]` di PR |
| 12 | **Merge PR** | Pemilik repo | Claude tidak pernah merge sendiri |
| 13 | **Setujui tiket berikutnya** | Pemilik repo | Kembali ke langkah 1 |

Catatan penting di langkah 10: nama file migrasi di repo diganti agar cocok dengan nomor versi yang tercatat di database asli, lalu di-push. Itu sebabnya sering ada commit kecil "nama file migrasi sesuai versi di project apotikku".

### Kenapa satu tiket satu sesi?

Sesi yang dipakai untuk banyak tiket sekaligus menumpuk konteks: makin lama makin berat, dan riwayat tiap tiket jadi tercampur sehingga sulit ditelusuri. Dengan satu sesi per tiket, tiap tiket punya catatan sendiri dari awal sampai PR-nya dibuat.

### Kenapa PR tidak ditumpuk

Pernah dicoba menumpuk PR (#5 ditumpuk di atas #4 supaya bisa dikerjakan sambil menunggu). Akibatnya PR yang di atas ter-merge ke branch di bawahnya, bukan ke `main`, dan urutan merge jadi membingungkan. Sejak itu: **tunggu PR sebelumnya di-merge, baru mulai tiket berikutnya dari `main` yang bersih.**

## 3. Cara mengecek setiap jenis perubahan

Ini bagian yang paling sering dibutuhkan. Cari jenis perubahannya, lalu ikuti cara mengeceknya.

| Yang berubah | Cara mengeceknya | Di mana |
|---|---|---|
| **Tampilan halaman** (tata letak, tombol, warna) | Buka Preview Vercel dari HP dan laptop | Tautan di komentar `vercel[bot]` pada PR |
| **Aturan database** (hak akses, perhitungan, penolakan) | Lihat hasil tes otomatis | Tab Checks di PR, pekerjaan bernama `tes` |
| **Perubahan database** (migrasi) | Pastikan sudah terpasang di **kedua** project Supabase | Lihat bagian 5 |
| **Dokumen** | Baca langsung di GitHub, tampilan Markdown-nya sudah rapi | Tab Files changed di PR |
| **Isi PR secara keseluruhan** | Baca bagian **Evidence** di body PR: di situ ada bukti yang benar-benar dijalankan, bukan klaim | Body PR |

### Yang harus dilihat di body PR

Setiap PR ditulis dengan tiga bagian tetap:

- **Summary** — apa yang berubah, digambarkan dengan diagram atau potongan kode supaya terbayang.
- **Evidence** — bukti nyata: keadaan sebelum dan sesudah, angka yang benar-benar keluar dari layar atau dari database, dan hasil pemeriksaan (`tsc`, `eslint`, `build`, tes).
- **Merge Danger** — risikonya: apakah mudah dibatalkan (*two-way door*) atau sulit (*one-way door*), dan bagian mana yang ikut terpengaruh.

Kalau ragu dengan sebuah PR, baca **Evidence** lebih dulu. Di situ tertulis apa yang sudah benar-benar dicoba.

## 4. Mencoba aplikasinya sendiri

Alur ini juga dipakai saat demo. Urutannya sengaja mengikuti perjalanan orang sungguhan.

### Sebagai Pengunjung (tanpa login)

1. Buka halaman Katalog.
2. Ketik sebagian nama obat, misalnya `para`. Daftar menyusut seketika.
3. Ketuk satu laci Keluhan, misalnya **Batuk & Flu**. Angka di tiap laci ikut menyesuaikan.
4. Centang **Tanpa resep saja**. Obat keras hilang, angka di laci turun.
5. Ketuk laci yang sama sekali lagi untuk membatalkannya.
6. Ketuk satu kartu obat → halaman Detail obat terbuka, lengkap dengan arti golongan dan arti Satuan jual.
7. Tekan tombol Kembali di HP → balik ke Katalog.
8. Cari kata yang tidak ada, misalnya `zzz` → muncul "Obat tidak ditemukan" beserta tombol WhatsApp.

### Sebagai Kasir

1. Ketuk **Masuk Staf** di pojok kanan atas, masuk dengan akun Kasir.
2. Di layar **Jual**: cari obat, tambahkan ke keranjang, pilih cara bayar, lalu Simpan.
3. Halaman **Struk** terbuka otomatis. Coba pratinjau cetaknya (Ctrl+P) untuk melihat hasil 58 mm.
4. Buka **Penjualan hari ini** → Penjualan tadi ada di daftar.
5. Perhatikan: menu Ringkasan, Obat, dan Laporan **tidak muncul** untuk Kasir.

### Sebagai Admin

1. Keluar, lalu masuk dengan akun Admin.
2. Mendarat di **Ringkasan**: pendapatan hari ini, jumlah Penjualan, dan tiga daftar tindak lanjut.
3. Buka **Penjualan hari ini** → ada tombol **Batalkan** di tiap baris.
4. Batalkan satu Penjualan dengan menuliskan alasannya. Stok obatnya kembali, barisnya jadi abu-abu, dan totalnya tidak lagi dihitung.
5. Buka Struk Penjualan itu → ada tanda besar **DIBATALKAN** beserta kapan, oleh siapa, dan alasannya.

> ⚠️ **Preview dan production memakai database yang SAMA (database asli).** Penjualan yang dicatat saat mencoba benar-benar tersimpan, dan Pembatalan tidak bisa diurungkan. Saat mencoba Pembatalan, **catat dulu Penjualan percobaan**, lalu batalkan yang itu — jangan membatalkan Penjualan lama.

## 5. Dua database, jangan sampai tertukar

| Project Supabase | Dipakai untuk | Boleh dirusak? |
|---|---|---|
| `apotikku` | Aplikasi sungguhan: production **dan** Preview | ❌ Tidak |
| `apotikku-uji` | Tes otomatis saja | ✅ Ya, memang untuk itu |

Migrasi **selalu** dipasang ke `apotikku-uji` lebih dulu, diperiksa, lalu baru ke `apotikku` setelah CI hijau.

> **Migrasi** = file berurutan berisi perubahan bentuk database. *Analogi:* resep langkah demi langkah; siapa pun yang mengikutinya mendapat database yang sama.

Cara memastikan sebuah migrasi sudah terpasang: buka halaman yang memakainya di Preview. Kalau muncul pesan gangguan seperti "Ringkasan sedang tidak bisa dimuat", biasanya migrasinya belum terpasang di `apotikku`.

## 6. Perintah yang sering dipakai

```bash
npm install          # sekali saja, memasang pustaka
npm run dev          # jalankan di laptop, buka http://localhost:3000
npm test             # tes database (lihat catatan di bawah)
npx tsc --noEmit     # periksa salah ketik tipe data
npx eslint app lib components tests
npm run build        # pastikan aplikasinya bisa dibangun
```

Tiga hal yang sering bikin bingung:

- **`npm test` di laptop hanya menjalankan sebagian tes.** Tes yang perlu login (Penjualan, Pembatalan, Ringkasan) butuh password akun uji yang hanya disimpan di *secrets* GitHub, bukan di repo. Jadi tes lengkap hanya berjalan di CI saat ada PR. Yang jalan di laptop tanpa password: `katalog.test.ts`.
- **Kalau `tsc` mengeluh `Cannot find name PageProps`**, jalankan `npx next typegen` lalu ulangi.
- **Next.js kadang menghentikan perintah pertama** dengan peringatan keamanan versi. Jalankan perintah yang sama sekali lagi, dan ia melanjutkan.

## 7. Kalau ada yang salah

| Gejala | Kemungkinan sebabnya | Yang dilakukan |
|---|---|---|
| CI merah di PR | Tes gagal | Buka Checks → `tes` → baca baris `FAIL`. Nama tes dan angka yang diharapkan tertulis jelas |
| Halaman Staf menampilkan pesan gangguan | Migrasi belum terpasang di `apotikku` | Pasang migrasinya, lalu muat ulang |
| Angka stok di tes tidak cocok | Dua file tes memakai obat yang sama | Setiap file tes yang mengubah stok **harus punya obat uji sendiri** (pelajaran dari #38 dan #11) |
| Tombol WhatsApp menulis "(nomor contoh)" | `NEXT_PUBLIC_WHATSAPP_APOTEK` belum diisi di Vercel | Isi di pengaturan Vercel, atau biarkan — ApotikKu memang apotek contoh |
| Preview lama tidak berubah | Deployment masih dibangun | Tunggu status `Ready` di komentar `vercel[bot]` |

## 8. Aturan yang tidak boleh dilanggar

Dirangkum dari [`CLAUDE.md`](../CLAUDE.md) supaya mudah diingat:

1. **Jangan simpan nama lengkap atau NIM di repo.** Repo ini publik. PDF tugas yang memuat identitas dibuat di luar repo.
2. **Jangan tulis password di repo atau di chat.** Password akun uji hanya di *secrets* GitHub dan `.env.local`.
3. **Data tidak pernah dihapus.** Obat diarsipkan, Penjualan dibatalkan.
4. **Setiap keputusan harus punya alasan tertulis**, termasuk pilihan yang ditolak, supaya siap ditanya dosen.
5. **Claude tidak pernah merge PR sendiri.** Itu keputusan pemilik repo.
