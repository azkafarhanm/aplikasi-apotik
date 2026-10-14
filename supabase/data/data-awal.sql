-- Data awal ApotikKu: 38 obat generik (tiket #7). Untuk project apotikku (asli).
-- Dipasang setelah semua migrasi. Riset dan sumbernya: docs/riset/data-awal-obat.md.
-- Penjelasan untuk orang awam: docs/penjelasan/03-data-awal.md.
--
-- Sumber:
-- - Harga acuan: Keputusan Menteri Kesehatan No. 092/MENKES/SK/II/2012 tentang
--   HET Obat Generik Tahun 2012 (ditetapkan 23 Februari 2012). Harganya harga
--   tahun 2012: belum ditemukan keputusan HET obat generik umum yang lebih baru.
--   https://farmalkes.kemkes.go.id/unduh/kepmenkes-092-2012/
-- - Golongan: huruf kedua nomor izin edar generik yang masih berlaku di
--   https://cekbpom.pom.go.id (GBL = bebas, GTL = bebas terbatas, GKL = keras),
--   diambil 14 Oktober 2026. Bila nomornya berbeda-beda, dipakai yang terbanyak.
--
-- Aturan yang dipakai (disetujui 14 Oktober 2026):
-- - HET di KMK berlaku per kemasan pabrik. Harga acuan per Satuan jual =
--   HET kemasan ÷ jumlah Satuan jual di kemasan itu, DIBULATKAN KE BAWAH ke
--   rupiah penuh, supaya tidak pernah melewati HET.
-- - Harga jual awal = harga acuan (PRD aturan bisnis 5).
-- - Tanggal kedaluwarsa ditulis relatif terhadap hari pemasangan (WIB), supaya
--   setiap kali dipasang ulang sebelum demo, semua keadaan tetap muncul:
--   Habis karena stok 0 (3), Sudah kedaluwarsa (2), Segera kedaluwarsa (4),
--   Hampir habis (6), sisanya Tersedia.
--
-- Bisa dipasang ulang: semua obat dihapus lalu diisi lagi. Bila sudah ada
-- Penjualan (mulai tiket #8), file ini menolak berjalan, karena obat yang
-- pernah terjual tidak boleh dihapus (PRD aturan bisnis 7).

do $$
begin
  if to_regclass('public.penjualan') is not null then
    if (select exists (select 1 from public.penjualan)) then
      raise exception 'Data awal tidak dipasang: sudah ada Penjualan, jadi obat tidak boleh dihapus.';
    end if;
  end if;
end;
$$;

delete from public.obat;

insert into public.obat
  (nama, bentuk, keluhan, golongan, satuan_jual, isi_per_satuan, kegunaan,
   harga_jual, harga_acuan, stok, tanggal_kedaluwarsa)
values
  -- KMK no. 357: Parasetamol tablet 500 mg, ktk 10 x 10 tablet, HET Rp14.175; ÷ 10 = Rp1.417.
  -- BPOM: GBL2144402910A1 (izin edar generik berlaku: B48).
  ('Parasetamol 500 mg', 'tablet', 'demam_nyeri', 'bebas', 'strip', '10 tablet',
   'Menurunkan demam dan meredakan nyeri ringan sampai sedang, misalnya sakit kepala dan sakit gigi.',
   1417, 1417, 150, private.hari_ini() + 720),

  -- KMK no. 355: Parasetamol sirup 120 mg / 5 ml, btl 60 ml, HET Rp3.105.
  -- BPOM: GBL9717101237A1 (izin edar generik berlaku: B24).
  ('Parasetamol Sirup 120 mg/5 ml', 'sirup', 'demam_nyeri', 'bebas', 'botol', '60 ml',
   'Menurunkan demam dan meredakan nyeri ringan pada anak.',
   3105, 3105, 40, private.hari_ini() + 20),

  -- KMK no. 354: Parasetamol drops, btl 15 ml, HET Rp7.128.
  -- BPOM: GBL2605069636B1 (izin edar generik berlaku: B5).
  ('Parasetamol Tetes', 'tetes', 'demam_nyeri', 'bebas', 'botol', '15 ml',
   'Menurunkan demam dan meredakan nyeri ringan pada bayi.',
   7128, 7128, 30, private.hari_ini() + 540),

  -- KMK no. 200: Ibuprofen tablet 400 mg, ktk 10 x 10 tablet, HET Rp27.680; ÷ 10 = Rp2.768.
  -- BPOM: GKL2433558317B1 (izin edar generik berlaku: K12).
  ('Ibuprofen 400 mg', 'tablet', 'demam_nyeri', 'keras', 'strip', '10 tablet',
   'Meredakan nyeri dan peradangan, misalnya nyeri otot, nyeri sendi, dan nyeri haid.',
   2768, 2768, 12, private.hari_ini() + 600),

  -- KMK no. 197: Ibuprofen suspensi 100 mg/5 ml, btl 60 ml, HET Rp4.725.
  -- BPOM: GTL2458400533A1 (izin edar generik berlaku: T5).
  ('Ibuprofen Suspensi 100 mg/5 ml', 'sirup', 'demam_nyeri', 'bebas_terbatas', 'botol', '60 ml',
   'Menurunkan demam dan meredakan nyeri ringan pada anak.',
   4725, 4725, 35, private.hari_ini() + 480),

  -- KMK no. 53: Asam Mefenamat kaplet 500 mg, ktk 10 x 10 kaplet, HET Rp23.760; ÷ 10 = Rp2.376.
  -- BPOM: GKL2231411809A1 (izin edar generik berlaku: K37).
  ('Asam Mefenamat 500 mg', 'tablet', 'demam_nyeri', 'keras', 'strip', '10 kaplet',
   'Meredakan nyeri ringan sampai sedang, misalnya nyeri haid dan sakit gigi.',
   2376, 2376, 80, private.hari_ini() + 660),

  -- KMK no. 322: Natrium Diklofenak tablet 50 mg, ktk 5 x 10 tablet, HET Rp14.693; ÷ 5 = Rp2.938.
  -- BPOM: GKL0533514915A1 (izin edar generik berlaku: K17).
  ('Natrium Diklofenak 50 mg', 'tablet', 'demam_nyeri', 'keras', 'strip', '10 tablet',
   'Meredakan nyeri dan peradangan pada sendi dan otot.',
   2938, 2938, 45, private.hari_ini() + 500),

  -- KMK no. 297: Metampiron tablet 500 mg, ktk 10 x 10 tablet, HET Rp20.115; ÷ 10 = Rp2.011.
  -- BPOM: GKL7815206104A2 (izin edar generik berlaku: K23).
  ('Metampiron 500 mg', 'tablet', 'demam_nyeri', 'keras', 'strip', '10 tablet',
   'Meredakan nyeri sedang sampai berat dan menurunkan demam.',
   2011, 2011, 30, private.hari_ini() + 420),

  -- KMK no. 335: Obat Batuk Hitam ( O.B.H. ) cairan, btl 100 ml, HET Rp1.931.
  -- BPOM: GBL7216706537A1 (izin edar generik berlaku: B4).
  ('Obat Batuk Hitam (OBH)', 'sirup', 'batuk_flu', 'bebas', 'botol', '100 ml',
   'Meredakan batuk berdahak.',
   1931, 1931, 60, private.hari_ini() + 365),

  -- KMK no. 80: Bromheksin tablet 8 mg, ktk 10 x 10 tablet, HET Rp5.200; ÷ 10 = Rp520.
  -- BPOM: GTL2533220110A1 (izin edar generik berlaku: T2).
  ('Bromheksin 8 mg', 'tablet', 'batuk_flu', 'bebas_terbatas', 'strip', '10 tablet',
   'Mengencerkan dahak supaya batuk berdahak lebih mudah dikeluarkan.',
   520, 520, 40, private.hari_ini() - 10),

  -- KMK no. 11: Ambroxol tablet 30 mg, ktk 10 x 10 tablet, HET Rp16.884; ÷ 10 = Rp1.688.
  -- BPOM: GKL2640102210A1 (izin edar generik berlaku: K25).
  ('Ambroksol 30 mg', 'tablet', 'batuk_flu', 'keras', 'strip', '10 tablet',
   'Mengencerkan dahak supaya batuk berdahak lebih mudah dikeluarkan.',
   1688, 1688, 70, private.hari_ini() + 560),

  -- KMK no. 10: Ambroxol sirup 15 mg/ml (tertulis demikian di KMK), btl 60 ml, HET Rp4.455.
  -- BPOM: GKL2658405437A1 (izin edar generik berlaku: K17).
  ('Ambroksol Sirup 15 mg/5 ml', 'sirup', 'batuk_flu', 'keras', 'botol', '60 ml',
   'Mengencerkan dahak pada batuk berdahak, untuk anak.',
   4455, 4455, 5, private.hari_ini() + 400),

  -- KMK no. 34: Antasida DOEN I tablet kunyah, ktk 10 x 10 tablet kunyah, HET Rp21.870; ÷ 10 = Rp2.187.
  -- BPOM: GBL0403604263A2 (izin edar generik berlaku: B29).
  ('Antasida DOEN Tablet Kunyah', 'tablet_kunyah', 'maag_pencernaan', 'bebas', 'strip', '10 tablet',
   'Meredakan gejala sakit maag seperti perih, mual, dan kembung karena asam lambung.',
   2187, 2187, 120, private.hari_ini() + 700),

  -- KMK no. 35: Antasida DOEN II suspensi, btl 60 ml, HET Rp5.198.
  -- BPOM: GBL1733314033A1 (izin edar generik berlaku: B12).
  ('Antasida DOEN Suspensi', 'sirup', 'maag_pencernaan', 'bebas', 'botol', '60 ml',
   'Meredakan gejala sakit maag seperti perih, mual, dan kembung karena asam lambung.',
   5198, 5198, 25, private.hari_ini() - 30),

  -- KMK no. 157: Garam Oralit I serbuk, ktk 25 bungkus, HET Rp13.535; ÷ 25 = Rp541.
  -- BPOM: GBL2536707323A1 (izin edar generik berlaku: B4).
  ('Oralit', 'serbuk', 'maag_pencernaan', 'bebas', 'sachet', 'untuk 200 ml air',
   'Mengganti cairan dan garam tubuh yang hilang karena diare atau muntah.',
   541, 541, 200, private.hari_ini() + 800),

  -- KMK no. 498: Zinc tablet 20 mg, ktk 10 x 10 tablet, HET Rp64.125; ÷ 10 = Rp6.412.
  -- BPOM: GTL2639205781A1 (izin edar generik berlaku: T19).
  ('Zinc 20 mg', 'tablet', 'maag_pencernaan', 'bebas_terbatas', 'strip', '10 tablet',
   'Membantu mempercepat sembuhnya diare pada anak, dipakai bersama oralit.',
   6412, 6412, 18, private.hari_ini() + 450),

  -- KMK no. 372: Pirantel sirup 125 mg/5 ml, btl 60 ml, HET Rp4.725.
  -- BPOM: GTL9917106433A1 (izin edar generik berlaku: T1).
  ('Pirantel Pamoat Sirup 125 mg/5 ml', 'sirup', 'maag_pencernaan', 'bebas_terbatas', 'botol', '60 ml',
   'Mengobati cacingan karena cacing kremi dan cacing gelang.',
   4725, 4725, 28, private.hari_ini() + 380),

  -- KMK no. 350: Omeprazol kapsul 20 mg, ktk 3 x 10 kapsul, HET Rp16.538; ÷ 3 = Rp5.512.
  -- BPOM: GKL2631118603A1 (izin edar generik berlaku: K15).
  ('Omeprazol 20 mg', 'kapsul', 'maag_pencernaan', 'keras', 'strip', '10 kapsul',
   'Mengurangi asam lambung pada sakit maag dan naiknya asam lambung.',
   5512, 5512, 50, private.hari_ini() + 45),

  -- KMK no. 450: Simetidin tablet 200 mg, ktk 10 x 10 tablet, HET Rp15.512; ÷ 10 = Rp1.551.
  -- BPOM: GKL0434003910A1 (izin edar generik berlaku: K10).
  ('Simetidin 200 mg', 'tablet', 'maag_pencernaan', 'keras', 'strip', '10 tablet',
   'Mengurangi asam lambung pada sakit maag dan tukak lambung.',
   1551, 1551, 35, private.hari_ini() + 520),

  -- KMK no. 116: Domperidon tablet 10 mg, ktk 10 x 10 tablet, HET Rp54.489; ÷ 10 = Rp5.448.
  -- BPOM: GKL0508512210A1 (izin edar generik berlaku: K29).
  ('Domperidon 10 mg', 'tablet', 'maag_pencernaan', 'keras', 'strip', '10 tablet',
   'Meredakan mual dan muntah.',
   5448, 5448, 40, private.hari_ini() + 610),

  -- KMK no. 282: Loperamid tablet 2 mg, ktk 10 x 10 tablet, HET Rp12.359; ÷ 10 = Rp1.235.
  -- BPOM: GKL2640102517A1 (izin edar generik berlaku: K11).
  ('Loperamid 2 mg', 'tablet', 'maag_pencernaan', 'keras', 'strip', '10 tablet',
   'Mengurangi buang air besar yang terlalu sering pada diare.',
   1235, 1235, 0, private.hari_ini() + 480),

  -- KMK no. 4: Albendazol tablet 400 mg, ktk 5 x 6 tablet, HET Rp16.470; ÷ 5 = Rp3.294.
  -- BPOM: GKL2425908263A1 (izin edar generik berlaku: K5).
  ('Albendazol 400 mg', 'tablet_kunyah', 'maag_pencernaan', 'keras', 'strip', '6 tablet',
   'Mengobati cacingan karena berbagai jenis cacing usus.',
   3294, 3294, 22, private.hari_ini() + 500),

  -- KMK no. 82: Cetirizine tablet 10 mg, ktk 3 x 10 tablet, HET Rp13.365; ÷ 3 = Rp4.455.
  -- BPOM: GTL0408511617A1 (izin edar generik berlaku: K8, T40).
  ('Setirizin 10 mg', 'tablet', 'alergi', 'bebas_terbatas', 'strip', '10 tablet',
   'Meredakan gejala alergi seperti bersin, pilek, gatal, dan biduran.',
   4455, 4455, 90, private.hari_ini() + 640),

  -- KMK no. 81: Cetirizin sirup 5 mg/5 ml, btl 60 ml, HET Rp14.108.
  -- BPOM: GTL2658404337A1 (izin edar generik berlaku: K4, T18).
  ('Setirizin Sirup 5 mg/5 ml', 'sirup', 'alergi', 'bebas_terbatas', 'botol', '60 ml',
   'Meredakan gejala alergi seperti bersin, pilek, dan gatal pada anak.',
   14108, 14108, 26, private.hari_ini() + 75),

  -- KMK no. 283: Loratadin tablet 10 mg, ktk 5 x 10 tablet, HET Rp22.483; ÷ 5 = Rp4.496.
  -- BPOM: GTL0408510510A1 (izin edar generik berlaku: K5, T13).
  ('Loratadin 10 mg', 'tablet', 'alergi', 'bebas_terbatas', 'strip', '10 tablet',
   'Meredakan gejala alergi seperti bersin, pilek, dan mata gatal.',
   4496, 4496, 8, private.hari_ini() + 590),

  -- KMK no. 90: Deksametason tablet 0,5 mg, ktk 10 x 10 tablet, HET Rp11.745; ÷ 10 = Rp1.174.
  -- BPOM: GKL1944400910A1 (izin edar generik berlaku: K34).
  ('Deksametason 0,5 mg', 'tablet', 'alergi', 'keras', 'strip', '10 tablet',
   'Meredakan peradangan dan reaksi alergi yang berat.',
   1174, 1174, 60, private.hari_ini() + 530),

  -- KMK no. 193: Hidrokortison krim 1%, tube 5 gram, HET Rp3.105.
  -- BPOM: GKL7211642829A1 (izin edar generik berlaku: K17).
  ('Hidrokortison Krim 1%', 'krim', 'alergi', 'keras', 'tube', '5 g',
   'Meredakan gatal dan kemerahan kulit karena alergi atau eksim ringan.',
   3105, 3105, 30, private.hari_ini() + 460),

  -- KMK no. 316: Mikonazol krim/salep 2 % (Nitrat), tube 10 gram, HET Rp4.050.
  -- BPOM: GTL2628920129A1 (izin edar generik berlaku: T11).
  ('Mikonazol Krim 2%', 'krim', 'luka_kulit', 'bebas_terbatas', 'tube', '10 g',
   'Mengobati infeksi jamur kulit seperti panu, kurap, dan kutu air.',
   4050, 4050, 0, private.hari_ini() + 500),

  -- KMK no. 219: Ketokonazol krim 2%, tube 15 gram, HET Rp9.450.
  -- BPOM: GTL2232303029A1 (izin edar generik berlaku: T15).
  ('Ketokonazol Krim 2%', 'krim', 'luka_kulit', 'bebas_terbatas', 'tube', '15 g',
   'Mengobati infeksi jamur kulit seperti panu dan kurap.',
   9450, 9450, 32, private.hari_ini() + 550),

  -- KMK no. 166: Gentamisin salep kulit 0.1%, tube 5 gram, HET Rp2.498.
  -- BPOM: GKL1007119730A1 (izin edar generik berlaku: K7).
  ('Gentamisin Salep Kulit 0,1%', 'salep', 'luka_kulit', 'keras', 'tube', '5 g',
   'Mengobati infeksi kulit oleh bakteri, misalnya luka yang terinfeksi.',
   2498, 2498, 40, private.hari_ini() + 88),

  -- KMK no. 346: Oksitetrasiklin salep kulit 3%, tube 5 gram, HET Rp2.261.
  -- BPOM: GKL9832300830A1 (izin edar generik berlaku: K1).
  ('Oksitetrasiklin Salep Kulit 3%', 'salep', 'luka_kulit', 'keras', 'tube', '5 g',
   'Mengobati infeksi kulit ringan oleh bakteri.',
   2261, 2261, 45, private.hari_ini() + 600),

  -- KMK no. 55: Asiklovir krim 5%, tube 5 gram, HET Rp4.253.
  -- BPOM: GKL1500915729A1 (izin edar generik berlaku: K1).
  ('Asiklovir Krim 5%', 'krim', 'luka_kulit', 'keras', 'tube', '5 g',
   'Membantu mengobati luka lepuh karena virus herpes, misalnya di bibir.',
   4253, 4253, 3, private.hari_ini() + 420),

  -- KMK no. 76: Betametason krim 0,1 % (sebagai Valerat), tube 5 gram, HET Rp2.735.
  -- BPOM: GKL2132302729A1 (izin edar generik berlaku: K12).
  ('Betametason Krim 0,1%', 'krim', 'luka_kulit', 'keras', 'tube', '5 g',
   'Meredakan peradangan dan gatal pada kulit, misalnya eksim.',
   2735, 2735, 38, private.hari_ini() + 580),

  -- KMK no. 194: Hidrokortison krim 2,5 %, tube 5 gram, HET Rp4.050.
  -- BPOM: GKL7211642829B1 (izin edar generik berlaku: K17).
  ('Hidrokortison Krim 2,5%', 'krim', 'luka_kulit', 'keras', 'tube', '5 g',
   'Meredakan peradangan dan gatal pada kulit, misalnya eksim dan dermatitis.',
   4050, 4050, 27, private.hari_ini() + 510),

  -- KMK no. 50: Asam Folat tablet 1 mg, btl 100 tablet, HET Rp9.180.
  -- BPOM: GBL8919909210A1 (izin edar generik berlaku: B5).
  ('Asam Folat 1 mg', 'tablet', 'vitamin', 'bebas', 'botol', '100 tablet',
   'Membantu memenuhi kebutuhan asam folat, misalnya pada masa kehamilan.',
   9180, 9180, 20, private.hari_ini() + 700),

  -- KMK no. 74: Besi (II) Sulfat 200 mg + Asam Folat 0,25 mg tablet (tablet tambah darah kombinasi), 1 bungkus @ 30 tablet, HET Rp2.700.
  -- BPOM: GBL2039204617A1 (izin edar generik berlaku: B20).
  ('Tablet Tambah Darah', 'tablet', 'vitamin', 'bebas', 'sachet', '30 tablet',
   'Membantu mencegah dan mengatasi kurang darah (anemia) karena kekurangan zat besi.',
   2700, 2700, 100, private.hari_ini() + 650),

  -- KMK no. 406: Retinol (Vitamin A) 100.000 IU kapsul lunak, btl 50 kapsul lunak, HET Rp19.305.
  -- BPOM: GBL2040312402A1 (izin edar generik berlaku: B2).
  ('Vitamin A 100.000 IU', 'kapsul', 'vitamin', 'bebas', 'botol', '50 kapsul',
   'Mencegah kekurangan vitamin A pada bayi.',
   19305, 19305, 0, private.hari_ini() + 700),

  -- KMK no. 407: Retinol (Vitamin A) 200.000 IU kapsul lunak, btl 50 kapsul lunak, HET Rp31.185.
  -- BPOM: GBL2040312402B1 (izin edar generik berlaku: B2).
  ('Vitamin A 200.000 IU', 'kapsul', 'vitamin', 'bebas', 'botol', '50 kapsul',
   'Mencegah kekurangan vitamin A pada balita dan ibu nifas.',
   31185, 31185, 24, private.hari_ini() + 700);
