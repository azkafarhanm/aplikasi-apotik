# Penerapan Model SDLC Incremental pada Pembangunan Sistem Informasi Apotek ApotikKu

## 1. Pendahuluan

### 1.1 Latar Belakang

Membangun perangkat lunak membutuhkan urutan kerja yang jelas, mulai dari memahami kebutuhan pengguna sampai aplikasi dipakai dan dirawat. Urutan kerja ini disebut *Software Development Life Cycle* (SDLC). Ada beberapa model SDLC, dan setiap model cocok untuk keadaan project yang berbeda. Memilih model yang tepat membantu tim menyelesaikan project tepat waktu, mengurangi risiko gagal, dan menghasilkan aplikasi yang benar-benar dibutuhkan pengguna.

Dokumen ini membahas pemilihan dan penerapan satu model SDLC, yaitu **model Incremental**, pada studi kasus **ApotikKu**: sistem informasi untuk satu apotek yang terdiri atas Katalog obat publik (bisa dibuka siapa saja dari HP tanpa login) dan Area staf (untuk Kasir dan Admin, wajib login).

ApotikKu adalah pengembangan ulang dari ApotikKu versi 1 yang dibuat dengan HTML dan menyimpan data di browser (localStorage). Versi 1 punya beberapa kelemahan: data hilang bila riwayat browser dihapus dan tidak bisa dibuka dari perangkat lain, hanya satu halaman yang mengecek login, password disimpan apa adanya, dan satu penjualan hanya bisa berisi satu obat. Versi baru dibangun dengan Next.js, Supabase (database PostgreSQL dan login), dan Vercel (hosting).

### 1.2 Tujuan

1. Menjelaskan pengertian SDLC dan model Incremental beserta tahapan, kelebihan, dan kekurangannya.
2. Menjelaskan alasan model Incremental dipilih untuk ApotikKu dibandingkan model lain.
3. Menunjukkan penerapan setiap tahap model Incremental pada pembangunan ApotikKu, lengkap dengan hasil kerja nyata di setiap tahap.

## 2. Landasan Teori

### 2.1 Software Development Life Cycle (SDLC)

SDLC adalah kerangka tahapan yang diikuti untuk membangun perangkat lunak. Walaupun nama tahapannya berbeda di setiap buku, kegiatan intinya sama: komunikasi dan analisis kebutuhan, perencanaan, pemodelan (desain), konstruksi (pembuatan kode dan pengujian), serta penyerahan (*deployment*) dan pemeliharaan [1]. Model SDLC menentukan **bagaimana** kegiatan-kegiatan itu diurutkan: sekali jalan secara berurutan, berulang-ulang, atau bertahap.

### 2.2 Model Incremental

Model Incremental menggabungkan alur linear (berurutan) dan alur paralel. Perangkat lunak tidak diserahkan sekaligus di akhir project, melainkan dalam beberapa **increment** (tahapan hasil). Setiap increment adalah bagian aplikasi yang sudah bisa dipakai, dan setiap increment berikutnya menambah fungsi baru di atas increment sebelumnya [1]. Increment pertama biasanya berisi **produk inti** (*core product*), yaitu kebutuhan paling dasar yang langsung memberi manfaat, sedangkan fitur tambahan dikerjakan di increment selanjutnya [1].

Sommerville menjelaskan bahwa pengembangan incremental mengembangkan versi awal, menunjukkannya kepada pengguna untuk mendapat masukan, lalu mengembangkan versi berikutnya sampai sistem lengkap. Kegiatan spesifikasi, pengembangan, dan validasi saling berkaitan, tidak terpisah kaku seperti pada model Waterfall [2]. Setiap increment menjalani analisis, desain, implementasi, dan pengujiannya sendiri [3]. Model ini juga dipakai dalam pengembangan sistem informasi di Indonesia, misalnya sistem informasi manajemen tugas akhir di Institut Informatika Indonesia, yang dibangun fitur demi fitur dan diuji dengan *black box testing* [4].

### 2.3 Tahapan Model Incremental

| Tahap | Kegiatan | Hasil |
|---|---|---|
| 1. Analisis kebutuhan | Mengumpulkan dan menyusun kebutuhan seluruh sistem | Dokumen kebutuhan |
| 2. Perencanaan | Menentukan teknologi, membagi kebutuhan menjadi beberapa increment, dan mengurutkannya | Rencana increment |
| 3. Desain | Merancang arsitektur, database, dan tampilan yang menampung semua increment | Dokumen desain |
| 4. Implementasi dan pengujian (berulang per increment) | Membuat kode increment ke-n, lalu mengujinya | Increment ke-n yang bisa dipakai |
| 5. Penyerahan dan umpan balik (berulang per increment) | Increment dipasang dan dicoba pengguna; masukan dipakai untuk increment berikutnya | Versi aplikasi yang terus bertambah |

