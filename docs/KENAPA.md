# KENAPA: ringkasan alasan setiap keputusan

> Dokumen ini menjawab satu pertanyaan: **"kenapa begini, bukan begitu?"**
> Setiap baris di bawah adalah ringkasan. Penjelasan lengkap, pilihan yang ditolak, dan jawaban untuk pertanyaan lanjutan ada di ADR yang ditautkan.
> **ADR (Architecture Decision Record)** = catatan satu keputusan penting. *Analogi:* notulen rapat. Setahun kemudian, siapa pun bisa membaca kenapa keputusan itu diambil.

## Prinsip yang dipakai untuk memutuskan

**"Bukan kita yang butuh teknologi, tapi teknologi yang butuh kita."**
Setiap fitur dan teknologi harus menyelesaikan masalah yang tercatat di [`PRD.md`](PRD.md) (M-01 s/d M-07). Kalau tidak bisa ditelusuri ke sebuah masalah, tidak dibuat, sekeren apa pun.

## Keputusan utama

| No | Keputusan | Masalah yang diselesaikan | Pilihan lain yang ditolak (alasan singkat) | Detail |
|---|---|---|---|---|
| 1 | **Next.js + Supabase + Vercel**, semua paket gratis | Data versi 1 hanya di browser, login bisa dilewati, password tidak teracak | PHP+MySQL (login & hak akses harus dibuat sendiri), Firebase (NoSQL, laporan sulit), backend sendiri (terlalu banyak yang dirawat) | [ADR 0001](adr/0001-nextjs-supabase-vercel.md) |
| 1a | Akses database lewat **supabase-js**, bukan Drizzle/Prisma | Aturan hak akses harus tetap berlaku walau kode kita ada bug | Drizzle/Prisma masuk dengan hak penuh dan melewati RLS | [ADR 0001](adr/0001-nextjs-supabase-vercel.md) |
| 1b | Struktur database ditulis sebagai **migrasi SQL** | Database di setiap laptop dan server harus sama bentuknya | Mengubah tabel lewat klik di dasbor (tidak tercatat, tidak bisa diulang) | [ADR 0001](adr/0001-nextjs-supabase-vercel.md) |
| 2 | **Katalog publik + Area staf** untuk satu apotek | Pembeli harus datang dulu untuk tahu harga (M-07); orang belum paham golongan obat (M-06) | Hanya area staf (tidak menjawab M-06/M-07), toko online (aturan obat online, fitur berlebihan), banyak apotek (kompleks tanpa masalah nyata) | [ADR 0002](adr/0002-katalog-publik-dan-area-staf.md) |
| 2a | Katalog hanya menampilkan **Status stok**, bukan angka | Pengunjung cukup tahu datang atau tidak | Angka persis (data internal, cepat basi) | [ADR 0002](adr/0002-katalog-publik-dan-area-staf.md) |
| 3 | **Peran Admin & Kasir** | Kasir tidak boleh mengubah harga atau membatalkan Penjualan sendiri | Satu peran (celah kecurangan), banyak peran (tidak ada kebutuhannya) | [ADR 0003](adr/0003-peran-admin-kasir-rls.md) |
| 3a | Hak akses ditegakkan dengan **RLS sejak migrasi pertama** | Kunci Supabase di browser bersifat publik; menyembunyikan tombol bukan pengamanan | Cek di tampilan saja (bisa dilewati), RLS belakangan (seperti pasang fondasi setelah rumah jadi) | [ADR 0003](adr/0003-peran-admin-kasir-rls.md) |
| 3b | Penjualan lewat **satu fungsi database dalam satu transaksi** | Stok tidak boleh minus; Penjualan harus utuh; harga tidak boleh diubah dari layar kasir | Beberapa perintah terpisah dari browser (bisa setengah tersimpan, bisa minus) | [ADR 0003](adr/0003-peran-admin-kasir-rls.md) |
| 3b-1 | Stok dijaga dengan **mengunci baris obat** (urut id) di dalam `catat_penjualan` | Dua Kasir menjual obat terakhir bersamaan tidak boleh membuat stok −1 (M-01) | Cek stok di layar (bisa dilewati, dua layar sama-sama melihat "stok 1"); kurangi-bila-cukup tanpa kunci (pesan "tinggal 3 strip" tidak akurat); SERIALIZABLE (layar harus mencoba ulang sendiri) | [ADR 0005](adr/0005-kunci-baris-obat-saat-penjualan.md) |
| 3c | **Tanpa pendaftaran akun umum** | Mencegah orang asing mencoba masuk | Pendaftaran terbuka + persetujuan Admin (mengundang spam) | [ADR 0003](adr/0003-peran-admin-kasir-rls.md) |
| 4 | Visual **"etiket apotek"**, tanpa foto, tanpa mode gelap | Orang belum mengenali logo golongan obat (M-06); tampilan versi 1 generik | Bootstrap/template (tanpa identitas), gaya "template AI", foto produk (hak cipta, berat), mode gelap (biaya uji dua kali tanpa masalah nyata) | [ADR 0004](adr/0004-visual-etiket-apotek.md) |
| 4a | Tata letak Katalog: **kartu etiket + laci Keluhan** (hasil prototipe) | Pengunjung ada yang tahu nama obat, ada yang hanya tahu keluhannya; harga harus ketemu ≤ 2 langkah | Laci keluhan saja (satu langkah lebih banyak), papan daftar harga (terasa seperti tabel) | [ADR 0004](adr/0004-visual-etiket-apotek.md) |

