# ADR 0004: Visual "etiket apotek"

| | |
|---|---|
| Status | Diterima (prototipe menyusul untuk dinilai) |
| Tanggal | 6 Oktober 2026 |
| Terkait | M-06; F-03; NF-03, NF-04 di [`PRD.md`](../PRD.md) |

## Konteks

Tampilan versi 1 memakai Bootstrap bawaan: rapi, tetapi terlihat seperti ribuan aplikasi lain. Saat ini juga banyak aplikasi yang dibuat dengan bantuan AI dan hasilnya mirip satu sama lain: latar putih polos atau gradasi ungu, kartu membulat dengan bayangan tipis, ikon dan emoji di mana-mana. Tampilan seperti itu tidak memberi identitas dan tidak membantu masalah apa pun.

Sementara itu, ada masalah yang justru bisa dibantu tampilan:

- **M-06**: banyak orang belum memperhatikan logo golongan obat (lingkaran hijau, biru, merah dengan huruf K).
- **NF-03**: target harga ditemukan dalam ≤ 2 langkah dan bahasa yang mudah dipahami orang awam.
- **NF-04**: Pengunjung kebanyakan membuka dari HP.

## Keputusan

Konsep visual **"etiket apotek"**: tampilan meminjam bahasa visual yang sudah akrab bagi orang Indonesia, yaitu etiket (label) yang ditempel apoteker di kemasan obat, kemasan obat generik, dan papan apotek.

> **Etiket** = label kecil dari apotek berisi nama obat dan aturan pakai. Etiket putih untuk obat diminum, biru untuk obat luar.
> *Analogi untuk konsep ini:* seperti kafe yang dekorasinya meniru warung kopi lama. Pengunjung langsung paham "ini tempat apa" tanpa harus membaca papan nama.

| Elemen | Wujud | Alasan |
|---|---|---|
| Warna dasar | Off-white (putih kekuningan seperti kertas etiket), bukan putih murni | Lebih nyaman di mata dan terasa "kertas", tidak dingin seperti layar |
| Warna utama | Hijau apotek tua | Warna yang lazim dipakai papan apotek di Indonesia; terasa tepercaya, bukan warna startup |
| Kartu obat | Berbentuk etiket: garis tepi, nama obat tegas, tanpa foto | Data awal tidak punya foto berlisensi; kartu tanpa foto juga lebih ringan dimuat di HP (NF-05) dan seragam |
| **Tanda golongan obat** | Lingkaran hijau, biru, dan merah-K dipakai sebagai elemen visual utama di setiap kartu, **selalu disertai teks** ("Obat bebas", "Perlu resep dokter") | Setiap kali Pengunjung mencari obat, ia ikut belajar membaca logo golongan (M-06). Teks wajib ada karena ±1 dari 12 laki-laki buta warna, jadi warna tidak boleh menjadi satu-satunya penanda |
| Harga | Huruf monospace (setiap angka sama lebar) | Angka lurus sejajar sehingga mudah dibandingkan, dan mengingatkan pada cetakan struk/label harga |
| Tekstur | Tidak flat: garis putus-putus seperti potongan label, bayangan tipis seperti kertas ditempel | Memberi karakter tanpa mengganggu keterbacaan |
| Tata letak | Katalog untuk HP lebih dulu; layar kasir untuk laptop/tablet | Sesuai perangkat masing-masing aktor (NF-04) |
| Mode gelap | Tidak ada | Lihat pilihan yang ditolak |

## Pilihan yang ditolak

| Pilihan | Kenapa ditolak |
|---|---|
| **Bootstrap / template bawaan** (seperti versi 1) | Cepat, tetapi tanpa identitas, dan tidak ada yang membantu masalah M-06. |
| **Gaya flat modern / "template AI"** (putih polos atau gradasi ungu, kartu bulat, banyak emoji) | Terlihat generik dan tidak menunjukkan proses desain. Dosen dan pengguna sulit membedakannya dari aplikasi lain. |
| **Kartu dengan foto produk** | Foto kemasan bermerek punya hak cipta; data awal kami obat generik tanpa foto resmi. Foto yang tidak seragam membuat Katalog terlihat berantakan dan lebih berat dimuat. Dijadwalkan sebagai pilihan tambahan di milestone 2. |
| **Mode gelap** | Menggandakan pekerjaan desain dan pengujian (setiap warna harus dicek dua kali, termasuk warna golongan obat yang maknanya resmi). Tidak ada masalah di PRD yang membutuhkannya, dan apotek biasanya terang. |
| **Warna mengikuti merek tertentu** (meniru apotek jaringan besar) | Berisiko melanggar merek dagang dan menghilangkan identitas sendiri. |
| **Golongan obat hanya ditampilkan sebagai teks kecil** | Kehilangan kesempatan edukasi. Logo resmi justru yang harus dikenali masyarakat saat membeli obat di mana pun. |

## Konsekuensi

**Yang didapat**
- Identitas visual yang khas dan bisa dijelaskan alasannya, bukan sekadar "biar bagus".
- Katalog ikut menjadi sarana edukasi golongan obat.
- Tanpa foto, Katalog lebih ringan di HP.

**Yang harus diterima**
- Komponen tampilan harus dirancang sendiri, tidak bisa sekadar memakai template, jadi butuh waktu lebih lama.
- Warna golongan obat harus mengikuti makna resminya dan **tidak boleh dipakai untuk hal lain** (misalnya merah tidak dipakai untuk tombol hapus biasa supaya tidak tertukar dengan "Obat keras").
- Kontras warna harus dicek supaya tetap terbaca (NF-04: huruf besar, kontras tinggi).
- Konsep ini baru keputusan arah. **Prototipe visual** akan dibuat dan dinilai lebih dulu sebelum dipakai di seluruh aplikasi.

## Kalau dosen bertanya…

**"Kenapa tidak pakai template saja biar cepat?"**
Template memang cepat, tetapi tidak membantu masalah apa pun di PRD. Tampilan etiket apotek punya fungsi: logo golongan obat yang tampil di setiap kartu mengajari Pengunjung membedakan obat bebas dan obat yang perlu resep (M-06).

**"Kenapa tidak ada foto obatnya?"**
Foto kemasan bermerek punya hak cipta, data awal kami obat generik, dan foto memperlambat Katalog di HP. Kartu berbentuk etiket sudah cukup memberi informasi yang dibutuhkan: nama, bentuk, harga, golongan, dan stok.

**"Kenapa tidak ada mode gelap? Sekarang kan sudah standar."**
Karena tidak ada masalah pengguna yang diselesaikannya, sementara biaya pengujiannya dua kali lipat. Warna golongan obat juga punya makna resmi yang harus tetap jelas. Sesuai prinsip kami, fitur tanpa masalah nyata tidak dibuat.

**"Kenapa harganya pakai huruf seperti mesin ketik?"**
Huruf monospace membuat setiap angka sama lebar, sehingga harga dalam satu daftar sejajar dan mudah dibandingkan. Bentuknya juga mengingatkan pada label harga dan struk.

**"Bagaimana dengan orang buta warna?"**
Warna golongan obat selalu disertai teks ("Obat bebas", "Obat bebas terbatas", "Perlu resep dokter"). Warna membantu, tetapi bukan satu-satunya penanda.
