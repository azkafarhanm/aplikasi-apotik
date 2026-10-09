# KENAPA: ringkasan alasan setiap keputusan

> Dokumen ini menjawab satu pertanyaan: **"kenapa begini, bukan begitu?"**
> Setiap baris di bawah adalah ringkasan. Penjelasan lengkap, pilihan yang ditolak, dan jawaban untuk pertanyaan lanjutan ada di ADR yang ditautkan.
> **ADR (Architecture Decision Record)** = catatan satu keputusan penting. *Analogi:* notulen rapat. Setahun kemudian, siapa pun bisa membaca kenapa keputusan itu diambil.

## Prinsip yang dipakai untuk memutuskan

**"Bukan kita yang butuh teknologi, tapi teknologi yang butuh kita."**
Setiap fitur dan teknologi harus menyelesaikan masalah yang tercatat di [`PRD.md`](PRD.md) (M-01 s/d M-07). Kalau tidak bisa ditelusuri ke sebuah masalah, tidak dibuat, sekeren apa pun.

## Keputusan utama

| No | Keputusan | Masalah yang diselesaikan | Pilihan lain yang ditolak (alasan singkat) | Detail |
|---|---|---|---|---|
| 1 | **Next.js + Supabase + Vercel**, semua paket gratis | Data versi 1 hanya di browser, login bisa dilewati, password tidak teracak | PHP+MySQL (login & hak akses harus dibuat sendiri), Firebase (NoSQL, laporan sulit), backend sendiri (terlalu banyak yang dirawat) | [ADR 0001](adr/0001-nextjs-supabase-vercel.md) |
| 1a | Akses database lewat **supabase-js**, bukan Drizzle/Prisma | Aturan hak akses harus tetap berlaku walau kode kita ada bug | Drizzle/Prisma masuk dengan hak penuh dan melewati RLS | [ADR 0001](adr/0001-nextjs-supabase-vercel.md) |
| 1b | Struktur database ditulis sebagai **migrasi SQL** | Database di setiap laptop dan server harus sama bentuknya | Mengubah tabel lewat klik di dasbor (tidak tercatat, tidak bisa diulang) | [ADR 0001](adr/0001-nextjs-supabase-vercel.md) |
| 2 | **Katalog publik + Area staf** untuk satu apotek | Pembeli harus datang dulu untuk tahu harga (M-07); orang belum paham golongan obat (M-06) | Hanya area staf (tidak menjawab M-06/M-07), toko online (aturan obat online, fitur berlebihan), banyak apotek (kompleks tanpa masalah nyata) | [ADR 0002](adr/0002-katalog-publik-dan-area-staf.md) |
| 2a | Katalog hanya menampilkan **Status stok**, bukan angka | Pengunjung cukup tahu datang atau tidak | Angka persis (data internal, cepat basi) | [ADR 0002](adr/0002-katalog-publik-dan-area-staf.md) |
| 3 | **Peran Admin & Kasir** | Kasir tidak boleh mengubah harga atau membatalkan Penjualan sendiri | Satu peran (celah kecurangan), banyak peran (tidak ada kebutuhannya) | [ADR 0003](adr/0003-peran-admin-kasir-rls.md) |
| 3a | Hak akses ditegakkan dengan **RLS sejak migrasi pertama** | Kunci Supabase di browser bersifat publik; menyembunyikan tombol bukan pengamanan | Cek di tampilan saja (bisa dilewati), RLS belakangan (seperti pasang fondasi setelah rumah jadi) | [ADR 0003](adr/0003-peran-admin-kasir-rls.md) |
| 3b | Penjualan lewat **satu fungsi database dalam satu transaksi** | Stok tidak boleh minus; Penjualan harus utuh; harga tidak boleh diubah dari layar kasir | Beberapa perintah terpisah dari browser (bisa setengah tersimpan, bisa minus) | [ADR 0003](adr/0003-peran-admin-kasir-rls.md) |
| 3c | **Tanpa pendaftaran akun umum** | Mencegah orang asing mencoba masuk | Pendaftaran terbuka + persetujuan Admin (mengundang spam) | [ADR 0003](adr/0003-peran-admin-kasir-rls.md) |
| 4 | Visual **"etiket apotek"**, tanpa foto, tanpa mode gelap | Orang belum mengenali logo golongan obat (M-06); tampilan versi 1 generik | Bootstrap/template (tanpa identitas), gaya "template AI", foto produk (hak cipta, berat), mode gelap (biaya uji dua kali tanpa masalah nyata) | [ADR 0004](adr/0004-visual-etiket-apotek.md) |
| 4a | Tata letak Katalog: **kartu etiket + laci Keluhan** (hasil prototipe) | Pengunjung ada yang tahu nama obat, ada yang hanya tahu keluhannya; harga harus ketemu ≤ 2 langkah | Laci keluhan saja (satu langkah lebih banyak), papan daftar harga (terasa seperti tabel) | [ADR 0004](adr/0004-visual-etiket-apotek.md) |