Tahap 1 sampai 3 dilakukan sekali untuk keseluruhan sistem. Tahap 4 dan 5 diulang untuk setiap increment sampai seluruh kebutuhan terpenuhi.

### 2.4 Kelebihan dan Kekurangan

**Kelebihan** [2], [3]:

- Biaya menampung perubahan kebutuhan lebih kecil, karena yang perlu diubah hanya increment yang belum dikerjakan.
- Pengguna lebih mudah memberi masukan, karena mereka mencoba aplikasi yang sudah jalan, bukan hanya membaca dokumen.
- Bagian yang paling penting bisa dipakai lebih cepat, tanpa menunggu seluruh sistem selesai.
- Risiko gagal lebih kecil, karena kesalahan ditemukan lebih awal di setiap increment.

**Kekurangan** [2], [3]:

- Kemajuan project sulit dipantau bila tidak ada dokumentasi di setiap increment.
- Struktur sistem cenderung menurun kualitasnya bila increment baru terus ditambahkan tanpa dirapikan.
- Desain awal harus cukup lentur untuk menampung fitur yang datang belakangan.
- Integrasi bertahap bisa menambah kerumitan.

## 3. Alasan Memilih Model Incremental

| Model | Cara kerja singkat | Kecocokan dengan ApotikKu |
|---|---|---|
| Waterfall | Semua tahap berurutan; aplikasi baru bisa dipakai di akhir | Kurang cocok. Kebutuhan ApotikKu berasal dari studi pustaka dan masih berupa asumsi, jadi perlu dicoba pengguna lebih awal. Kesalahan baru ketahuan di akhir |
| Prototyping | Membuat contoh berulang-ulang sampai pengguna puas | Cocok untuk tampilan saja. Dipakai sebagai **teknik** di tahap desain Katalog, bukan sebagai model keseluruhan, karena aturan keamanan dan stok tidak bisa "dicoba-coba" |
| Spiral | Setiap putaran disertai analisis risiko formal | Terlalu berat untuk project kuliah berskala satu apotek |
| Agile (Scrum) | Sprint, peran Scrum Master/Product Owner, rapat harian | Membutuhkan tim yang bertemu rutin dan peran khusus; tidak sesuai dengan cara kerja project ini |
| **Incremental** | Kebutuhan dan desain disusun di awal, lalu dibangun bertahap | **Dipilih.** Penjelasannya di bawah |

Alasan memilih model Incremental:

1. **Kebutuhan inti sudah jelas, detailnya bisa berkembang.** Masalah dan fitur utama sudah dirumuskan di dokumen kebutuhan (PRD), tetapi sebagian masih asumsi dari studi pustaka. Model Incremental memungkinkan kebutuhan inti dikunci di awal, sementara masukan dari setiap increment dipakai untuk memperbaiki increment berikutnya.
2. **Ada produk inti yang bisa dipakai lebih dulu.** Katalog publik (cek obat, harga, golongan, dan stok) berdiri sendiri dan langsung bermanfaat bagi pembeli. Itulah increment pertama.
3. **Aturan keamanan harus dirancang sejak awal.** Hak akses Admin dan Kasir serta aturan "stok tidak boleh minus" ditegakkan di database. Hal seperti ini harus dirancang menyeluruh di awal (kekuatan model linear), bukan ditambal belakangan.
4. **Setiap increment bisa diuji dan didemokan.** Cocok untuk perkuliahan: kemajuan bisa ditunjukkan kepada dosen di setiap tahap, dan setiap increment punya kriteria selesai yang jelas.
5. **Risiko lebih kecil.** Kalau waktu habis, increment yang sudah selesai tetap bisa dipakai. Ini berbeda dengan Waterfall, yang hasilnya baru terlihat di akhir.

## 4. Penerapan Model Incremental pada ApotikKu

### 4.1 Gambaran Sistem

| Aktor | Kebutuhan utama | Login |
|---|---|---|
| Pengunjung | Mengecek obat, harga, golongan obat, dan ketersediaan stok dari HP | Tidak |
| Kasir | Mencatat Penjualan berisi banyak obat dengan cepat dan mencetak Struk | Ya |
| Admin | Mengelola obat dan harga, melihat Ringkasan stok dan kedaluwarsa, membuat Laporan pendapatan, membatalkan Penjualan | Ya |

