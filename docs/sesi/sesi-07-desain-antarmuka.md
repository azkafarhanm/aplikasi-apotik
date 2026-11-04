# Desain Antarmuka Perangkat Lunak: mockup menjadi kode tampilan

> Bahan tugas Sesi 7 mata kuliah Rekayasa Perangkat Lunak (TI25B). Versi di repo ini sengaja **tanpa nama dan NIM**; PDF yang memuat identitas kelompok dibuat di luar repo memakai format tugas dosen.
> Dokumen ini mencatat apa yang dikerjakan pada Sesi 7 dan bagaimana hubungannya dengan aplikasi sungguhan di repo ini.

## Soal

1. Ubah mockup menjadi **kode tampilan** memakai HTML, CSS, dan Bootstrap/Tailwind.
2. Pastikan tampilannya **responsif** untuk HP dan desktop.
3. Dikumpulkan dalam bentuk PDF, paling lambat H-1 pertemuan berikutnya.
4. Dikumpulkan dan **dipresentasikan** pada Sesi 7.

## Jawaban

### Pengantar

Pada Sesi 5–6, rancangan layar (*wireframe* dan *mockup*) ApotikKu dibuat di Figma dan dimasukkan ke SKPL Revisi B bagian 4.3.1.1. Sesi 7 mengubah rancangan itu menjadi **kode tampilan yang bisa dibuka di browser**, lalu memastikannya menyesuaikan diri dengan lebar layar HP maupun desktop. Hasilnya dimasukkan ke SKPL **Revisi C** (4.3.1.1.2 Implementasi tampilan, 4.3.6.1 Stack teknologi, dan Matriks Keterunutan 4.4).

> **Responsif** = tampilan yang menyesuaikan diri dengan lebar layar. *Analogi:* air yang mengikuti bentuk gelasnya; isinya sama, susunannya menyesuaikan wadah.

### 1. Teknologi yang dipakai

| Teknologi | Fungsi di ApotikKu |
|---|---|
| HTML5 | Kerangka setiap halaman: header, formulir, tabel, dan kartu obat |
| Tailwind CSS 3 | Mengatur tampilan dan responsif lewat kelas, misalnya `md:grid-cols-2` |
| CSS (`@font-face`, `@apply`) | Memasang huruf IBM Plex dan membuat komponen yang dipakai ulang, misalnya `.kartu` |
| JavaScript (sedikit) | Interaksi sederhana: pencarian, saring Keluhan, keranjang, dan tombol Menu di HP |

**Kenapa Tailwind, bukan Bootstrap?** Mockup ApotikKu memakai gaya sendiri, yaitu konsep "etiket apotek" (kertas off-white, hijau apotek tua, harga berhuruf monospace; lihat [ADR 0004](../adr/0004-visual-etiket-apotek.md)). Dengan Tailwind, warna dan ukuran bisa diatur persis seperti mockup, sedangkan Bootstrap cenderung menghasilkan tampilan "khas Bootstrap". Tailwind juga hanya menyimpan kelas yang benar-benar dipakai, sehingga file CSS akhirnya kecil (sekitar 20 KB).

### 2. Sembilan halaman

Sesuai daftar layar di SKPL 4.3.1.1:

| No | Halaman | Pengguna |
|---|---|---|
| 1 | Katalog | Pengunjung |
| 2 | Detail obat | Pengunjung |
| 3 | Masuk Staf | Staf |
| 4 | Struk 58 mm | Kasir |
| 5 | Ringkasan | Admin |
| 6 | Jual | Kasir, Admin |
| 7 | Penjualan hari ini | Kasir, Admin |
| 8 | Kelola obat | Admin |
| 9 | Laporan | Admin |

Data obat pada halaman-halaman ini masih **data contoh** yang ditulis di berkas JavaScript, karena tugas Sesi 7 berfokus pada tampilan. Di aplikasi sungguhnya, data diambil dari database Supabase seperti yang dijelaskan di SKPL.

### 3. Cara membuat tampilan responsif

Tailwind memakai prinsip **mobile-first**: aturan tanpa awalan berlaku untuk HP, lalu aturan berawalan berlaku mulai lebar tertentu. Batas lebar yang dipakai: `sm` = 640 px, `md` = 768 px, `lg` = 1024 px.

Perubahan susunan di setiap halaman:

| Bagian | Di HP (360 px) | Di desktop (1280 px) |
|---|---|---|
| Kartu obat (Katalog) | 1 kolom; laci Keluhan bisa digeser ke samping | 3 kolom; semua laci Keluhan terlihat |
| Menu staf | Dilipat menjadi tombol "Menu" | Berjajar di header, menu aktif bergaris bawah |
| Tabel (Penjualan, Obat) | Diganti kartu atau daftar ringkas | Tabel lengkap |
| Jual | Keranjang turun ke bawah daftar, ada bilah total di bawah layar | Daftar obat kiri, keranjang kanan |
| Detail obat | 1 kolom, tombol WhatsApp lebar penuh | 2 kolom: harga kiri, keterangan kanan |
| Masuk Staf | Kotak dekat atas supaya tidak tertutup keyboard | Kotak di tengah layar |

### 4. Hasil pengujian responsif

Setiap halaman dibuka pada beberapa lebar layar, lalu diperiksa apakah ada isi yang meluap ke samping (harus digeser horizontal):

| Lebar layar | Mewakili | Halaman diuji | Hasil |
|---|---|---|---|
| 360 px | HP Android umum | 9 halaman | Tidak ada yang meluap |
| 768 px | Tablet | 9 halaman | Tidak ada yang meluap |
| 1024 px | Laptop kecil | 9 halaman | Tidak ada yang meluap |
| 1280 px | Laptop | 9 halaman | Tidak ada yang meluap |
| 1920 px | Monitor besar | 9 halaman | Tidak ada yang meluap, isi tetap di tengah |

Satu masalah ditemukan dan diperbaiki: pada pengujian pertama, halaman Jual di HP meluap ke kanan karena nama obat yang panjang membuat kolom grid melebar. Perbaikannya menambahkan `grid-cols-1` dan `min-w-0`, lalu memperpendek tombol "+ Tambah" menjadi "+" di HP supaya nama obat tidak terpotong.

### 5. Hubungan dengan aplikasi di repo ini

Penting dibedakan, karena keduanya sama-sama bernama ApotikKu:

| | Tampilan Sesi 7 | Aplikasi di repo ini |
|---|---|---|
| Teknologi | HTML + Tailwind + sedikit JavaScript | Next.js + CSS Modules + Supabase |
| Data | Data contoh di berkas JavaScript | Database sungguhan, dijaga aturan hak akses (RLS) |
| Tujuan | Membuktikan rancangan layar bisa diwujudkan dan responsif | Perangkat lunak yang benar-benar dipakai |
| Kesembilan halaman | Semuanya sudah ada | Dikerjakan bertahap per tiket (model Incremental, [Sesi 2](sesi-02-sdlc-incremental.md)) |

Jadi tampilan Sesi 7 berperan sebagai **rancangan yang sudah terbukti**, dan setiap tiket koding mewujudkannya di aplikasi sungguhan dengan data asli. Urutan pengerjaannya ada di [`CLAUDE.md`](../../CLAUDE.md) dan issue #1.

Status setiap kebutuhan per 1 November 2026 tercatat di **Matriks Keterunutan SKPL Revisi C bagian 4.4**. Matriks itu adalah jawaban resmi untuk pertanyaan "project sudah sampai mana", dan diperbarui setiap kali ada tiket yang selesai.

### 6. Kesimpulan

Mockup ApotikKu berhasil diubah menjadi 9 halaman web dengan HTML, CSS, dan Tailwind CSS. Tampilannya mengikuti mockup di SKPL dan menyesuaikan diri dengan lebar layar: di HP isinya disusun satu kolom, menu dilipat, dan tabel diganti kartu; di desktop isinya disusun beberapa kolom. Tahap berikutnya adalah menyambungkan tampilan ini ke database Supabase pada aplikasi Next.js kelompok.

## Catatan untuk kelompok

- PDF yang dikumpulkan ke dosen memuat nama dan NIM anggota, jadi **tidak disimpan di repo ini** (repo bersifat publik; lihat aturan di [`CLAUDE.md`](../../CLAUDE.md)).
- Berkas tampilan Sesi 7 (`apotikku-tampilan/`) dikerjakan di luar repo ini. Bila ingin disimpan sebagai acuan saat membangun halaman aslinya, letakkan di `docs/sesi/tampilan-sesi-07/` dan sebutkan di dokumen ini.