## Keputusan teknis di SPEC

Keputusan yang lebih kecil, dicatat lengkap beserta jawaban untuk dosen di [`SPEC.md`](SPEC.md).

| Keputusan | Alasan singkat | Ditolak | Detail |
|---|---|---|---|
| Uang disimpan sebagai bilangan bulat rupiah | Rupiah tanpa sen; angka desimal komputer bisa meleset | Angka desimal | SPEC 4.3 |
| Status stok dihitung satu fungsi database | Aturan tidak mungkin berbeda di Katalog, kasir, dan Ringkasan | Menghitung di tiap halaman | SPEC 4.3 |
| Pengunjung hanya membaca tampilan `katalog` | Status stok terlihat, angka stok dan harga acuan tidak | Memberi Pengunjung akses ke tabel `obat` | SPEC 4.3 |
| "Hari ini" selalu WIB | Penjualan 23.30 tidak boleh terhitung hari berikutnya | Waktu server (UTC) | SPEC 4.3 |
| Kasir hanya melihat Penjualan miliknya hari ini | Daftar semua Penjualan = laporan pendapatan, wewenang Admin | Kasir melihat semua Penjualan | SPEC 4.5 |
| Detail obat punya alamat sendiri | Tombol Kembali di HP bekerja wajar, tautan bisa dikirim | Jendela di atas daftar saja | SPEC 4.2 |
| Satu obat satu Keluhan (versi 1) | Cukup untuk data awal, jauh lebih sederhana | Tabel banyak-ke-banyak | SPEC 4.3 |
| Satu titik uji otomatis: database | Semua aturan berisiko tinggal di sana; tampilan diuji manual dengan target terukur | Tes tampilan otomatis sejak awal | SPEC 5 |
| Kunci Supabase **tidak** disimpan di pengaturan sesi cloud; migrasi dipasang lewat connector Supabase | Tidak ada kunci/password database yang beredar di luar akun pemilik; sesi cloud tetap bisa memasang migrasi | Menyimpan kunci akses atau password database di pengaturan environment cloud (bocor = database terbuka) | SPEC 4.12 |
| Fungsi bantu (`status_stok`, `hari_ini`) di skema `private` | Tampilan `katalog` butuh fungsi itu dengan hak Pengunjung, tetapi Pengunjung tidak boleh memanggilnya langsung lewat internet | Fungsi di `public` (terbuka sebagai API); menyalin rumus Status stok ke dalam tampilan (aturan tidak lagi di satu tempat) | SPEC 4.3 |
| Data uji tetap + jadwal pg_cron penyegar tanggal, hanya di project uji | Tes hanya memegang kunci publik, jadi tidak bisa membentuk ulang database; baris "kedaluwarsa hari ini" harus selalu benar | Memberi CI password database (kunci induk di luar akun pemilik); tes tanggal yang dilewati | SPEC 5.3 |
| Halaman Katalog: kerangka disiapkan saat build, daftar obat diambil setiap kali dibuka (Next.js *Partial Prerender*) | Judul dan catatan tampil seketika (NF-05), Status stok tetap terbaru | Seluruh halaman disimpan di cache (stok bisa basi); seluruh halaman dibuat ulang (lebih lambat tampil) | SPEC 4.7, [penjelasan](penjelasan/01-katalog.md) |
| Server aplikasi Vercel di **Singapura** (`sin1`), diatur di `vercel.json` | Server bawaan Vercel di Washington membuat setiap pertanyaan ke database (di Singapura) menyeberang AS ↔ Singapura; makin banyak pertanyaan per halaman, makin lambat (NF-05) | Membiarkan bawaan Washington (lambat); mengatur lewat dasbor (tidak tercatat di repo); server cadangan di kota lain (berbayar, dan database tetap hanya di Singapura) | SPEC 4.12, #18 |
| TypeScript + CSS biasa (CSS Modules), tanpa Tailwind/UI kit | TypeScript menangkap salah ketik nama kolom sebelum aplikasi jalan; desain etiket dibuat sendiri (ADR 0004) sehingga UI kit tidak membantu | JavaScript biasa (kesalahan baru ketahuan saat jalan); Tailwind/Bootstrap (alat tambahan yang harus dipelajari, cenderung ke tampilan template) | [penjelasan](penjelasan/01-katalog.md) |