### 4.2 Tahap 1: Analisis Kebutuhan

Kebutuhan dikumpulkan lewat **studi pustaka** (jurnal dan artikel tentang apotek di Indonesia) dan pengecekan kelemahan ApotikKu versi 1. Hasilnya adalah dokumen kebutuhan (PRD) yang berisi:

- **7 masalah** (M-01 s/d M-07), misalnya pencatatan stok manual yang rawan salah, antrean kasir yang lama, laporan yang disusun manual, harga yang melebihi Harga Eceran Tertinggi (HET), dan masyarakat yang belum memahami logo golongan obat.
- **14 kebutuhan fungsional** (F-01 s/d F-14), misalnya mencari obat, mencatat Penjualan berisi banyak obat, mencetak Struk, dan membuat laporan per periode.
- **7 kebutuhan non-fungsional** (NF-01 s/d NF-07) dengan ukuran yang bisa diuji, misalnya harga ditemukan dalam ≤ 2 langkah, Penjualan 3 obat selesai ≤ 30 detik, stok tidak pernah minus, dan biaya Rp0 per bulan.
- **Tabel ketertelusuran** yang menghubungkan setiap masalah ke kebutuhan, fitur, dan cara mengujinya.
- **Glosarium istilah**, supaya semua pihak memakai istilah yang sama (misalnya "Penjualan", bukan "transaksi").

### 4.3 Tahap 2: Perencanaan

Pada tahap ini ditentukan teknologi dan pembagian increment. Setiap keputusan penting dicatat dalam *Architecture Decision Record* (ADR), beserta pilihan lain yang ditolak dan alasannya:

| Keputusan | Alasan utama |
|---|---|
| Next.js + Supabase + Vercel, semua paket gratis | Data tersimpan online dan sama di semua perangkat; login dan hash password ditangani layanan khusus; biaya Rp0 |
| Katalog publik + Area staf untuk satu apotek | Menjawab masalah pembeli (cek harga dari rumah) dan masalah internal apotek sekaligus |
| Peran Admin dan Kasir dengan aturan hak akses di database (*Row Level Security*) sejak awal | Kasir tidak bisa mengubah harga atau membatalkan Penjualan, walaupun mencoba melewati tampilan |
| Tampilan bergaya "etiket apotek" | Logo golongan obat tampil di setiap kartu sebagai sarana edukasi |

Seluruh kebutuhan kemudian dipecah menjadi **13 tugas kerja** di papan tugas project dan dikelompokkan menjadi empat increment (lihat 4.5).

### 4.4 Tahap 3: Desain

Desain dibuat sekali untuk seluruh sistem, supaya semua increment berdiri di atas fondasi yang sama:

- **Prototipe tampilan Katalog.** Tiga variasi tata letak yang strukturnya berbeda dibuat dan dinilai: tumpukan kartu etiket, laci per keluhan, dan papan daftar harga. Hasil penilaian: kartu etiket ditambah laci Keluhan. Penilaian ini juga menemukan perbaikan: satuan jual ditulis lengkap ("per strip · 10 tablet") karena istilah "strip" belum tentu dipahami semua orang. Di sini prototyping dipakai sebagai teknik di dalam tahap desain.
- **Spesifikasi teknis (SPEC)** berisi 73 *user story*, 12 alamat halaman, skema database (tabel obat, Penjualan, item Penjualan, dan profil Staf), lima fungsi database (misalnya pencatat Penjualan yang mengunci stok supaya tidak minus walau dua Kasir menjual bersamaan), tabel hak akses per peran, dan rencana pengujian.

### 4.5 Pembagian Increment

| Increment | Isi | Hasil yang bisa dipakai | Pengguna yang terbantu |
|---|---|---|---|
| **1. Produk inti: Katalog publik** | Katalog dari database, cari nama dan laci Keluhan, detail obat + WhatsApp, data awal ±40 obat bersumber resmi | Pembeli bisa mengecek obat, harga, golongan, dan stok dari HP | Pengunjung |
| **2. Penjualan di kasir** | Login dan logout Staf, mencatat Penjualan, Struk 58 mm dan Penjualan hari ini | Kasir melayani Penjualan berisi banyak obat; stok berkurang otomatis | Kasir |
| **3. Pengelolaan oleh Admin** | Kelola obat + peringatan HET, Ringkasan, Laporan pendapatan, Pembatalan Penjualan | Admin mengelola data, tahu stok yang hampir habis dan obat mendekati kedaluwarsa, serta mendapat laporan otomatis | Admin |
| **4. Uji pengguna dan rilis** | Uji manual kemudahan pakai dan rilis Versi 1 | Bukti target kemudahan pakai tercapai; Versi 1 siap didemokan | Semua |

