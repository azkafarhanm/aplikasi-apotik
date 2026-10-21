# Riset: kenapa Pembatalan hanya untuk Penjualan hari ini? (tiket #13)

> Dokumen ini mencatat alasan dan sumber untuk aturan **Pembatalan** (CONTEXT.md): Admin hanya bisa membatalkan Penjualan **hari ini (WIB)**. Validasi lewat studi pustaka (CLAUDE.md), bukan wawancara.

| | |
|---|---|
| Tanggal riset | 21 Oktober 2026 |
| Pertanyaan | Di sistem kasir umum, kapan sebuah penjualan boleh "dihapus dari catatan" (*void*), dan kapan harus lewat pengembalian (*refund*/retur)? |
| Keputusan | Disetujui pengguna 21 Oktober 2026 (ronde pertanyaan tiket #13, Q1): hanya Penjualan hari ini yang bisa dibatalkan |

> **Void** = membatalkan transaksi sebelum "tutup buku" hari itu, sehingga transaksi dianggap tidak pernah terjadi secara keuangan. **Refund/retur** = transaksi baru yang mengembalikan uang (dan barang) setelah buku ditutup. *Analogi:* mencoret tulisan pensil di buku catatan hari ini, dibandingkan menulis baris koreksi baru di buku yang sudah ditandatangani kemarin.

## Catatan cara pengumpulan (penting dibaca dulu)

Sumber dikumpulkan lewat mesin pencari. **Halaman aslinya tidak bisa dibuka dari lingkungan kerja kami** (jaringan sesi cloud hanya mengizinkan beberapa situs), jadi isinya diambil dari ringkasan hasil pencarian. Sebelum dikutip di laporan tugas, buka tautannya dan cocokkan isinya.

## Temuan

| Fakta | Sumber |
|---|---|
| *Void* dipakai **sebelum** transaksi hari itu "ditutup" (*batch close/settlement*); setelah tutup, yang dipakai adalah *refund* **(beberapa sumber)** | Toast, "Understand When to Void vs. Refund", https://support.toasttab.com/article/Understand-when-to-void-vs-refund; Gravity Payments, "Void vs. Refund", https://gravitypayments.com/blog/void-vs-refund/; GoCardless, "Credit card void vs refunds", https://gocardless.com/en-us/guides/posts/credit-card-void-vs-refunds/ |
| *Refund* adalah **transaksi baru** yang membalik uang, bukan menghapus transaksi lama **(beberapa sumber)** | Toast (di atas); Dharma Merchant Services, "Void vs. Refund Transaction", https://dharmamerchantservices.com/blog/void-vs-refund-transaction/ |
| Untuk pembeli yang langsung berubah pikiran, sarannya *void*, bukan *refund* **(satu sumber)** | Square Community, "Nonrefundable Fees When Refund is Done Minutes After Charge", https://community.squareup.com/t5/Payments-Troubleshooting/Nonrefundable-Fees-When-Refund-is-Done-Minutes-After-Charge/m-p/839465 |
| Ada sistem *void* yang menghapus transaksi tanpa jejak, sehingga pemilik toko kehilangan catatannya **(satu sumber)** | Clover Community, https://community.clover.com/answers/10518/view.html |

## Apa artinya untuk ApotikKu

Sumber di atas berbicara tentang pembayaran kartu, tetapi pembagiannya sama dengan kasir tunai: koreksi dilakukan **sebelum tutup kasir hari itu**. Sesudah itu, uang sudah dihitung, obat sudah dibawa pulang, dan Laporan hari itu mungkin sudah dicetak.

| Keputusan ApotikKu | Dasar |
|---|---|
| Pembatalan = *void*: hanya Penjualan hari ini (WIB) | Temuan 1: *void* hanya sebelum tutup buku |
| Pembatalan tetap tercatat (status Dibatalkan, siapa, kapan, alasan), tidak dihapus | Temuan 4 menunjukkan bahaya *void* tanpa jejak; aturan bisnis 7 |
| Retur/pengembalian barang hari sebelumnya **tidak** dibuat di versi 1 | Temuan 2: retur adalah transaksi baru (stok masuk + uang keluar). Belum ada masalah nyata di PRD yang membutuhkannya; CONTEXT.md juga menghindari kata "retur" untuk Pembatalan |

## Langkah cek sebelum dikutip

1. Buka setiap tautan di tabel Temuan dari laptop.
2. Cocokkan kalimat "void sebelum batch close / refund sesudahnya" dengan isi halaman.
3. Bila halaman sudah berubah, ganti dengan sumber lain yang menyatakan hal yang sama, lalu perbarui dokumen ini.
