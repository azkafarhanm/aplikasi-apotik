-- Data contoh untuk project apotikku (tiket #2). Dipasang setelah migrasi.
-- Akan DIGANTI oleh data awal lengkap ±40 obat bersumber resmi (tiket #7).
--
-- Yang sengaja dibuat:
-- - Semua golongan: bebas, bebas terbatas, keras.
-- - Semua Status stok: Tersedia (> 20), Hampir habis (1–20), Habis karena
--   stok 0, dan Habis karena Sudah kedaluwarsa.
-- - Satu obat diarsipkan (tidak boleh tampil di Katalog).
--
-- Golongan setiap obat mengikuti penggolongan umum BPOM; dicek ulang ke
-- sumber resmi di tiket #7. Harga jual di sini HANYA CONTOH (angka bulat),
-- bukan HET. Harga acuan sengaja dikosongkan (boleh, PRD aturan bisnis 5)
-- karena HET bersumber resmi baru diisi di tiket #7.
--
-- Bisa dipasang ulang: semua obat dihapus dulu. Jangan dipasang lagi setelah
-- ada Penjualan (tiket #8), karena obat yang sudah terjual tidak boleh dihapus.

delete from public.obat;

insert into public.obat
  (nama, bentuk, keluhan, golongan, satuan_jual, isi_per_satuan, kegunaan,
   harga_jual, harga_acuan, stok, tanggal_kedaluwarsa, diarsipkan)
values
  ('Parasetamol 500 mg', 'tablet', 'demam_nyeri', 'bebas', 'strip', '10 tablet',
   'Membantu menurunkan demam dan meredakan nyeri ringan, misalnya sakit kepala dan sakit gigi.',
   5000, null, 120, '2028-03-31', false),

  ('Parasetamol Sirup 120 mg/5 ml', 'sirup', 'demam_nyeri', 'bebas', 'botol', '60 ml',
   'Membantu menurunkan demam dan meredakan nyeri ringan pada anak.',
   8000, null, 14, '2027-08-31', false),

  ('Asam Mefenamat 500 mg', 'tablet', 'demam_nyeri', 'keras', 'strip', '10 tablet',
   'Meredakan nyeri, misalnya nyeri haid dan sakit gigi.',
   6000, null, 45, '2027-11-30', false),

  ('Klorfeniramin Maleat (CTM) 4 mg', 'tablet', 'alergi', 'bebas_terbatas', 'strip', '10 tablet',
   'Meredakan gejala alergi seperti bersin, gatal, dan mata berair. Dapat menyebabkan kantuk.',
   3000, null, 0, '2028-01-31', false),

  ('Dekstrometorfan 15 mg', 'tablet', 'batuk_flu', 'bebas_terbatas', 'strip', '10 tablet',
   'Meredakan batuk kering yang tidak berdahak.',
   4000, null, 60, '2026-06-30', false),

  ('Antasida DOEN', 'tablet_kunyah', 'maag_pencernaan', 'bebas', 'strip', '10 tablet',
   'Meredakan gejala sakit maag seperti perih dan kembung.',
   4000, null, 80, '2028-05-31', false),

  ('Omeprazol 20 mg', 'kapsul', 'maag_pencernaan', 'keras', 'strip', '10 kapsul',
   'Mengurangi asam lambung pada sakit maag dan naiknya asam lambung.',
   9000, null, 8, '2027-09-30', false),

  ('Oralit', 'serbuk', 'maag_pencernaan', 'bebas', 'sachet', 'untuk 200 ml air',
   'Mengganti cairan tubuh yang hilang karena diare.',
   2000, null, 200, '2028-02-29', false),

  ('Gentamisin Salep Kulit 0,1%', 'salep', 'luka_kulit', 'keras', 'tube', '5 g',
   'Mengobati infeksi kulit oleh bakteri.',
   7000, null, 25, '2027-12-31', false),

  ('Vitamin C 50 mg', 'tablet', 'vitamin', 'bebas', 'strip', '10 tablet',
   'Membantu memenuhi kebutuhan vitamin C.',
   3000, null, 150, '2028-04-30', false),

  ('Vitamin B Kompleks', 'tablet', 'vitamin', 'bebas', 'strip', '10 tablet',
   'Membantu memenuhi kebutuhan vitamin B.',
   3000, null, 40, '2028-04-30', true);