Urutan ini mengikuti ketergantungan antar-fitur. Contohnya, Penjualan membutuhkan login Staf, dan Laporan membutuhkan data Penjualan. Setiap tugas mencantumkan tugas mana yang harus selesai lebih dulu.

### 4.6 Tahap 4: Implementasi dan Pengujian per Increment

Setiap tugas dikerjakan terpisah dan baru digabung ke versi utama setelah diperiksa. Setiap increment diuji dengan dua cara:

- **Pengujian otomatis di database**, dijalankan otomatis setiap ada perubahan kode. Contoh yang diuji: Pengunjung tidak bisa mengubah data apa pun; Kasir tidak bisa melihat laporan; Penjualan tersimpan utuh atau tidak sama sekali; dua Kasir yang menjual obat terakhir bersamaan tidak membuat stok minus; dan total laporan sama dengan hitungan manual.
- **Pengujian manual** untuk kebutuhan kemudahan pakai, diukur dengan stopwatch: harga ditemukan dalam ≤ 2 langkah dan Penjualan 3 obat selesai ≤ 30 detik.

Tes otomatis dari increment sebelumnya tetap dijalankan di increment berikutnya. Dengan begitu, fitur baru yang merusak fitur lama langsung ketahuan.

### 4.7 Tahap 5: Penyerahan dan Umpan Balik

Setiap increment yang lulus pengujian langsung dipasang di Vercel dan bisa dibuka dari alamat web yang sama. Masukan dari percobaan pengguna dipakai untuk memperbaiki increment berikutnya. Kebutuhan yang belum masuk Versi 1 sudah dicatat untuk increment lanjutan (milestone 2): stok masuk dari supplier, tanggal kedaluwarsa per batch, impor data dari Excel, catatan perubahan harga, dan pengelolaan akun Staf dari aplikasi.

### 4.8 Posisi Pengerjaan Saat Ini

Per 8 Oktober 2026, tahap analisis kebutuhan, perencanaan, dan desain sudah selesai dan terdokumentasi. Tugas kerja untuk keempat increment sudah disusun. Tahap implementasi dimulai dari increment 1 (Katalog publik).

## 5. Kesimpulan

Model Incremental dipilih untuk ApotikKu karena kebutuhan intinya sudah bisa dirumuskan di awal, tetapi sebagian masih berupa asumsi yang perlu dibuktikan lewat aplikasi yang bisa dicoba. Kebutuhan, perencanaan, dan desain disusun menyeluruh di awal, sehingga aturan penting seperti hak akses dan stok yang tidak boleh minus dirancang sejak awal, bukan ditambal belakangan. Pembangunannya dibagi menjadi empat increment yang masing-masing bisa dipakai dan diuji: Katalog publik sebagai produk inti, Penjualan di kasir, pengelolaan oleh Admin, serta uji pengguna dan rilis. Prototyping tetap dimanfaatkan sebagai teknik di tahap desain tampilan. Dengan pendekatan ini, manfaat paling penting bisa dirasakan lebih cepat, kesalahan ditemukan lebih awal, dan kemajuan project bisa ditunjukkan di setiap tahap.

## Daftar Pustaka

1. R. S. Pressman dan B. R. Maxim, *Software Engineering: A Practitioner's Approach*, edisi ke-8. New York: McGraw-Hill Education, 2015.
2. I. Sommerville, *Software Engineering*, edisi ke-10. Boston: Pearson, 2016.
3. BINUS University Bekasi, "Incremental Model dalam Rekayasa Perangkat Lunak," 2025. [Daring]. Tersedia: https://binus.ac.id/bekasi/2025/07/incremental-model-dalam-rekayasa-perangkat-lunak/
4. R. Sutjiadi dkk., "Perancangan Sistem Informasi Manajemen Tugas Akhir pada Institut Informatika Indonesia Menggunakan Metode Incremental," *TELSINAS*, vol. 5, no. 2, Nov. 2022, doi: 10.38043/telsinas.v5i2.4334.