## Jawaban cepat untuk pertanyaan yang paling mungkin muncul

| Pertanyaan | Jawaban singkat |
|---|---|
| Kenapa tidak PHP + MySQL? | Bagian tersulit (login, hash password, hak akses) harus dibuat sendiri, dan di situ versi 1 gagal. Kami tetap menulis SQL karena Supabase adalah PostgreSQL. |
| Kenapa tidak Prisma/Drizzle? | Keduanya melewati RLS. Kami ingin database tetap menolak akses yang salah walaupun kode kami ada bug. |
| Kenapa tidak cek login di halaman saja? | Browser tersambung langsung ke database dengan kunci publik. Pengecekan harus ada di database (RLS). |
| Kenapa tidak bisa pesan online? | Tidak ada masalah di PRD yang menuntutnya, dan penjualan obat online diatur ketat (resep, izin). |
| Kenapa tidak ada fitur AI? | Belum ada masalah yang membutuhkannya. Kandidat masa depan: prediksi kapan stok habis (PRD 9). |
| Kenapa tidak ada mode gelap? | Tidak menyelesaikan masalah apa pun, tetapi menggandakan pengujian tampilan. |
| Kalau Supabase/Vercel tutup? | Struktur database tersimpan sebagai migrasi SQL di repo dan bisa dipasang di PostgreSQL lain; Next.js bisa dijalankan di hosting lain. |
| Paket gratis cukup? | Untuk satu apotek dengan ±40 obat, jauh di bawah batas. Risikonya hanya project dijeda bila ±1 minggu tidak dipakai, jadi dibuka dulu sebelum demo. |

## Kamus istilah teknis

Istilah domain apotek (Penjualan, Obat keras, Status stok, dll.) ada di [`CONTEXT.md`](../CONTEXT.md). Di bawah ini istilah **teknis**.

