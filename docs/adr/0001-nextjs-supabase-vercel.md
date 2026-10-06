# ADR 0001: Next.js + Supabase + Vercel

> **ADR (Architecture Decision Record)** = catatan satu keputusan penting: masalahnya apa, kita pilih apa, pilihan lain apa saja yang ditolak, dan akibatnya.
> *Analogi:* notulen rapat keluarga saat memutuskan beli motor merek apa. Setahun kemudian, kalau ada yang bertanya "kok dulu pilih ini?", jawabannya tinggal dibaca.

| | |
|---|---|
| Status | Diterima |
| Tanggal | 6 Oktober 2026 |
| Terkait | NF-01, NF-02, NF-06, NF-07 di [`PRD.md`](../PRD.md) |

## Konteks

ApotikKu versi 1 dibuat dengan HTML + Bootstrap, dan datanya disimpan di **localStorage**.

> **localStorage** = laci kecil di dalam browser. *Analogi:* buku catatan yang ditinggal di satu meja. Orang di meja lain tidak bisa membacanya, dan kalau mejanya dibersihkan (riwayat browser dihapus), catatannya ikut hilang.

Akibatnya (lihat PRD 3.2): data hilang bila riwayat dihapus, tidak bisa dibuka dari HP lain, password tersimpan apa adanya, dan pengecekan login bisa dilewati. Versi baru harus:

1. Menyimpan data di satu tempat online yang sama untuk semua perangkat (NF-02).
2. Punya login yang aman dan aturan hak akses yang tidak bisa diakali (NF-01).
3. Menjamin stok tidak minus walau dua kasir menjual bersamaan (NF-06).
4. Gratis (NF-07), karena ini project kuliah.
5. Bisa dikerjakan kelompok mahasiswa yang sedang belajar.

## Keputusan

| Bagian | Pilihan | Peran | Analogi |
|---|---|---|---|
| Kerangka aplikasi | **Next.js** | Membuat tampilan Katalog dan Area staf, sekaligus menjalankan kode di server | Bangunan toko: etalase depan dan ruang kasir di belakang, satu gedung |
| Database + login | **Supabase** (PostgreSQL) | Menyimpan data obat dan Penjualan, mengurus login, menegakkan hak akses | Gudang berpenjaga: barang tersimpan rapi, dan penjaga mengecek kartu identitas setiap orang yang masuk |
| Hosting | **Vercel** | Menaruh aplikasi di internet supaya bisa dibuka lewat alamat web | Menyewa lapak di pusat perbelanjaan, gratis selama tidak untuk dagang komersial |

Aturan tambahan yang ikut diputuskan:

- **Akses database lewat `supabase-js`**, bukan lewat ORM seperti Drizzle atau Prisma (alasan di bawah).
- **Perubahan struktur database ditulis sebagai file migrasi SQL** yang disimpan di repo.
  > **Migrasi** = file berisi langkah-langkah mengubah struktur database (menambah tabel, kolom, aturan). *Analogi:* resep masakan yang ditulis berurutan. Siapa pun yang mengikuti resep yang sama akan mendapat masakan yang sama, jadi database di laptop setiap anggota kelompok dan di server selalu sama bentuknya.
- **Proxy/middleware Next.js menjaga semua halaman `/staf/*`**: orang yang belum login langsung diarahkan ke halaman login.
  > **Middleware/proxy** = kode yang berjalan *sebelum* halaman dibuka. *Analogi:* satpam di pintu masuk ruang staf. (Di Next.js versi 16 namanya diganti dari `middleware` menjadi `proxy`; fungsinya sama.)
  Satpam ini hanya lapisan pertama. Penjaga sebenarnya ada di database (RLS, lihat [ADR 0003](0003-peran-admin-kasir-rls.md)).

## Pilihan yang ditolak

