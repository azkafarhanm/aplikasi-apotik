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
6. Tugas dosen Sabtu 10 Okt (lihat di bawah), lalu koding mulai dari #2; akun Supabase dibuat saat itu (SPEC 4.12)

Tugas berikutnya dari dosen (batas Sabtu 10 Okt 2026): *Study Case Proses Pembangunan Perangkat Lunak* dan *Case Kelompok*. Bahannya disusun di `docs/sesi/`.
