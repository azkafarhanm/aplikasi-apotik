# ApotikKu: panduan kerja

Project mata kuliah Rekayasa Perangkat Lunak (TI25B). Pengembangnya sedang belajar, jadi setiap penjelasan harus bisa dipahami orang awam.

## Cara kerja

- Jawab dalam bahasa Indonesia.
- Setiap istilah teknis (RLS, migrasi, branch, hash, dll.) wajib disertai arti awam + analogi sehari-hari.
- Setiap keputusan (fitur, teknologi, desain, keamanan) wajib punya alasan: masalah apa yang diselesaikan, pilihan lain yang ditolak dan kenapa, serta jawaban untuk pertanyaan lanjutan dosen ("kenapa tidak pakai X?"). Ringkasannya di `docs/KENAPA.md`, detailnya di `docs/adr/`.
- Prinsip produk: "bukan kita yang butuh teknologi, tapi teknologi yang butuh kita". Fitur tanpa masalah nyata di `docs/PRD.md` tidak dibuat.
- Istilah domain mengikuti `CONTEXT.md` (misalnya Penjualan, bukan transaksi). Di kode, istilah domain tetap bahasa Indonesia; istilah teknis bahasa Inggris.
- Validasi kebutuhan lewat studi pustaka (riset internet dengan sumber), bukan wawancara.
- Jangan simpan data pribadi anggota kelompok (nama lengkap, NIM) di repo; repo ini publik.
- Satu tiket = satu branch + Pull Request yang menyebut nomor issue.
- Setiap pengguna menyetujui pindah ke tiket berikutnya, Claude membuka sesi baru untuk tiket itu (create_session) dengan konteks lengkap.

## Dokumen

- `docs/PRD.md`: produk, aktor, fitur (F-xx), non-fungsional (NF-xx), aturan bisnis, cakupan
- `CONTEXT.md`: glosarium istilah domain
- `docs/SPEC.md`: cara membangun (skema database, route, fungsi, RLS, rencana uji)
- `docs/adr/`: catatan keputusan penting
- `docs/sesi/`: bahan tugas tiap sesi kuliah
- `docs/penjelasan/`: penjelasan kode per fitur

## Keputusan yang sudah disepakati

- Bentuk: Katalog publik tanpa login + Area staf (Admin & Kasir) untuk satu apotek bernama ApotikKu.
- Teknologi: Next.js + Supabase (supabase-js, migrasi SQL, RLS sejak awal) + Vercel, semuanya paket gratis. Middleware/proxy menjaga `/staf/*`. Bukan Drizzle/Prisma, karena keduanya bisa melewati RLS.
- Visual: konsep "etiket apotek" (off-white, hijau apotek tua, tanda golongan obat sebagai elemen visual, harga dalam huruf monospace), tidak flat, tidak terlihat seperti template AI. Katalog dirancang untuk HP lebih dulu, berupa kartu etiket dengan laci Keluhan di atasnya; satuan ditulis lengkap ("per strip · 10 tablet"); layar kasir untuk laptop/tablet; tanpa mode gelap.
- Menu: Kasir = Jual, Penjualan hari ini. Admin = semua itu + Ringkasan, Obat, Laporan.
- Data awal: ±40 obat generik, harga acuan dari HET Kemenkes, kartu etiket tanpa foto.
- Kode HTML lama ada di tag `v1-html`.

## Urutan kerja

1. ~~PRD + PDF sesi 3~~ (selesai 6 Okt 2026)
2. ~~`docs/KENAPA.md` + ADR 0001–0004~~ (selesai 6 Okt 2026)
3. ~~Prototipe visual katalog "etiket apotek"~~ (selesai 6 Okt 2026: kartu etiket + laci Keluhan, lihat ADR 0004)
4. ~~`docs/SPEC.md`~~ (selesai 7 Okt 2026: skema, route, RLS, fungsi database, rencana uji)
5. ~~Tiket di GitHub Issues~~ (selesai 8 Okt 2026: induk #1, tiket #2–#14, label `siap-dikerjakan`)
6. ~~Tugas individu Sesi 2: Study Case SDLC~~ (selesai 8 Okt 2026: model Incremental, `docs/sesi/sesi-02-sdlc-incremental.md`; PDF bernama dibuat di luar repo)
7. Koding, mengikuti urutan di issue #1 (disepakati 9 Okt 2026; rantai terpanjang #6 → #8 → #10 → #13 didahulukan):
   1. ~~#2 Katalog tampil dari database~~ (selesai)
   2. ~~#3 Lengkapi sumber klaim di ADR~~ (selesai)
   3. ~~#18 Server aplikasi di Singapura~~ (selesai)
   4. #6 Login dan logout Staf
   5. #7 Data awal ±40 obat
   6. #8 Mencatat Penjualan
   7. #10 Struk dan Penjualan hari ini
   8. #13 Pembatalan
   9. #9 Kelola obat
   10. #11 Ringkasan
   11. #12 Laporan
   12. #4 Cari, laci Keluhan, "Tanpa resep"
   13. #5 Detail obat dan WhatsApp
   14. #14 Uji manual dan rilis

Bahan tugas dari dosen disusun di `docs/sesi/` tanpa nama/NIM; PDF yang memuat identitas dibuat di luar repo memakai template dosen.