| Pilihan | Kenapa ditolak |
|---|---|
| **Tetap HTML + localStorage** (versi 1) | Inilah sumber masalahnya: data tidak bisa dipakai bersama, hilang bila browser dibersihkan, dan semua pengecekan bisa dilewati lewat DevTools browser. |
| **PHP + MySQL** (paling umum di tugas kampus) | Bisa dipakai, tetapi login, hash password, dan hak akses harus dibuat sendiri dari nol, padahal itu bagian yang paling mudah salah dan paling berbahaya bila salah. Hosting PHP gratis juga umumnya lambat dan penuh iklan. |
| **Laravel** | Kerangka PHP yang bagus, tetapi tetap butuh server dan database yang dirawat sendiri. Pengembang juga belum mengenalnya, sedangkan Next.js dan Vercel sudah dikenal. |
| **Firebase** | Login dan hostingnya mudah, tetapi databasenya NoSQL (data disimpan seperti tumpukan dokumen, bukan tabel). Laporan pendapatan butuh menggabungkan tabel Penjualan, Item penjualan, dan Obat; di database tabel (relasional) itu cukup satu perintah SQL, di NoSQL harus diakali. SQL juga diajarkan di kampus, jadi lebih mudah dipertanggungjawabkan. |
| **Backend sendiri (Express/Node.js) + database terpisah** | Lebih banyak bagian yang harus dibuat, dirawat, dan diamankan sendiri. Supabase sudah menyediakan semua itu dalam satu paket. |
| **Drizzle atau Prisma (ORM)** | ORM = penerjemah yang membuat kita bisa menulis perintah database dengan gaya JavaScript. Masalahnya, Drizzle dan Prisma tersambung ke database sebagai "pemilik gedung", sehingga **melewati aturan RLS**. Artinya satu bug kecil di kode server bisa membuat Kasir melihat laporan, atau lebih buruk. `supabase-js` selalu masuk sebagai Staf yang sedang login, jadi RLS tetap berlaku. |
| **Netlify / Cloudflare Pages** (pengganti Vercel) | Keduanya juga gratis dan bisa. Vercel dipilih karena dibuat oleh pembuat Next.js (paling sedikit kejutan) dan sudah dikenal pengembang. Bila suatu saat dikomersialkan, Cloudflare menjadi pilihan pindah (lihat PRD 11). |

## Konsekuensi

**Yang didapat**
- Data di satu database online; laptop dan HP melihat data yang sama (NF-02).
- Password disimpan teracak (hash) oleh Supabase, bukan oleh kode kita (NF-01).
  > **Hash** = mengubah password menjadi kode acak yang tidak bisa dibalik. *Analogi:* jus jeruk. Dari jeruk bisa jadi jus, tetapi dari jus tidak bisa kembali jadi jeruk. Saat login, password yang diketik dijadikan "jus" lagi lalu dibandingkan.
- PostgreSQL mendukung **transaksi database**, sehingga Penjualan tersimpan utuh atau tidak sama sekali (NF-06).
- Biaya Rp0 (NF-07).

**Yang harus diterima**
- Paket gratis Supabase **dijeda bila tidak dipakai ±1 minggu**. Sebelum demo, aplikasi dibuka dulu (PRD 11).
- Paket gratis punya batas (ukuran database, jumlah project). Untuk satu apotek dengan ±40 obat, batas itu jauh dari tercapai.
- Vercel gratis hanya untuk non-komersial. Untuk project kuliah ini tidak masalah.
- Kelompok harus belajar SQL dan RLS. Ini sekaligus materi yang relevan dengan mata kuliah.
- Bergantung pada layanan pihak ketiga. Risiko ini dikurangi karena Supabase berbasis PostgreSQL biasa: data dan migrasi bisa dipindah ke server PostgreSQL lain.

## Kalau dosen bertanya…

**"Kenapa tidak pakai PHP dan MySQL seperti yang diajarkan?"**
Bisa, tetapi bagian tersulit (login, hash password, hak akses) harus kami buat sendiri, dan di situlah versi 1 kami gagal. Supabase memakai PostgreSQL, jadi kami tetap menulis SQL dan merancang tabel; yang tidak kami tulis ulang hanya sistem login, yang lebih aman bila dibuat oleh tim yang khusus mengurusnya.

**"Kenapa tidak pakai Prisma atau Drizzle? Itu kan populer."**
Karena keduanya masuk ke database dengan hak penuh dan melewati RLS. Kami ingin aturan hak akses tetap berlaku walaupun kode server kami ada bug. `supabase-js` selalu bertindak atas nama Staf yang login.

**"Kalau Supabase atau Vercel tutup, bagaimana?"**
Supabase adalah PostgreSQL biasa ditambah layanan login. Struktur database tersimpan sebagai file migrasi SQL di repo, jadi bisa dipasang ulang di PostgreSQL mana pun. Next.js juga bisa dijalankan di hosting lain.

**"Kenapa tidak pakai Firebase saja? Lebih gampang."**
Laporan pendapatan per periode butuh menggabungkan beberapa tabel dan menjumlahkan angka. Itu kekuatan database relasional (SQL). Di Firebase hal itu harus diakali dengan menyalin data ke banyak tempat.

**"Aplikasi kecil begini kok pakai framework?"**
Karena kebutuhannya bukan kecil: ada login dengan dua peran, aturan stok yang tidak boleh minus walau dua kasir menjual bersamaan, dan data yang harus sama di banyak perangkat. HTML biasa tidak sanggup menjamin itu, dan versi 1 sudah membuktikannya.