## Keputusan teknis di SPEC

Keputusan yang lebih kecil, dicatat lengkap beserta jawaban untuk dosen di [`SPEC.md`](SPEC.md).

| Keputusan | Alasan singkat | Ditolak | Detail |
|---|---|---|---|
| Uang disimpan sebagai bilangan bulat rupiah | Rupiah tanpa sen; angka desimal komputer bisa meleset | Angka desimal | SPEC 4.3 |
| Status stok dihitung satu fungsi database | Aturan tidak mungkin berbeda di Katalog, kasir, dan Ringkasan | Menghitung di tiap halaman | SPEC 4.3 |
| Pengunjung hanya membaca tampilan `katalog` | Status stok terlihat, angka stok dan harga acuan tidak | Memberi Pengunjung akses ke tabel `obat` | SPEC 4.3 |
| "Hari ini" selalu WIB | Penjualan 23.30 tidak boleh terhitung hari berikutnya | Waktu server (UTC) | SPEC 4.3 |
| Kasir hanya melihat Penjualan miliknya hari ini | Daftar semua Penjualan = laporan pendapatan, wewenang Admin | Kasir melihat semua Penjualan | SPEC 4.5 |
| Detail obat punya alamat sendiri | Tombol Kembali di HP bekerja wajar, tautan bisa dikirim | Jendela di atas daftar saja | SPEC 4.2 |
| Satu obat satu Keluhan (versi 1) | Cukup untuk data awal, jauh lebih sederhana | Tabel banyak-ke-banyak | SPEC 4.3 |
| Satu titik uji otomatis: database | Semua aturan berisiko tinggal di sana; tampilan diuji manual dengan target terukur | Tes tampilan otomatis sejak awal | SPEC 5 |
| Kunci Supabase **tidak** disimpan di pengaturan sesi cloud; migrasi dipasang lewat connector Supabase | Tidak ada kunci/password database yang beredar di luar akun pemilik; sesi cloud tetap bisa memasang migrasi | Menyimpan kunci akses atau password database di pengaturan environment cloud (bocor = database terbuka) | SPEC 4.12 |
| Fungsi bantu (`status_stok`, `hari_ini`) di skema `private` | Tampilan `katalog` butuh fungsi itu dengan hak Pengunjung, tetapi Pengunjung tidak boleh memanggilnya langsung lewat internet | Fungsi di `public` (terbuka sebagai API); menyalin rumus Status stok ke dalam tampilan (aturan tidak lagi di satu tempat) | SPEC 4.3 |
| Data uji tetap + jadwal pg_cron penyegar tanggal, hanya di project uji | Tes hanya memegang kunci publik, jadi tidak bisa membentuk ulang database; baris "kedaluwarsa hari ini" harus selalu benar | Memberi CI password database (kunci induk di luar akun pemilik); tes tanggal yang dilewati | SPEC 5.3 |
| Halaman Katalog: kerangka disiapkan saat build, daftar obat diambil setiap kali dibuka (Next.js *Partial Prerender*) | Judul dan catatan tampil seketika (NF-05), Status stok tetap terbaru | Seluruh halaman disimpan di cache (stok bisa basi); seluruh halaman dibuat ulang (lebih lambat tampil) | SPEC 4.7, [penjelasan](penjelasan/01-katalog.md) |
| Server aplikasi Vercel di **Singapura** (`sin1`), diatur di `vercel.json` | Server bawaan Vercel di Washington membuat setiap pertanyaan ke database (di Singapura) menyeberang AS ↔ Singapura; makin banyak pertanyaan per halaman, makin lambat (NF-05) | Membiarkan bawaan Washington (lambat); mengatur lewat dasbor (tidak tercatat di repo); server cadangan di kota lain (berbayar, dan database tetap hanya di Singapura) | SPEC 4.12, #18 |
| TypeScript + CSS biasa (CSS Modules), tanpa Tailwind/UI kit | TypeScript menangkap salah ketik nama kolom sebelum aplikasi jalan; desain etiket dibuat sendiri (ADR 0004) sehingga UI kit tidak membantu | JavaScript biasa (kesalahan baru ketahuan saat jalan); Tailwind/Bootstrap (alat tambahan yang harus dipelajari, cenderung ke tampilan template) | [penjelasan](penjelasan/01-katalog.md) |
| Proxy hanya mengecek "sudah login atau belum"; peran dicek halaman (`lib/staf.ts`) | Panduan Next.js 16: proxy bukan untuk mengambil data dan bukan penentu hak akses satu-satunya. Halaman memang membaca profil Staf untuk nama dan menu, jadi sekalian mengecek peran. Penjaga datanya tetap RLS | Proxy membaca peran dari database di setiap halaman (satu pertanyaan tambahan, data yang sama dibaca dua kali) | SPEC 4.6, [penjelasan](penjelasan/02-login-staf.md) |
| `peran_saya` di skema `private`, berjalan dengan hak pemiliknya | Hanya dipakai aturan RLS, jadi tidak perlu menjadi alamat API; hak pemilik diperlukan karena aturan `profil_staf` sendiri memakainya | Di `public` supaya bisa dites langsung (membuka pintu API baru hanya demi tes) | SPEC 4.4 |
| Keluar lewat formulir biasa + muat ulang penuh | Ditemukan saat uji di browser: Next.js menyimpan halaman Staf secara tersembunyi, sehingga setelah Keluar tanpa muat ulang, isinya masih ada di memori browser komputer kasir | Server Action (isi halaman lama tertinggal) | SPEC 4.6, [penjelasan](penjelasan/02-login-staf.md) |
| Fungsi bawaan `rls_auto_enable()` dicabut izinnya dari `anon`/`authenticated` | Fungsi berhak penuh dari pengaturan "automatic RLS" ikut terbuka sebagai alamat API; pemicu otomatisnya tetap bekerja tanpa izin itu (sudah dicoba) | Membiarkan (peringatan pemeriksa keamanan); mematikan "automatic RLS" (kehilangan jaring pengaman untuk tabel baru) | Migrasi `20261010084330_login_staf.sql`, #6 |
| Password akun Staf uji di secrets GitHub dan `.env.local`, tidak di repo atau chat | Tes Kasir/Admin harus benar-benar login, tetapi repo ini publik | Menulis password di repo (siapa pun bisa masuk sebagai Admin uji); menempelkannya di chat (tercatat di riwayat percakapan) | SPEC 4.11 |
| Harga acuan = HET kemasan (KMK 092/2012) ÷ isi kemasan, **dibulatkan ke bawah** | HET berlaku per kemasan pabrik; pembulatan ke atas melewati HET walau hanya sen | Ke atas (melanggar HET); ke ratusan (angka acuan tidak sesuai sumber) | SPEC 4.11, [riset](riset/data-awal-obat.md), #7 |
| Golongan dari huruf ke-2 **nomor izin edar** generik yang berlaku di cekbpom; bila berbeda-beda, yang terbanyak | Data resmi BPOM yang tercetak di kemasan dan bisa dicek siapa pun; tebakan ternyata salah (Ambroksol obat keras) | Menebak dari kebiasaan; selalu golongan paling ketat (setirizin jadi "perlu resep" padahal mayoritas bebas terbatas) | SPEC 4.11, [riset](riset/data-awal-obat.md), #7 |
| Vitamin C dan B kompleks **tidak** dimasukkan | Keduanya kini terdaftar sebagai suplemen kesehatan, tanpa golongan obat; lingkaran hijau pada suplemen salah mengedukasi (M-06) | Menganggapnya obat bebas | [riset](riset/data-awal-obat.md), #7 |
| Data awal 38 obat, bukan dipaksakan 40 | Obat yang golongannya tidak pasti (CTM) atau izin edarnya dibatalkan (dekstrometorfan tunggal) dibuang | Menambah obat tebakan supaya genap 40 | [riset](riset/data-awal-obat.md), #7 |
| Tanggal kedaluwarsa data awal relatif terhadap hari pemasangan | Setiap pemasangan ulang sebelum demo memunculkan lagi semua keadaan kedaluwarsa | Tanggal tetap (contoh Segera kedaluwarsa hilang setelah beberapa bulan) | SPEC 4.11, [penjelasan](penjelasan/03-data-awal.md) |
| Penolakan Penjualan lewat `RAISE EXCEPTION`, berhenti di pelanggaran pertama, pesan ditampilkan apa adanya | Pengecualian otomatis membatalkan seluruh transaksi (utuh atau tidak sama sekali); satu pesan jelas cukup karena layar sudah mencegah hampir semua kesalahan | Kumpulkan semua kesalahan (rumit); balikan `{ok: false}` (langkah yang sudah terjadi tidak otomatis batal) | SPEC 4.4, #8 |
| `catat_penjualan` mengembalikan rincian resmi (nomor, total, kembalian, harga per obat) | Layar bisa memberi tahu Kasir bila harga di database sudah berubah | Hanya nomor (layar harus membaca ulang) | SPEC 4.4, #8 |
| Harga berubah saat menyimpan: tetap disimpan dengan harga database + pemberitahuan kuning | Harga selalu dari database (aturan bisnis 6) tanpa membuat Kasir menyimpan dua kali | Menolak lalu meminta simpan ulang | SPEC 4.8, #8 |
| Pilihan Cara bayar **QRIS/transfer** tetap ada, hanya dicatat | Uang QRIS masuk rekening, bukan laci; tanpa pemisahan, laci selalu tampak "kurang" saat tutup toko | Tunai saja (laci tidak cocok); QRIS sungguhan (butuh kerja sama bank, di luar cakupan) | [riset](riset/cara-bayar-qris.md), #8 |
| Tampilan `obat_kasir` (`security_invoker`) untuk layar Jual | Stok persis + Status stok dari fungsi yang sama dengan Katalog, RLS obat tetap berlaku | Menghitung Status stok di TypeScript (aturan di dua tempat) | SPEC 4.8, #8 |
| Enter menambahkan hasil pertama yang **bisa dijual**; jumlah dibatasi stok yang terlihat; Cara bayar bawaan Tunai | Penjualan 3 obat ≤ 30 detik (NF-03) dengan keyboard saja; penjaga sebenarnya tetap database | Enter "macet" di obat Habis; membiarkan angka melebihi stok sampai ditolak | SPEC 4.8, #8 |
| Fungsi `uji_atur_obat` hanya di project uji untuk menyetel ulang stok/harga obat `uji-jual-*` | Tes Penjualan mengurangi stok, jadi harus bisa dikembalikan agar tes bisa diulang; Kasir tidak boleh mengubah obat | Jadwal pg_cron penyetel stok (bertabrakan dengan tes); membuat obat baru per tes (Admin belum boleh, tabel menumpuk) | SPEC 5.3, #8 |
| Tes dua Kasir bersamaan: Kasir uji + Admin uji serentak, 3 ronde | Yang diuji penguncian stok, bukan peran; 3 ronde supaya lulus bukan kebetulan | Akun Kasir uji kedua (dasbor + secret baru) | SPEC 5.3, #8 |
| `lib/*.ts` hanya bentuk data dan cara menulisnya; pengambilan data di halaman | Layar Jual berjalan di browser dan memakai `tulisRupiah` dkk.; Next.js menolak kode server ikut ke browser | Menyalin fungsi penulisan (aturan di dua tempat) | SPEC 4.8, #8 |
| Setelah Simpan, layar langsung pindah ke Struk dengan tombol Cetak sudah terfokus; bila harga berubah, tetap di layar Jual dengan tombol Buka Struk | Struk siap dicetak dengan satu Enter (NF-03); pemberitahuan harga berubah tidak hilang sebelum dibaca | Dialog cetak otomatis (mengejutkan); selalu tetap di layar Jual (langkah tambahan) | SPEC 4.8, 4.9, #10 |
| Tinggi kertas Struk diukur sesaat sebelum mencetak | Gulungan 58 mm panjangnya bebas, tetapi browser butuh ukuran pasti; `58mm auto` ditolak Chromium | Tinggi tetap (kertas kosong terbuang) | SPEC 4.9, #10 |
| "Hari ini" untuk daftar Penjualan dihitung database (tampilan `penjualan_hari_ini`) | Admin boleh membaca semua Penjualan, jadi tetap perlu disaring; aturan WIB tetap di satu tempat dan dites (00.30 dan 23.30 WIB) | Menghitung batas jam di TypeScript (aturan di dua tempat) | SPEC 4.9, #10 |
| Pembatalan **hanya untuk Penjualan hari ini (WIB)**, juga untuk Admin | Sama dengan *void* di mesin kasir: koreksi sebelum tutup kasir. Obat Penjualan kemarin sudah dibawa pulang dan uangnya sudah dihitung | Kapan saja (stok tidak cocok rak, Laporan lama berubah diam-diam); batas 7 hari (angka asal pilih) | SPEC 4.4, [riset](riset/pembatalan-hari-ini.md), #13 |
| `batalkan_penjualan` mengunci baris Penjualan dulu, lalu baris obat urut id | Dua Admin membatalkan bersamaan: tepat satu berhasil, stok kembali sekali; tidak ada kebuntuan dengan `catat_penjualan` (ADR 0005) | Tanpa kunci (stok bisa kembali dua kali) | SPEC 4.4, #13 |
| Alasan Pembatalan wajib, paling panjang 200 huruf, dicek database | Jejak "kenapa" harus ada (aturan bisnis 7); 200 huruf cukup dan tetap muat di daftar dan Struk | Tanpa batas (merusak tampilan); minimal sekian huruf (angka asal pilih) | SPEC 4.4, #13 |
| Stok tetap kembali walau obat sudah diarsipkan atau kedaluwarsa | Stok = jumlah fisik di rak; strip yang batal dijual memang kembali | Menolak pembatalan; membatalkan tanpa mengembalikan stok | SPEC 4.4, #13 |
| Konfirmasi Pembatalan lewat jendela di tengah layar (`<dialog>`) dengan kolom alasan; tombol gelap, bukan merah | NF-03: tombol berbahaya minta konfirmasi; nyaman di HP dan laptop; merah khusus tanda Obat keras (ADR 0004) | `confirm()` bawaan browser (tanpa kolom alasan); panel di bawah baris (sempit di HP) | SPEC 4.9, #13 |
| Kasir melihat "oleh Admin", bukan nama Admin yang membatalkan | Kasir tidak boleh membaca profil Staf lain (RLS); hanya Admin yang bisa membatalkan, jadi tulisan itu pasti benar | Fungsi khusus yang membuka nama Admin ke Kasir (pintu baru tanpa kebutuhan) | SPEC 4.9, #13 |
| Daftar kosong diberi keterangan "Penjualan hari sebelumnya tetap tersimpan. Admin bisa melihatnya di Laporan." | Pengguna sendiri sempat mengira Penjualan kemarin terhapus | Pemilih tanggal di halaman ini (tugas Laporan #12) | SPEC 4.9, #13 |
| Nama obat di Struk dibaca lewat fungsi kecil berhak pemilik (`rincian_struk`) | Obat yang diarsipkan setelah terjual tetap bernama di Struk cetak ulang Kasir | Menyalin nama ke `item_penjualan` (mengubah #8); nama kosong | SPEC 4.9, #10 |
| Alamat apotek contoh di `lib/apotek.ts`, Struk mencetak "(alamat contoh)" | ApotikKu bukan apotek sungguhan; alamat bukan rahasia | Variabel lingkungan (langkah tambahan tanpa manfaat) | SPEC 4.9, #10 |

## Jawaban cepat untuk pertanyaan yang paling mungkin muncul

| Pertanyaan | Jawaban singkat |
|---|---|
| Kenapa tidak PHP + MySQL? | Bagian tersulit (login, hash password, hak akses) harus dibuat sendiri, dan di situ versi 1 gagal. Kami tetap menulis SQL karena Supabase adalah PostgreSQL. |
| Kenapa tidak Prisma/Drizzle? | Keduanya melewati RLS. Kami ingin database tetap menolak akses yang salah walaupun kode kami ada bug. |
| Kenapa tidak cek login di halaman saja? | Browser tersambung langsung ke database dengan kunci publik. Pengecekan harus ada di database (RLS). |
| Bagaimana kalau dua kasir menjual obat terakhir bersamaan? | Fungsi database mengunci baris obat itu; Kasir kedua menunggu sepersekian detik lalu ditolak "Stok … habis". Stok tidak pernah minus, dan ada tes otomatisnya ([ADR 0005](adr/0005-kunci-baris-obat-saat-penjualan.md)). |
| Kenapa ada pilihan QRIS kalau tidak tersambung bank? | Supaya uang di laci cocok dengan catatan tunai saat tutup toko; uang QRIS masuk rekening ([riset](riset/cara-bayar-qris.md)). |
| Layar Jual itu pembelian online? | Bukan. Layar Jual dipakai Kasir di meja apotek untuk mencatat pembeli yang datang langsung. Pengunjung hanya melihat Katalog (ADR 0002). |
| Kenapa tidak bisa pesan online? | Tidak ada masalah di PRD yang menuntutnya, dan penjualan obat online diatur ketat (resep, izin). |
| Kenapa tidak ada fitur AI? | Belum ada masalah yang membutuhkannya. Kandidat masa depan: prediksi kapan stok habis (PRD 9). |
| Kenapa tidak ada mode gelap? | Tidak menyelesaikan masalah apa pun, tetapi menggandakan pengujian tampilan. |
| Kalau Supabase/Vercel tutup? | Struktur database tersimpan sebagai migrasi SQL di repo dan bisa dipasang di PostgreSQL lain; Next.js bisa dijalankan di hosting lain. |
| Paket gratis cukup? | Untuk satu apotek dengan ±40 obat, jauh di bawah batas. Risikonya hanya project dijeda bila ±1 minggu tidak dipakai, jadi dibuka dulu sebelum demo. |

## Kamus istilah teknis

Istilah domain apotek (Penjualan, Obat keras, Status stok, dll.) ada di [`CONTEXT.md`](../CONTEXT.md). Di bawah ini istilah **teknis**.

| Istilah | Arti awam | Analogi |
|---|---|---|
| Framework (Next.js) | Kerangka siap pakai untuk membuat aplikasi web | Rangka rumah prefabrikasi; kita tinggal mengisi ruangannya |
| Database | Tempat data disimpan secara teratur | Lemari arsip dengan laci berlabel |
| Database relasional / SQL | Database berbentuk tabel yang bisa dihubungkan satu sama lain; SQL adalah bahasa untuk bertanya kepadanya | Beberapa buku besar yang saling merujuk lewat nomor |
| Hosting | Komputer di internet yang menjalankan aplikasi kita | Menyewa lapak di pusat perbelanjaan |
| localStorage | Penyimpanan kecil di dalam browser | Buku catatan yang ditinggal di satu meja |
| Login / autentikasi | Membuktikan "saya siapa" | Menunjukkan KTP di pintu |
| Hak akses / otorisasi | Menentukan "saya boleh apa" | Kartu akses yang hanya membuka ruangan tertentu |
| Hash | Password diubah menjadi kode acak yang tidak bisa dibalik | Jeruk bisa jadi jus, jus tidak bisa jadi jeruk |
| RLS (Row Level Security) | Aturan di dalam database tentang siapa boleh membaca/mengubah baris mana | Loker dengan kunci masing-masing |
| Middleware / proxy | Kode yang berjalan sebelum halaman dibuka | Satpam di pintu ruang staf |
| Anon key | Kunci publik untuk tersambung ke Supabase dari browser; aksesnya dibatasi RLS | Kartu tamu: semua orang boleh pegang, tapi hanya membuka lobi |
| Service role key | Kunci rahasia yang melewati semua aturan RLS; tidak dipakai di aplikasi | Kunci induk gedung |
| ORM (Drizzle, Prisma) | Penerjemah agar perintah database bisa ditulis seperti kode JavaScript | Penerjemah yang punya kunci induk |
| Migrasi | File berurutan berisi perubahan struktur database | Resep masakan langkah demi langkah |
| Transaksi database | Sekumpulan langkah yang berhasil semua atau batal semua (beda dengan "Penjualan") | Transfer bank: uang keluar dan masuk harus bersamaan |
| Fungsi database (RPC) | Perintah yang disimpan dan dijalankan di dalam database | Prosedur tetap di gudang yang dijalankan petugas gudang, bukan oleh pembeli |
| Repo (repository) | Folder project yang setiap perubahannya tercatat | Buku harian project |
| Branch | Salinan kerja terpisah untuk mengerjakan satu perubahan | Draf di kertas lain sebelum disalin ke buku utama |
| Pull Request (PR) | Permintaan agar perubahan di branch digabung ke versi utama, sambil diperiksa | Menyerahkan draf ke ketua kelompok untuk dicek sebelum dimasukkan ke laporan |
| Tag | Penanda versi tertentu di repo (misalnya `v1-html`) | Pembatas buku di halaman penting |
| Tampilan (view) | "Jendela" ke tabel yang hanya memperlihatkan kolom tertentu | Etalase toko: harga terlihat, buku stok di gudang tidak |
| Skema | Folder di dalam database untuk mengelompokkan tabel dan fungsi | Ruang depan toko (untuk pembeli) dan ruang belakang (untuk petugas) |
| Connector | Sambungan resmi asisten koding ke layanan lain dengan izin pemilik akun | Surat kuasa bertanda tangan untuk kurir, bukan meminjamkan kunci rumah |
| Publishable key | Nama baru Supabase untuk kunci publik (anon key) | Kartu tamu |
| Variabel lingkungan | Pengaturan yang dibaca aplikasi saat berjalan, disimpan di luar kode | PIN brankas yang dihafal penjaga, bukan ditulis di pintu |
| Secrets GitHub | Tempat menyimpan nilai rahasia/pengaturan untuk GitHub Actions; tidak terlihat di repo | Amplop tertutup yang hanya dibuka petugas QC |
| pg_cron | Penjadwal tugas di dalam PostgreSQL | Alarm yang mengingatkan petugas mengganti kertas tanggal |
| Server Component | Bagian halaman yang disusun di server, lalu dikirim ke HP sebagai HTML jadi | Makanan yang dimasak di dapur, pembeli menerima piring siap santap |
| Prerender / cache | Menyiapkan halaman lebih dulu dan menyimpannya untuk dipakai ulang | Fotokopi brosur: cepat dibagikan, tetapi isinya tidak berubah sampai dicetak ulang |
| Server Action | Fungsi di server yang dijalankan saat formulir dikirim | Menyerahkan formulir di loket; petugas di balik loket yang memprosesnya |
| Route Handler | Alamat di server yang menerima permintaan dan menjawab sendiri, tanpa halaman (misalnya `POST /keluar`) | Kotak surat khusus: surat dimasukkan, petugas langsung menindaklanjuti |
| Token login (JWT) | Tanda bukti login bertanda tangan digital yang disimpan di cookie; berumur pendek dan diperbarui otomatis | Gelang kolam renang bersegel: petugas cukup mengecek segelnya, tanpa menelepon kasir |
| Security definer | Fungsi database yang berjalan dengan hak pemiliknya, bukan hak pemanggil | Petugas gudang yang boleh masuk gudang atas nama pembeli, tetapi hanya mengambilkan barang milik pembeli itu |
| Activity (Next.js) | Cara Next.js menyimpan halaman yang baru dikunjungi secara tersembunyi supaya tombol Kembali cepat | Buku yang ditutup tetapi masih tergeletak di meja; orang berikutnya bisa membukanya |
| Cache-Control: no-store | Pesan ke browser agar tidak menyimpan salinan halaman | Tulisan "jangan difotokopi" di lembar rahasia |
| Nomor izin edar (NIE) | Nomor resmi dari BPOM yang wajib ada di kemasan obat; huruf ke-2 menunjukkan golongan (B/T/K) | Plat nomor kendaraan: hurufnya menunjukkan asal daerah |
| SHA-256 | "Sidik jari" sebuah file; berubah bila isinya berubah sedikit saja | Nomor seri uang kertas |
| Rollback | Membatalkan semua langkah dalam satu transaksi database | Menulis dengan pensil lalu menghapusnya |
| Race condition (kondisi balapan) | Dua proses membaca data yang sama hampir bersamaan, lalu sama-sama mengubahnya berdasarkan angka yang sudah basi | Dua loket bioskop menjual kursi terakhir yang sama |
| Mengunci baris (row lock, `FOR UPDATE`) | Menandai baris tabel sebagai "sedang dipakai" sampai transaksi selesai; transaksi lain menunggu | Kamar pas toko baju yang terkunci selama ada orang di dalam |
| Kebuntuan (deadlock) | Dua transaksi saling menunggu baris yang dipegang lawannya | Dua mobil berhadapan di jalan sempit, masing-masing menunggu yang lain mundur |
| `RAISE EXCEPTION` | Perintah di fungsi database untuk berhenti dengan pesan; semua langkah sebelumnya dibatalkan | Menarik rem darurat: kereta berhenti dan perjalanan dibatalkan |
| Security invoker (tampilan) | Tampilan yang membaca tabel dengan hak si pembaca, jadi RLS tabelnya tetap berlaku | Jendela yang tetap mengikuti kunci loker si pembaca |
| QRIS / MDR | Kode QR pembayaran standar Bank Indonesia; MDR = potongan biaya yang ditanggung penjual | Satu colokan listrik standar untuk semua merek / biaya admin transfer |
| CSS cetak (`@media print`, `@page`) | Aturan tampilan yang hanya berlaku saat halaman dicetak: menyembunyikan menu, mengatur ukuran kertas | Pengaturan mesin fotokopi: ukuran kertas dan bagian yang ikut difotokopi |
| `beforeprint` | Tanda dari browser sesaat sebelum mencetak, sehingga halaman sempat bersiap (di sini: mengukur tinggi Struk) | Kasir merapikan kertas sebelum menekan tombol cetak |
| Fokus (keyboard) | Tombol atau kolom yang sedang "dipilih", sehingga Enter langsung menekannya | Kursor yang berkedip di tempat kita akan mengetik |
| Void / refund (retur) | *Void* = membatalkan transaksi sebelum tutup kasir hari itu; *refund* = transaksi baru yang mengembalikan uang setelah tutup kasir. Pembatalan ApotikKu setara *void* | Mencoret tulisan pensil hari ini vs. menulis baris koreksi di buku yang sudah ditandatangani |
| Jendela modal (`<dialog>`) | Jendela di atas halaman; selama terbuka, bagian di belakangnya tidak bisa diklik, dan Esc menutupnya | Petugas bank yang menahan formulir dan bertanya "Yakin?" sebelum mencapnya |
