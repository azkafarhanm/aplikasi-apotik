# Riset: data awal 38 obat generik (tiket #7)

> Dokumen ini mencatat **dari mana** setiap harga acuan dan golongan di [`supabase/data/data-awal.sql`](../../supabase/data/data-awal.sql) berasal, supaya bisa dicek ulang siapa pun. Validasi lewat studi pustaka (CLAUDE.md), bukan wawancara.
> Istilah domain mengikuti [`CONTEXT.md`](../../CONTEXT.md). Penjelasan untuk orang awam ada di [`penjelasan/03-data-awal.md`](../penjelasan/03-data-awal.md).

| | |
|---|---|
| Tanggal riset | 14 Oktober 2026 |
| Sumber harga acuan | Keputusan Menteri Kesehatan No. 092/MENKES/SK/II/2012 tentang Harga Eceran Tertinggi Obat Generik Tahun 2012 |
| Sumber golongan | Basis data izin edar BPOM, cekbpom.pom.go.id (kategori Obat) |
| Keputusan yang dipakai | Disetujui pengguna 14 Oktober 2026 (ronde pertanyaan tiket #7, 10 butir) |

## 1. Sumber harga acuan: KMK 092/2012

- **Dokumen**: KMK No. 092/MENKES/SK/II/2012, ditetapkan di Jakarta 23 Februari 2012. Lampirannya memuat 498 baris obat, masing-masing dengan nama obat, kemasan, dan "HET + PPN".
- **Diunduh dari** situs resmi Direktorat Jenderal Farmasi dan Alat Kesehatan Kemenkes: https://farmalkes.kemkes.go.id/unduh/kepmenkes-092-2012/ (PDF 29 halaman, 725.568 byte, SHA-256 `62607d7ad65e73eb0a2d89989d58876b849d23580c774e2513f1f076b090f7af`). Salinan lain yang dirujuk PRD sumber [9]: situs RSHS.
  > **SHA-256** = "sidik jari" sebuah file. Kalau isinya berubah satu huruf saja, sidik jarinya ikut berubah. *Analogi:* nomor seri uang kertas; dengan nomor itu, orang lain bisa memastikan file yang ia unduh sama persis dengan yang kami baca.
- **Isi penting** (diktum KESATU, KELIMA): HET adalah harga jual tertinggi obat generik di apotek, rumah sakit, dan fasilitas kesehatan lain di seluruh Indonesia. Apotek hanya boleh menjual paling mahal sama dengan HET.
- **Sumber ini sudah lama (harga tahun 2012).** Kami belum menemukan keputusan HET obat generik umum yang lebih baru. Pencarian di regulasi Kemenkes hanya menemukan Kepmenkes HK.01.07/MENKES/4826/2021, yang khusus untuk obat masa pandemi COVID-19, dan Permenkes 98/2015, yang mengatur pencantuman HET di label (bukan daftar harga). Risiko ini sudah tercatat di PRD bagian 11 ("Data HET yang tersedia publik bisa jadi bukan versi terbaru"): Admin tetap bisa mengubah harga jual (F-10).

### Cara menghitung harga acuan per Satuan jual

HET di KMK berlaku **per kemasan pabrik**. Contoh: "Parasetamol tablet 500 mg, ktk 10 x 10 tablet, Rp14.175" berarti satu kotak berisi 10 strip. Satuan jual ApotikKu adalah strip, jadi:

```
harga acuan per Satuan jual = HET kemasan ÷ jumlah Satuan jual di kemasan, dibulatkan ke bawah ke rupiah
Parasetamol 500 mg          = 14.175 ÷ 10 = 1.417,5 → Rp1.417
```

- **Dibulatkan ke bawah** supaya harga acuan tidak pernah melewati HET. Pembulatan ke atas (Rp1.418) akan melanggar KMK diktum KELIMA dan langsung memicu peringatan F-13.
- **Tidak dibulatkan ke ratusan** (Rp1.400), karena angka acuan harus sesuai sumber. Admin boleh membulatkan harga jual nanti (tiket #9).
- **Harga jual awal = harga acuan** (PRD aturan bisnis 5).
- Kemasan berupa botol, tube, atau bungkus kecil (paling banyak 100 butir) dijual utuh, jadi harga acuannya sama dengan HET kemasan.

## 2. Sumber golongan: nomor izin edar BPOM

Setiap obat yang beredar di Indonesia punya **nomor izin edar** (NIE) dari BPOM. Tiga huruf pertamanya punya arti tetap:

| Huruf | Arti | Contoh |
|---|---|---|
| ke-1 | **G** = nama generik, **D** = nama dagang (merek) | **G**BL2144402910A1 |
| ke-2 | **B** = obat bebas, **T** = obat bebas terbatas, **K** = obat keras | G**B**L… = bebas |
| ke-3 | **L** = produksi dalam negeri, **I** = impor | GB**L**… = lokal |

> *Analogi:* huruf depan plat nomor kendaraan; dari "B" kita tahu asalnya Jakarta tanpa perlu menelepon Samsat.

Cara kerja:
1. Mencari nama zat aktif di cekbpom (kategori Obat), misalnya "PARACETAMOL".
2. Mengambil hanya nomor **generik (G…) yang statusnya Berlaku**, dengan Bentuk dan kekuatan yang sama dengan obat kita. Bila kekuatannya tidak ditulis di data BPOM, nomor itu tetap dihitung bila bentuknya sama.
3. Membaca huruf ke-2 setiap nomor, lalu menghitung jumlahnya. Satu nomor yang muncul berkali-kali (beberapa ukuran kemasan) dihitung sekali.
4. **Bila semuanya sama**, itulah golongannya. **Bila berbeda-beda, dipakai yang terbanyak** dan jumlahnya dicatat di tabel. Obat yang hasilnya hampir seimbang tidak dimasukkan (lihat bagian 4).

Data diambil 14 Oktober 2026. Status izin edar bisa berubah; cara mengecek ulang sendiri ada di bagian 6.

## 3. Daftar 38 obat

Kolom "Izin edar generik berlaku" menunjukkan jumlah nomor per huruf golongan (B/T/K). Contoh: "K8 · T40" berarti 8 nomor GKL dan 40 nomor GTL, sehingga dipakai bebas terbatas. "Contoh nomor" bisa langsung diketik di kotak pencarian cekbpom.

### Demam & Nyeri

| Obat | KMK no.: tertulis, kemasan | HET kemasan (Rp) | Satuan jual | Harga acuan (Rp) | Golongan | Izin edar generik berlaku | Contoh nomor |
|---|---|--:|---|--:|---|---|---|
| Parasetamol 500 mg | 357: Parasetamol tablet 500 mg, ktk 10 x 10 tablet | 14.175 | strip · 10 tablet | 14.175 ÷ 10 = 1.417,5 → **1.417** | Bebas | B48 | `GBL2144402910A1` |
| Parasetamol Sirup 120 mg/5 ml | 355: Parasetamol sirup 120 mg / 5 ml, btl 60 ml | 3.105 | botol · 60 ml | **3.105** | Bebas | B24 | `GBL9717101237A1` |
| Parasetamol Tetes | 354: Parasetamol drops, btl 15 ml | 7.128 | botol · 15 ml | **7.128** | Bebas | B5 | `GBL2605069636B1` |
| Ibuprofen 400 mg | 200: Ibuprofen tablet 400 mg, ktk 10 x 10 tablet | 27.680 | strip · 10 tablet | 27.680 ÷ 10 = 2.768 → **2.768** | Keras | K12 | `GKL2433558317B1` |
| Ibuprofen Suspensi 100 mg/5 ml | 197: Ibuprofen suspensi 100 mg/5 ml, btl 60 ml | 4.725 | botol · 60 ml | **4.725** | Bebas terbatas | T5 | `GTL2458400533A1` |
| Asam Mefenamat 500 mg | 53: Asam Mefenamat kaplet 500 mg, ktk 10 x 10 kaplet | 23.760 | strip · 10 kaplet | 23.760 ÷ 10 = 2.376 → **2.376** | Keras | K37 | `GKL2231411809A1` |
| Natrium Diklofenak 50 mg | 322: Natrium Diklofenak tablet 50 mg, ktk 5 x 10 tablet | 14.693 | strip · 10 tablet | 14.693 ÷ 5 = 2.938,6 → **2.938** | Keras | K17 | `GKL0533514915A1` |
| Metampiron 500 mg | 297: Metampiron tablet 500 mg, ktk 10 x 10 tablet | 20.115 | strip · 10 tablet | 20.115 ÷ 10 = 2.011,5 → **2.011** | Keras | K23 | `GKL7815206104A2` |

### Batuk & Flu

| Obat | KMK no.: tertulis, kemasan | HET kemasan (Rp) | Satuan jual | Harga acuan (Rp) | Golongan | Izin edar generik berlaku | Contoh nomor |
|---|---|--:|---|--:|---|---|---|
| Obat Batuk Hitam (OBH) | 335: Obat Batuk Hitam ( O.B.H. ) cairan, btl 100 ml | 1.931 | botol · 100 ml | **1.931** | Bebas | B4 | `GBL7216706537A1` |
| Bromheksin 8 mg | 80: Bromheksin tablet 8 mg, ktk 10 x 10 tablet | 5.200 | strip · 10 tablet | 5.200 ÷ 10 = 520 → **520** | Bebas terbatas | T2 | `GTL2533220110A1` |
| Ambroksol 30 mg | 11: Ambroxol tablet 30 mg, ktk 10 x 10 tablet | 16.884 | strip · 10 tablet | 16.884 ÷ 10 = 1.688,4 → **1.688** | Keras | K25 | `GKL2640102210A1` |
| Ambroksol Sirup 15 mg/5 ml | 10: Ambroxol sirup 15 mg/ml (tertulis demikian di KMK), btl 60 ml | 4.455 | botol · 60 ml | **4.455** | Keras | K17 | `GKL2658405437A1` |

### Maag & Pencernaan

| Obat | KMK no.: tertulis, kemasan | HET kemasan (Rp) | Satuan jual | Harga acuan (Rp) | Golongan | Izin edar generik berlaku | Contoh nomor |
|---|---|--:|---|--:|---|---|---|
| Antasida DOEN Tablet Kunyah | 34: Antasida DOEN I tablet kunyah, ktk 10 x 10 tablet kunyah | 21.870 | strip · 10 tablet | 21.870 ÷ 10 = 2.187 → **2.187** | Bebas | B29 | `GBL0403604263A2` |
| Antasida DOEN Suspensi | 35: Antasida DOEN II suspensi, btl 60 ml | 5.198 | botol · 60 ml | **5.198** | Bebas | B12 | `GBL1733314033A1` |
| Oralit | 157: Garam Oralit I serbuk, ktk 25 bungkus | 13.535 | sachet · untuk 200 ml air | 13.535 ÷ 25 = 541,4 → **541** | Bebas | B4 | `GBL2536707323A1` |
| Zinc 20 mg | 498: Zinc tablet 20 mg, ktk 10 x 10 tablet | 64.125 | strip · 10 tablet | 64.125 ÷ 10 = 6.412,5 → **6.412** | Bebas terbatas | T19 | `GTL2639205781A1` |
| Pirantel Pamoat Sirup 125 mg/5 ml | 372: Pirantel sirup 125 mg/5 ml, btl 60 ml | 4.725 | botol · 60 ml | **4.725** | Bebas terbatas | T1 | `GTL9917106433A1` |
| Omeprazol 20 mg | 350: Omeprazol kapsul 20 mg, ktk 3 x 10 kapsul | 16.538 | strip · 10 kapsul | 16.538 ÷ 3 = 5.512,67 → **5.512** | Keras | K15 | `GKL2631118603A1` |
| Simetidin 200 mg | 450: Simetidin tablet 200 mg, ktk 10 x 10 tablet | 15.512 | strip · 10 tablet | 15.512 ÷ 10 = 1.551,2 → **1.551** | Keras | K10 | `GKL0434003910A1` |
| Domperidon 10 mg | 116: Domperidon tablet 10 mg, ktk 10 x 10 tablet | 54.489 | strip · 10 tablet | 54.489 ÷ 10 = 5.448,9 → **5.448** | Keras | K29 | `GKL0508512210A1` |
| Loperamid 2 mg | 282: Loperamid tablet 2 mg, ktk 10 x 10 tablet | 12.359 | strip · 10 tablet | 12.359 ÷ 10 = 1.235,9 → **1.235** | Keras | K11 | `GKL2640102517A1` |
| Albendazol 400 mg | 4: Albendazol tablet 400 mg, ktk 5 x 6 tablet | 16.470 | strip · 6 tablet | 16.470 ÷ 5 = 3.294 → **3.294** | Keras | K5 | `GKL2425908263A1` |

### Alergi

| Obat | KMK no.: tertulis, kemasan | HET kemasan (Rp) | Satuan jual | Harga acuan (Rp) | Golongan | Izin edar generik berlaku | Contoh nomor |
|---|---|--:|---|--:|---|---|---|
| Setirizin 10 mg | 82: Cetirizine tablet 10 mg, ktk 3 x 10 tablet | 13.365 | strip · 10 tablet | 13.365 ÷ 3 = 4.455 → **4.455** | Bebas terbatas | K8 · T40 | `GTL0408511617A1` |
| Setirizin Sirup 5 mg/5 ml | 81: Cetirizin sirup 5 mg/5 ml, btl 60 ml | 14.108 | botol · 60 ml | **14.108** | Bebas terbatas | K4 · T18 | `GTL2658404337A1` |
| Loratadin 10 mg | 283: Loratadin tablet 10 mg, ktk 5 x 10 tablet | 22.483 | strip · 10 tablet | 22.483 ÷ 5 = 4.496,6 → **4.496** | Bebas terbatas | K5 · T13 | `GTL0408510510A1` |
| Deksametason 0,5 mg | 90: Deksametason tablet 0,5 mg, ktk 10 x 10 tablet | 11.745 | strip · 10 tablet | 11.745 ÷ 10 = 1.174,5 → **1.174** | Keras | K34 | `GKL1944400910A1` |
| Hidrokortison Krim 1% | 193: Hidrokortison krim 1%, tube 5 gram | 3.105 | tube · 5 g | **3.105** | Keras | K17 | `GKL7211642829A1` |

### Luka & Kulit

| Obat | KMK no.: tertulis, kemasan | HET kemasan (Rp) | Satuan jual | Harga acuan (Rp) | Golongan | Izin edar generik berlaku | Contoh nomor |
|---|---|--:|---|--:|---|---|---|
| Mikonazol Krim 2% | 316: Mikonazol krim/salep 2 % (Nitrat), tube 10 gram | 4.050 | tube · 10 g | **4.050** | Bebas terbatas | T11 | `GTL2628920129A1` |
| Ketokonazol Krim 2% | 219: Ketokonazol krim 2%, tube 15 gram | 9.450 | tube · 15 g | **9.450** | Bebas terbatas | T15 | `GTL2232303029A1` |
| Gentamisin Salep Kulit 0,1% | 166: Gentamisin salep kulit 0.1%, tube 5 gram | 2.498 | tube · 5 g | **2.498** | Keras | K7 | `GKL1007119730A1` |
| Oksitetrasiklin Salep Kulit 3% | 346: Oksitetrasiklin salep kulit 3%, tube 5 gram | 2.261 | tube · 5 g | **2.261** | Keras | K1 | `GKL9832300830A1` |
| Asiklovir Krim 5% | 55: Asiklovir krim 5%, tube 5 gram | 4.253 | tube · 5 g | **4.253** | Keras | K1 | `GKL1500915729A1` |
| Betametason Krim 0,1% | 76: Betametason krim 0,1 % (sebagai Valerat), tube 5 gram | 2.735 | tube · 5 g | **2.735** | Keras | K12 | `GKL2132302729A1` |
| Hidrokortison Krim 2,5% | 194: Hidrokortison krim 2,5 %, tube 5 gram | 4.050 | tube · 5 g | **4.050** | Keras | K17 | `GKL7211642829B1` |

### Vitamin

| Obat | KMK no.: tertulis, kemasan | HET kemasan (Rp) | Satuan jual | Harga acuan (Rp) | Golongan | Izin edar generik berlaku | Contoh nomor |
|---|---|--:|---|--:|---|---|---|
| Asam Folat 1 mg | 50: Asam Folat tablet 1 mg, btl 100 tablet | 9.180 | botol · 100 tablet | **9.180** | Bebas | B5 | `GBL8919909210A1` |
| Tablet Tambah Darah | 74: Besi (II) Sulfat 200 mg + Asam Folat 0,25 mg tablet (tablet tambah darah kombinasi), 1 bungkus @ 30 tablet | 2.700 | sachet · 30 tablet | **2.700** | Bebas | B20 | `GBL2039204617A1` |
| Vitamin A 100.000 IU | 406: Retinol (Vitamin A) 100.000 IU kapsul lunak, btl 50 kapsul lunak | 19.305 | botol · 50 kapsul | **19.305** | Bebas | B2 | `GBL2040312402A1` |
| Vitamin A 200.000 IU | 407: Retinol (Vitamin A) 200.000 IU kapsul lunak, btl 50 kapsul lunak | 31.185 | botol · 50 kapsul | **31.185** | Bebas | B2 | `GBL2040312402B1` |

Ringkasan: 38 obat; 11 bebas, 9 bebas terbatas, 18 keras. Setiap Keluhan punya minimal 4 obat, dan Obat keras ada di 5 dari 6 Keluhan (semua kecuali Vitamin). Semua obat punya HET, jadi tidak ada harga acuan yang kosong.

Catatan per obat:
- **Ambroksol tercatat obat keras** di semua nomor generiknya, walaupun di masyarakat sering dianggap obat batuk biasa.
- **Ambroksol sirup**: KMK menulis "15 mg/ml", padahal nomor izin edar generiknya berkekuatan 15 mg per 5 ml. Nama di ApotikKu memakai "15 mg/5 ml"; tulisan KMK disalin apa adanya di komentar SQL.
- **Hidrokortison krim**: jumlah K17 mencakup kekuatan 1% dan 2,5% sekaligus, karena data BPOM sering tidak menulis kekuatannya. Semuanya GKL, dan contoh nomornya dipilih per kekuatan.
- **Parasetamol tetes**: KMK tidak menyebut kekuatannya ("Parasetamol drops, btl 15 ml"), jadi namanya tidak memuat kekuatan.
- **Albendazol**: KMK menulis "tablet", sedangkan nomor generik yang berlaku berbentuk tablet kunyah. Bentuk di ApotikKu mengikuti BPOM.
- **Zinc 20 mg** dimasukkan ke Maag & Pencernaan, bukan Vitamin, karena kegunaannya mendampingi oralit saat diare.

### Bentuk

Skema hanya mengenal 9 Bentuk (SPEC 4.3), jadi bentuk di KMK/BPOM dipetakan begini: suspensi dan "OBH cairan" → **sirup**; kaplet → **tablet**; drops → **tetes**; tablet dispersible → **tablet**. Nama obat tetap menulis "Suspensi" bila memang suspensi.

### Stok dan tanggal kedaluwarsa

Stok dan tanggal kedaluwarsa **dikarang untuk demo**, bukan dari sumber. Keduanya dibuat beragam supaya semua keadaan muncul (SPEC 4.11). Tanggal ditulis **relatif terhadap hari pemasangan** (misalnya `hari ini + 45 hari`), sehingga keadaan ini tetap benar setiap kali data dipasang ulang:

| Keadaan | Jumlah | Obat |
|---|--:|---|
| Habis karena stok 0 | 3 | Loperamid 2 mg, Mikonazol Krim 2%, Vitamin A 100.000 IU |
| Sudah kedaluwarsa (tampil Habis) | 2 | Bromheksin 8 mg (10 hari lalu), Antasida DOEN Suspensi (30 hari lalu) |
| Segera kedaluwarsa (≤ 90 hari) | 4 | Parasetamol Sirup (20 hari), Omeprazol (45), Setirizin Sirup (75), Gentamisin Salep (88) |
| Hampir habis (stok 1–20) | 6 | Ambroksol Sirup (5), Asiklovir Krim (3), Loratadin (8), Ibuprofen 400 mg (12), Zinc (18), Asam Folat (20) |
| Tersedia | 27 | sisanya, stok 22–200 |

## 4. Yang sengaja tidak dimasukkan

| Obat | Alasan | Sumber |
|---|---|---|
| Dekstrometorfan tunggal (tablet dan sirup) | Izin edar sediaan tunggalnya **dibatalkan BPOM** pada 2013 karena disalahgunakan (efek halusinasi), dengan batas penarikan 30 Juni 2014. Di cekbpom tidak ada lagi nomor generik dekstrometorfan tunggal. Obat ini ada di data contoh lama, sehingga sekarang ikut terhapus | [BPOM: Pembatalan izin edar](https://www.pom.go.id/berita/pembatalan-izin-edar-obat-yang-mengandung-dekstrometorfan-sediaan-tunggal), [siaran pers BPOM](https://www.pom.go.id/siaran-pers/penjelasan-terkait-produk-obat-batuk-yang-beredar-dan-mengandung-bahan-dekstrometorfan-tunggal) |
| Vitamin C, Vitamin B kompleks, B1, B6, B12 tablet | Di cekbpom, tablet vitamin ini sekarang terdaftar sebagai **suplemen kesehatan** (nomor diawali SD/SI), bukan obat, sehingga tidak punya golongan obat. Memberinya lingkaran hijau "obat bebas" berarti mengajari Pengunjung hal yang salah (masalah M-06) | cekbpom kategori Suplemen Kesehatan, pencarian "VITAMIN C" dan "VITAMIN B KOMPLEKS" |
| CTM (Klorfeniramin Maleat) 4 mg | Hasil hampir seimbang: 9 nomor GTL dan 8 nomor GKL, sehingga golongannya tidak bisa dipastikan. Lagi pula di KMK hanya ada dalam botol 1000 tablet | cekbpom "CHLORPHENAMINE"; KMK no. 243 |
| Gliseril Guaiakolat 100 mg | Di KMK hanya ada dalam botol 1000 tablet (no. 181). Menjualnya per 10 butir berarti mengemas ulang, dan itu butuh Satuan jual baru ("klip") | KMK no. 181 |
| Povidon Iodida 10% | Di cekbpom tidak ditemukan nomor izin edar **generik** yang bisa dicek golongannya | cekbpom "POVIDONE-IODINE" |
| Asiklovir tablet | Tidak ada nomor generik tablet yang berlaku; yang ada hanya krim | cekbpom "ACYCLOVIR" |
| Obat lain di KMK dengan botol 250–1000 butir | Sama dengan Gliseril Guaiakolat: perlu dikemas ulang | KMK |

## 5. Keterbatasan

- **Harga tahun 2012.** HET di lapangan bisa sudah berbeda. Harga jual bisa disesuaikan Admin (F-10).
- **Golongan dari data izin edar, bukan dari daftar golongan resmi per zat aktif.** Kami memakai nomor izin edar karena itulah yang tercetak di kemasan dan bisa dicek siapa pun, tetapi pabrik yang berbeda kadang mendapat golongan berbeda untuk zat yang sama (contoh: setirizin). Di apotek sungguhan, golongan yang benar adalah golongan **produk yang ada di rak**.
- **Kegunaan ditulis sendiri**, singkat dan tanpa dosis (PRD aturan bisnis 8). Kegunaan bukan saran pengobatan; Katalog selalu menampilkan catatan "Informasi ini bersifat umum. Tanyakan apoteker sebelum memakai obat."

## 6. Cara mengecek ulang dari HP

1. Buka **cekbpom.pom.go.id** → menu Produk → **Obat**.
2. Ketik contoh nomor dari tabel (misalnya `GKL2640102210A1`) di kotak "Nomor Registrasi", lalu Cari.
3. Lihat huruf kedua nomornya (K = keras) dan statusnya (Berlaku).
4. Untuk harga: buka tautan KMK di bagian 1, lalu cari nomor baris di kolom "KMK no." pada lampiran (halaman 4–29).
