-- Data uji untuk project apotikku-uji SAJA (jangan dipasang di project asli).
-- Dipakai oleh tests/*.test.ts. Bisa dipasang ulang kapan saja: isi tabel obat
-- dihapus lalu diisi ulang dengan baris yang tetap.
--
-- Cara memasang: jalankan bagian-bagian file ini berurutan di project
-- apotikku-uji (lewat connector Supabase atau SQL Editor di dasbor), setelah
-- semua migrasi. Lewat connector, TRUNCATE dan create extension pernah
-- tertahan bila dijalankan sekaligus, jadi dipakai DELETE dan langkah terpisah.

delete from public.obat;

-- Batas Status stok (SPEC 5.2): 0 → Habis, 1 dan 20 → Hampir habis,
-- 21 → Tersedia. Tanggal kedaluwarsa jauh di depan supaya tidak ikut memengaruhi.
insert into public.obat
  (nama, bentuk, keluhan, golongan, satuan_jual, isi_per_satuan, kegunaan,
   harga_jual, harga_acuan, stok, tanggal_kedaluwarsa, diarsipkan)
values
  ('Uji Stok 0',  'tablet', 'demam_nyeri', 'bebas',          'strip', '10 tablet', 'Baris uji.', 1000, 1000, 0,  '2099-12-31', false),
  ('Uji Stok 1',  'tablet', 'demam_nyeri', 'bebas',          'strip', '10 tablet', 'Baris uji.', 1000, 1000, 1,  '2099-12-31', false),
  ('Uji Stok 20', 'tablet', 'batuk_flu',   'bebas_terbatas', 'strip', '10 tablet', 'Baris uji.', 1000, null, 20, '2099-12-31', false),
  ('Uji Stok 21', 'kapsul', 'alergi',      'keras',          'strip', '10 kapsul', 'Baris uji.', 1000, 1000, 21, '2099-12-31', false),
  -- Kedaluwarsa: tanggalnya disegarkan setiap menit oleh jadwal di bawah.
  ('Uji Kedaluwarsa Kemarin',  'sirup', 'batuk_flu', 'bebas', 'botol', '60 ml', 'Baris uji.', 1000, 1000, 50, private.hari_ini() - 1, false),
  ('Uji Kedaluwarsa Hari Ini', 'sirup', 'batuk_flu', 'bebas', 'botol', '60 ml', 'Baris uji.', 1000, 1000, 50, private.hari_ini(),     false),
  -- Diarsipkan: tidak boleh muncul di katalog.
  ('Uji Diarsipkan', 'salep', 'luka_kulit', 'bebas', 'tube', '5 g', 'Baris uji.', 1000, 1000, 50, '2099-12-31', true);

-- Tanggal "kemarin" dan "hari ini" (WIB) berubah setiap hari, sedangkan data
-- tersimpan dengan tanggal tetap. Jadwal ini menyegarkan dua baris tersebut
-- setiap menit, supaya tes kedaluwarsa selalu benar kapan pun dijalankan.
create extension if not exists pg_cron;

select cron.schedule(
  'uji-segarkan-tanggal-kedaluwarsa',
  '* * * * *',
  $$
    update public.obat set tanggal_kedaluwarsa = private.hari_ini() - 1
     where slug = 'uji-kedaluwarsa-kemarin';
    update public.obat set tanggal_kedaluwarsa = private.hari_ini()
     where slug = 'uji-kedaluwarsa-hari-ini';
  $$
);
