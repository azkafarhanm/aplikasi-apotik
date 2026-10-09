# Penjelasan kode: Katalog tampil dari database (tiket #2)

> Dokumen ini menjelaskan kode tiket #2 untuk orang yang belum pernah membuat aplikasi web. Istilah domain (Obat, Status stok, Golongan obat) mengikuti [`CONTEXT.md`](../../CONTEXT.md). Istilah teknis lain ada di kamus [`KENAPA.md`](../KENAPA.md#kamus-istilah-teknis).

## 1. Apa yang terjadi saat Pengunjung membuka ApotikKu

```
HP Pengunjung ──1──▶ Vercel (Next.js) ──2──▶ Supabase: tampilan katalog
      ▲                     │                        │
      └──────4── HTML ◀─────┴───3── daftar obat ◀────┘
```

1. Pengunjung membuka alamat ApotikKu. HP mengirim permintaan ke server Vercel, tempat aplikasi Next.js berjalan.
2. Server **langsung** mengirim kerangka halaman (judul "Katalog obat" dan catatan informasi umum) yang sudah disiapkan saat aplikasi dibangun. Sambil itu, server bertanya ke database Supabase: "berikan semua isi tampilan `katalog`, urut nama".
3. Database menjawab dengan daftar obat. Isinya hanya kolom yang aman: nama, harga jual, golongan, Status stok, dan sebagainya. Angka stok, harga acuan, dan tanggal kedaluwarsa **tidak pernah keluar** dari database.
4. Server menyusun kartu etiket dan mengirimkannya ke HP sebagai HTML jadi. HP tidak perlu menjalankan program apa pun untuk menampilkan daftar.

*Analogi:* restoran. Pelayan (Next.js) langsung menaruh piring dan sendok (kerangka halaman), lalu mengambil masakan dari dapur (database). Dapur hanya mengeluarkan masakan lewat jendela saji (`katalog`), bukan membuka gudang bahan.

Langkah 2–4 terjadi **setiap kali** halaman dibuka, jadi Status stok selalu sesuai keadaan terakhir di database.

## 2. Peta file

| File | Isinya | Analogi |
|---|---|---|
| `supabase/migrations/20261009034254_katalog.sql` | Resep bentuk database: tabel `obat`, fungsi `status_stok`, tampilan `katalog`, dan aturan hak akses | Gambar kerja gudang |
| `supabase/data/contoh.sql` | 11 obat contoh untuk project asli (1 diarsipkan) | Barang pajangan sementara |
| `supabase/uji/data-uji.sql` | Baris khusus tes untuk project `apotikku-uji` | Barang uji di laboratorium |
| `lib/supabase/server.ts` | Membuat sambungan ke Supabase memakai kunci publik | Telepon ke gudang |
| `lib/katalog.ts` | Mengambil daftar obat dan mengubah kode database menjadi tulisan yang dibaca orang (`bebas_terbatas` → "Obat bebas terbatas", `4000` → "Rp4.000") | Penerjemah label |
| `app/page.tsx` | Halaman Katalog (`/`) | Etalase |
| `components/KartuEtiket.tsx` | Satu kartu obat berbentuk etiket | Satu label harga |
| `components/TandaGolongan.tsx` | Logo lingkaran hijau, biru, dan merah-K | Stiker tanda golongan |
| `app/globals.css`, `*.module.css` | Warna, huruf, dan tata letak | Cat dan rak |
| `tests/katalog.test.ts` | Tes otomatis yang berperan sebagai Pengunjung | Pembeli misterius |
| `.github/workflows/tes-database.yml` | Perintah agar GitHub menjalankan tes di setiap Pull Request | Jadwal petugas QC |

## 3. Database: tiga bagian penting

### Tabel `obat`

Menyimpan data lengkap setiap obat (SPEC 4.3). Beberapa aturan dijaga langsung oleh database, sehingga data salah ditolak sejak awal:

- `golongan` hanya boleh `bebas`, `bebas_terbatas`, atau `keras`. Salah ketik "kras" langsung ditolak.
- `harga_jual` harus lebih dari 0, `stok` tidak boleh negatif.
- Uang disimpan sebagai **bilangan bulat rupiah** (4000, bukan 4000.00).
- `slug` (nama untuk alamat web, misalnya `parasetamol-500-mg`) dibuat otomatis dari nama dan **tidak berubah** walaupun nama diubah, supaya tautan yang sudah dikirim lewat WhatsApp tetap jalan.

### Fungsi `status_stok`

Satu-satunya tempat aturan Status stok ditulis (PRD aturan bisnis 1–2):

```sql
case
  when tanggal_kedaluwarsa < private.hari_ini() then 'habis'   -- sudah kedaluwarsa
  when stok <= 0                                  then 'habis'
  when stok <= 20                                 then 'hampir_habis'
  else                                                 'tersedia'
end
```

Urutan pengecekan penting: kedaluwarsa dicek **lebih dulu**, jadi obat kedaluwarsa dengan stok 50 tetap tertulis Habis.

`hari_ini()` menghitung tanggal menurut **WIB**, bukan jam server (UTC, 7 jam lebih lambat). Tanpa ini, antara pukul 00.00 dan 07.00 WIB server masih menganggap "kemarin".

### Tampilan `katalog`

"Jendela" yang hanya memperlihatkan kolom aman dan hanya obat yang tidak diarsipkan. Pengunjung **tidak punya izin** membaca tabel `obat`; satu-satunya yang boleh dibaca adalah tampilan ini.

## 4. Kesalahan yang ditemukan tes, dan perbaikannya

Versi pertama migrasi menaruh `status_stok` di skema `public` dan menutup izinnya untuk semua orang. Hasilnya: tes langsung gagal dengan pesan *"permission denied for function status_stok"*.

Penyebabnya: tampilan `katalog` membaca **tabel** memakai hak pemiliknya, tetapi **fungsi** di dalamnya tetap dicek memakai hak si pembaca (Pengunjung). *Analogi:* petugas gudang boleh mengambilkan barang untuk pembeli, tetapi kalkulator yang dipakai menghitung harus kalkulator yang boleh disentuh pembeli.

Pilihannya:

| Pilihan | Masalah |
|---|---|
| Buka izin `status_stok` di skema `public` | Supabase otomatis menjadikannya alamat API, jadi siapa pun bisa memanggilnya langsung. Melanggar SPEC 5.2 |
| Salin rumus Status stok ke dalam tampilan | Aturan tidak lagi di satu tempat; layar kasir dan Ringkasan nanti bisa berbeda rumus |
| **Pindahkan fungsi ke skema `private`** (dipilih) | Supabase hanya membuka skema `public` ke internet. Pengunjung boleh *memakai* fungsi lewat tampilan, tetapi tidak bisa *memanggilnya* langsung |

Inilah gunanya tes otomatis: kesalahan hak akses ketahuan sebelum aplikasi dipakai siapa pun.

## 5. Halaman: kenapa ada `Suspense` dan `connection()`

Next.js versi 16 berusaha menyiapkan halaman sebanyak mungkin saat aplikasi dibangun (*prerender*), lalu menyajikan salinan itu ke semua orang. Itu cepat, tetapi untuk daftar obat berbahaya: Status stok akan membeku seperti saat dibangun.

Karena itu `app/page.tsx` dibagi dua:

- **Bagian tetap** (judul, catatan informasi umum) disiapkan saat build dan langsung tampil.
- **`DaftarObat`** dibungkus `<Suspense>` dan diawali `await connection()`. Artinya: "bagian ini jangan disiapkan lebih dulu, buat ulang setiap ada yang membuka halaman". Selama menunggu database, Pengunjung melihat tulisan "Memuat daftar obat…".

Hasil build menandai halaman `/` sebagai **◐ Partial Prerender**, yang membuktikan pembagian ini berjalan.

Bila database tidak bisa dihubungi, halaman tidak rusak. Pengunjung melihat "Katalog sedang tidak bisa dimuat. Coba muat ulang halaman sebentar lagi."

## 6. Tampilan kartu etiket

Mengikuti ADR 0004:

- Logo golongan digambar sebagai SVG (gambar dari garis dan lingkaran, tajam di layar mana pun) sesuai penandaan resmi: lingkaran bergaris tepi hitam; merah untuk Obat keras dengan huruf K yang menyentuh garis tepi.
- Logo **selalu** ditemani tulisan ("Obat bebas", "Obat bebas terbatas", "Perlu resep dokter"), supaya Pengunjung buta warna tetap paham.
- Warna hijau, biru, dan merah **hanya** dipakai untuk logo golongan. Status stok memakai hijau apotek tua, cokelat-oranye, dan abu-abu, ditambah bentuk titik yang berbeda (penuh, setengah, kosong).
- Harga memakai huruf monospace (setiap angka sama lebar) supaya sejajar seperti label harga.
- Lebar kartu disusun untuk HP 360 px lebih dulu; di layar lebar kartu menjadi 2 atau 3 kolom. Sudah dicek: di 360 px tidak ada bagian yang perlu digeser ke samping.

## 7. Tes otomatis

`tests/katalog.test.ts` tersambung ke project **`apotikku-uji`** dengan kunci publik, persis seperti halaman Katalog, lalu memeriksa 16 perilaku:

- Pengunjung bisa membaca `katalog`, dan kolomnya **persis** 10 kolom aman. Meminta kolom `stok` atau `harga_acuan` ditolak.
- Obat yang diarsipkan tidak muncul.
- Pengunjung **tidak bisa** membaca tabel `obat`, menambah, mengubah, atau menghapus obat (lewat tabel maupun lewat tampilan), dan tidak bisa memanggil fungsi database. Setelah semua percobaan itu, data tetap sama.
- Batas Status stok: stok 0 → Habis, 1 dan 20 → Hampir habis, 21 → Tersedia, kedaluwarsa kemarin → Habis, kedaluwarsa hari ini → mengikuti stok.

**Masalah tanggal:** baris "kedaluwarsa hari ini" tersimpan dengan tanggal tetap, jadi besoknya sudah basi. Di project uji ada jadwal kecil (pg_cron) yang setiap menit mengubah tanggal dua baris uji itu menjadi "kemarin" dan "hari ini" menurut WIB. Jadwal ini tidak ada di project asli.

## 8. Cara menjalankan di laptop

1. Pasang Node.js 22.
2. `npm install`
3. Salin `.env.example` menjadi `.env.local`, lalu isi alamat dan *publishable key* dari dasbor Supabase (Project Settings → API). Hanya kunci publik; kunci rahasia tidak pernah dipakai.
4. `npm run dev`, lalu buka `http://localhost:3000`.
5. `npm test` untuk menjalankan tes database ke project uji.

Di GitHub, tes berjalan otomatis setiap ada Pull Request. Alamat dan kunci publik project uji diambil dari *secrets* GitHub bernama `SUPABASE_UJI_URL` dan `SUPABASE_UJI_PUBLISHABLE_KEY`.

## Kalau dosen bertanya…

**"Kenapa halaman tidak disimpan di cache saja supaya lebih cepat?"**
Status stok harus sesuai Penjualan terakhir. Kami hanya menyimpan bagian yang tidak pernah berubah (judul, catatan); daftar obat selalu diambil baru. Untuk ±40 obat, satu permintaan ke database tetap cepat.

**"Kunci Supabase-nya kelihatan di kode browser, apa tidak bahaya?"**
Yang dipakai hanya kunci publik, yang memang dirancang untuk terlihat (seperti kartu tamu). Yang menjaga data adalah aturan di database: kunci publik hanya bisa membaca tampilan `katalog`, dan itu dibuktikan oleh tes.

**"Kenapa data contoh tidak memakai HET resmi?"**
HET resmi harus dicek ke dokumen sumbernya dan dicantumkan (CLAUDE.md: validasi lewat studi pustaka). Itu tugas tiket #7. Supaya tidak ada angka yang terlihat resmi padahal karangan, harga acuan di data contoh sengaja dikosongkan dan harga jualnya ditandai sebagai contoh.