| Istilah | Arti awam | Analogi |
|---|---|---|
| Framework (Next.js) | Kerangka siap pakai untuk membuat aplikasi web | Rangka rumah prefabrikasi; kita tinggal mengisi ruangannya |
| Database | Tempat data disimpan secara teratur | Lemari arsip dengan laci berlabel |
| Database relasional / SQL | Database berbentuk tabel yang bisa dihubungkan satu sama lain; SQL adalah bahasa untuk bertanya kepadanya | Beberapa buku besar yang saling merujuk lewat nomor |
| Hosting | Komputer di internet yang menjalankan aplikasi kita | Menyewa lapak di pusat perbelanjaan |
| localStorage | Penyimpanan kecil di dalam browser | Buku catatan yang ditinggal di satu meja |
| Login / autentikasi | Membuktikan "saya siapa" | Menunjukkan KTP di pintu |
| Hak akses / otorisasi | Menentukan "saya boleh apa" | Kartu akses yang hanya membuka ruangan tertentu |
| Hash | Password diubah menjadi kode acak yang tidak bisa dibalik | Jeruk bisa jadi jus, jus tidak bisa jadi jeruk |
| RLS (Row Level Security) | Aturan di dalam database tentang siapa boleh membaca/mengubah baris mana | Loker dengan kunci masing-masing |
| Middleware / proxy | Kode yang berjalan sebelum halaman dibuka | Satpam di pintu ruang staf |
| Anon key | Kunci publik untuk tersambung ke Supabase dari browser; aksesnya dibatasi RLS | Kartu tamu: semua orang boleh pegang, tapi hanya membuka lobi |
| Service role key | Kunci rahasia yang melewati semua aturan RLS; tidak dipakai di aplikasi | Kunci induk gedung |
| ORM (Drizzle, Prisma) | Penerjemah agar perintah database bisa ditulis seperti kode JavaScript | Penerjemah yang punya kunci induk |
| Migrasi | File berurutan berisi perubahan struktur database | Resep masakan langkah demi langkah |
| Transaksi database | Sekumpulan langkah yang berhasil semua atau batal semua (beda dengan "Penjualan") | Transfer bank: uang keluar dan masuk harus bersamaan |
| Fungsi database (RPC) | Perintah yang disimpan dan dijalankan di dalam database | Prosedur tetap di gudang yang dijalankan petugas gudang, bukan oleh pembeli |
| Repo (repository) | Folder project yang setiap perubahannya tercatat | Buku harian project |
| Branch | Salinan kerja terpisah untuk mengerjakan satu perubahan | Draf di kertas lain sebelum disalin ke buku utama |
| Pull Request (PR) | Permintaan agar perubahan di branch digabung ke versi utama, sambil diperiksa | Menyerahkan draf ke ketua kelompok untuk dicek sebelum dimasukkan ke laporan |
| Tag | Penanda versi tertentu di repo (misalnya `v1-html`) | Pembatas buku di halaman penting |
| Tampilan (view) | "Jendela" ke tabel yang hanya memperlihatkan kolom tertentu | Etalase toko: harga terlihat, buku stok di gudang tidak |
| Skema | Folder di dalam database untuk mengelompokkan tabel dan fungsi | Ruang depan toko (untuk pembeli) dan ruang belakang (untuk petugas) |
| Connector | Sambungan resmi asisten koding ke layanan lain dengan izin pemilik akun | Surat kuasa bertanda tangan untuk kurir, bukan meminjamkan kunci rumah |
| Publishable key | Nama baru Supabase untuk kunci publik (anon key) | Kartu tamu |
| Variabel lingkungan | Pengaturan yang dibaca aplikasi saat berjalan, disimpan di luar kode | PIN brankas yang dihafal penjaga, bukan ditulis di pintu |
| Secrets GitHub | Tempat menyimpan nilai rahasia/pengaturan untuk GitHub Actions; tidak terlihat di repo | Amplop tertutup yang hanya dibuka petugas QC |
| pg_cron | Penjadwal tugas di dalam PostgreSQL | Alarm yang mengingatkan petugas mengganti kertas tanggal |
| Server Component | Bagian halaman yang disusun di server, lalu dikirim ke HP sebagai HTML jadi | Makanan yang dimasak di dapur, pembeli menerima piring siap santap |
| Prerender / cache | Menyiapkan halaman lebih dulu dan menyimpannya untuk dipakai ulang | Fotokopi brosur: cepat dibagikan, tetapi isinya tidak berubah sampai dicetak ulang |
