# Riset: perlukah pilihan "QRIS/transfer" di layar Jual? (tiket #8)

> Dokumen ini mencatat alasan dan sumber untuk keputusan **Cara bayar** (CONTEXT.md): layar Jual punya dua pilihan, Tunai dan QRIS/transfer, dan QRIS/transfer **hanya dicatat**, tidak tersambung ke bank (PRD aturan bisnis 6, bagian 9). Validasi lewat studi pustaka (CLAUDE.md), bukan wawancara.

| | |
|---|---|
| Tanggal riset | 16 Oktober 2026 |
| Pertanyaan | Seberapa umum QRIS di usaha kecil? Ke mana uang QRIS masuk? Apakah apotek menerima QRIS? |
| Keputusan | Disetujui pengguna 16 Oktober 2026 (ronde pertanyaan tiket #8, Q8): pilihan QRIS/transfer tetap ada, hanya sebagai catatan |

> **QRIS (Quick Response Code Indonesian Standard)** = satu kode QR standar Bank Indonesia yang bisa dipindai dari aplikasi bank atau dompet digital mana pun. *Analogi:* satu colokan listrik standar; perangkat merek apa pun bisa dicolokkan.

## Catatan cara pengumpulan (penting dibaca dulu)

Angka di bawah dikumpulkan lewat mesin pencari. **Halaman aslinya tidak bisa dibuka dari lingkungan kerja kami** (jaringan sesi cloud hanya mengizinkan beberapa situs), jadi angkanya diambil dari ringkasan hasil pencarian, bukan dibaca langsung dari halamannya. Karena itu:

- Butir yang didukung beberapa sumber berbeda ditandai **(beberapa sumber)**.
- Butir yang hanya dari satu sumber ditandai **(satu sumber)**.
- Sebelum dikutip di laporan tugas, buka tautannya dan cocokkan angkanya (langkah di bagian akhir).

## 1. QRIS sudah umum di usaha kecil

| Fakta | Sumber |
|---|---|
| Per Juni 2026, QRIS diterima **44,86 juta merchant** dengan **65,77 juta pengguna**; **96,68%** merchant itu UMKM. Target BI akhir 2026: 47 juta merchant, 70 juta pengguna **(satu sumber, mengutip data BI)** | Republika, "BI Ungkap 96,68 Persen Merchant QRIS adalah UMKM", 21 Agustus 2026, https://ekonomi.republika.co.id/berita/tk4dix502/bi-ungkap-9668-persen-merchant-qris-adalah-umkm |
| Semester I 2025: 39,3 juta merchant (93,16% UMKM), 57 juta pengguna | Kontan, "BI sebut pengguna QRIS tembus 57 juta orang per semester I 2025", https://keuangan.kontan.co.id/news/bi-sebut-pengguna-qris-tembus-57-juta-orang-per-semester-i-2025 |
| Rapat Dewan Gubernur BI 17 Desember 2025: 42 juta merchant (melewati target 40 juta), 59 juta pengguna | Bisnis.com, "Transaksi QRIS 2 Kali Lipat dari Target, Ekonomi RI Cerah?", 18 Desember 2025, https://ekonomi.bisnis.com/read/20251218/9/1937730/transaksi-qris-2-kali-lipat-dari-target-ekonomi-ri-cerah |

Kesimpulan: sebagian besar penerima QRIS adalah usaha kecil seperti ApotikKu, dan jumlahnya terus naik. Jadi pembeli yang ingin membayar dengan QRIS adalah keadaan sehari-hari, bukan pengecualian.

## 2. QRIS gratis untuk transaksi kecil di usaha mikro

| Fakta | Sumber |
|---|---|
| Biaya MDR QRIS **0% untuk transaksi sampai Rp500.000** di usaha mikro, berlaku 1 Desember 2024 (sebelumnya batas gratis Rp100.000) **(beberapa sumber)** | Pasardana, 17 Oktober 2024, https://pasardana.id/news/2024/10/17/transaksi-qris-maksimal-rp500-ribu-ke-pedagang-kecil-gratis-berlaku-1-desember-2024 ; Kontan, https://keuangan.kontan.co.id/news/bi-gratiskan-biaya-mdr-qris-untuk-transaksi-hingga-rp-500000-ini-kata-perbankan |
| Januari 2026: BI menegaskan tarif 0% itu masih berlaku dan pedagang dilarang membebankan biaya QRIS ke pembeli | CNBC Indonesia, "Pakai QRIS Ada Biaya Admin? Ini Penjelasan BI", 13 Januari 2026, https://www.cnbcindonesia.com/market/20260113082606-17-701822/pakai-qris-ada-biaya-admin-ini-penjelasan-bi |

> **MDR (Merchant Discount Rate)** = potongan biaya yang ditanggung penjual setiap menerima pembayaran QRIS. *Analogi:* biaya admin transfer, tetapi dipotong dari uang yang diterima penjual.

Hampir semua Penjualan apotek kecil di bawah Rp500.000, jadi apotek tidak rugi biaya dengan menerima QRIS.

## 3. Uang QRIS tidak masuk ke laci kasir

| Fakta | Sumber |
|---|---|
| Untuk menerima QRIS, merchant membuka rekening/akun di salah satu Penyedia Jasa Pembayaran berizin BI (bank atau dompet digital); dananya masuk ke sana | Bank Indonesia, halaman QRIS, https://www.bi.go.id/id/fungsi-utama/sistem-pembayaran/ritel/kanal-layanan/QRIS/default.aspx |
| Dana dicairkan ke rekening penjual pada hari yang sama atau H+1, tergantung penyedia (contoh: BRI H+1 pukul 06.30–10.00 WIB; Mandiri H+1 untuk QRIS statis) | BRI, https://developers.bri.co.id/en/product/qris ; Bank Mandiri, https://www.bankmandiri.co.id/qris |

**Inilah masalah yang diselesaikan pilihan "QRIS/transfer".** Saat tutup toko, Kasir atau Admin menghitung uang di laci dan mencocokkannya dengan catatan Penjualan tunai. Kalau Penjualan QRIS ikut tercatat sebagai tunai, laci selalu terlihat "kurang", padahal uangnya ada di rekening. Kasir yang jujur bisa dicurigai, sedangkan kekurangan yang sungguhan malah tersamar. Dengan memisahkan Cara bayar, Admin bisa mencocokkan:

- uang di laci = total Penjualan **tunai** hari itu;
- mutasi rekening = total Penjualan **QRIS/transfer** hari itu.

## 4. Apotek menerima QRIS (bukti per kasus, tanpa angka resmi)

Kami **tidak menemukan** data resmi (BI, Kemenkes, BPS) tentang berapa persen apotek yang menerima QRIS. Yang ada hanya contoh:

- Bank Syariah Indonesia memasang EDC dan QRIS di apotek Kimia Farma Banda Aceh (Desember 2021): https://keuangan.kontan.co.id/news/gandeng-kimia-farma-bsi-bidik-transaksi-edc-dan-qris-syariah-di-aceh
- Promo pembayaran QR di Kimia Farma oleh Bank Mandiri, 14 Mei–30 Juni 2026: https://www.bankmandiri.co.id/kimia-farma-qr-livinpoin
- Studi kasus apotek kecil yang memakai QRIS (2023): Apotek Sejahtera Farma, Kediri (https://proceeding.unpkediri.ac.id/index.php/simanis/article/download/3382/2622) dan Apotek Nings, Pekalongan (https://proceeding.unikal.ac.id/index.php/senesis/article/download/1894/1385).

Kesimpulan yang aman: apotek termasuk usaha yang lazim menerima QRIS, tetapi tidak ada angka resminya.

## 5. Kenapa hanya dicatat, bukan QRIS sungguhan

| Pilihan | Keputusan | Alasan |
|---|---|---|
| Pilihan "QRIS/transfer" yang hanya dicatat | **Dipilih** | Menyelesaikan masalah laci (bagian 3) hanya dengan satu kolom di tabel dan dua tombol di layar. Pembeli memindai QR yang sudah ditempel apotek di meja kasir |
| Tunai saja | Ditolak | Laci tampak "kurang" setiap kali ada pembayaran QRIS |
| QRIS sungguhan (aplikasi menampilkan QR dan mengecek uang masuk) | Ditolak (PRD bagian 9) | Butuh kerja sama dengan bank atau penyedia pembayaran, sering berbayar atau perlu verifikasi usaha, dan apotek sudah punya QR statis dari banknya |

## Yang belum bisa dipastikan

- Persentase apotek yang menerima QRIS (tidak ada data resmi yang ditemukan).
- Tarif MDR 0,3% untuk usaha mikro di atas Rp500.000. Hanya ditemukan di tabel bank (Bank Sampoerna, https://www.banksampoerna.com/article/API-Merchant-QRIS), tidak di siaran pers BI. Tidak dipakai untuk keputusan apa pun.
- Angka merchant lain yang beredar (47,11 juta, 45,46 juta per September 2026) tidak dipakai, karena sumbernya tidak bisa dicocokkan.

## Cara mengecek ulang dari HP

1. Buka tautan Republika (bagian 1) dan CNBC Indonesia (bagian 2) di browser HP.
2. Cari angka "96,68", "44,86 juta", dan "Rp500.000" di halamannya (menu browser → Cari di halaman).
3. Bila angkanya berbeda, beri tahu Claude di sesi berikutnya supaya dokumen ini diperbaiki. Keputusannya tidak berubah, karena alasannya (bagian 3) tidak bergantung pada angka-angka itu.
