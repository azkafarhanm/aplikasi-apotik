-- Data uji untuk project apotikku-uji SAJA (jangan dipasang di project asli).
-- Dipakai oleh tests/*.test.ts. Bisa dipasang ulang kapan saja.
--
-- Cara memasang: jalankan bagian-bagian file ini berurutan di project
-- apotikku-uji (lewat connector Supabase atau SQL Editor di dasbor), setelah
-- semua migrasi. Lewat connector, create extension pernah tertahan bila
-- dijalankan sekaligus, jadi dipakai langkah terpisah.
--
-- Mulai tiket #8, obat TIDAK lagi dihapus lalu diisi ulang: obat yang pernah
-- terjual dirujuk Item penjualan dan tidak boleh dihapus (aturan bisnis 7).
-- Baris yang sudah ada diperbarui, yang belum ada ditambahkan (dicocokkan
-- lewat nama, karena slug dibuat otomatis dari nama).

with data (nama, bentuk, keluhan, golongan, satuan_jual, isi_per_satuan,
           harga_jual, harga_acuan, stok, tanggal_kedaluwarsa, diarsipkan) as (
  values
    -- Batas Status stok (SPEC 5.2): 0 → Habis, 1 dan 20 → Hampir habis,
    -- 21 → Tersedia. Tanggal kedaluwarsa jauh di depan supaya tidak ikut memengaruhi.
    ('Uji Stok 0',  'tablet', 'demam_nyeri', 'bebas',          'strip', '10 tablet', 1000, 1000, 0,  date '2099-12-31', false),
    ('Uji Stok 1',  'tablet', 'demam_nyeri', 'bebas',          'strip', '10 tablet', 1000, 1000, 1,  date '2099-12-31', false),
    ('Uji Stok 20', 'tablet', 'batuk_flu',   'bebas_terbatas', 'strip', '10 tablet', 1000, null, 20, date '2099-12-31', false),
    ('Uji Stok 21', 'kapsul', 'alergi',      'keras',          'strip', '10 kapsul', 1000, 1000, 21, date '2099-12-31', false),
    -- Kedaluwarsa: tanggalnya disegarkan setiap menit oleh jadwal di bawah.
    ('Uji Kedaluwarsa Kemarin',  'sirup', 'batuk_flu', 'bebas', 'botol', '60 ml', 1000, 1000, 50, private.hari_ini() - 1, false),
    ('Uji Kedaluwarsa Hari Ini', 'sirup', 'batuk_flu', 'bebas', 'botol', '60 ml', 1000, 1000, 50, private.hari_ini(),     false),
    -- Diarsipkan: tidak boleh muncul di katalog dan tidak bisa dijual.
    ('Uji Diarsipkan', 'salep', 'luka_kulit', 'bebas', 'tube', '5 g', 1000, 1000, 50, date '2099-12-31', true),
    -- Tes Penjualan (tiket #8, tests/penjualan.test.ts). Stok dan harganya
    -- dikembalikan ke angka awal sebelum setiap tes lewat uji_atur_obat (di bawah).
    ('Uji Jual Bebas',  'tablet', 'demam_nyeri', 'bebas',          'strip', '10 tablet', 2500, 2500, 100, date '2099-12-31', false),
    ('Uji Jual Kedua',  'sirup',  'batuk_flu',   'bebas_terbatas', 'botol', '60 ml',     7000, 7000, 100, date '2099-12-31', false),
    ('Uji Jual Keras',  'kapsul', 'alergi',      'keras',          'strip', '10 kapsul', 5000, 5000, 100, date '2099-12-31', false),
    ('Uji Jual Stok 1', 'tablet', 'demam_nyeri', 'bebas',          'strip', '10 tablet', 1000, 1000, 1,   date '2099-12-31', false),
    -- Terpisah dari 'Uji Kedaluwarsa Hari Ini' supaya penjualan uji tidak
    -- menggerus stok baris yang dipakai tes Status stok di katalog.test.ts.
    ('Uji Jual Kedaluwarsa Hari Ini', 'sirup', 'batuk_flu', 'bebas', 'botol', '60 ml', 1000, 1000, 50, private.hari_ini(), false),
    -- Tes Pembatalan (tiket #13, tests/pembatalan.test.ts). Terpisah dari obat
    -- tes Penjualan, karena kedua file tes berjalan bersamaan dan masing-masing
    -- menyetel ulang stok obatnya sendiri sebelum setiap tes.
    ('Uji Jual Batal A',     'tablet', 'demam_nyeri', 'bebas',          'strip', '10 tablet', 3000, 3000, 100, date '2099-12-31', false),
    ('Uji Jual Batal B',     'sirup',  'batuk_flu',   'bebas_terbatas', 'botol', '60 ml',     4000, 4000, 100, date '2099-12-31', false),
    ('Uji Jual Batal Arsip', 'salep',  'luka_kulit',  'bebas',          'tube',  '5 g',       2000, 2000, 100, date '2099-12-31', false)
),
diperbarui as (
  update public.obat o
     set bentuk = d.bentuk, keluhan = d.keluhan, golongan = d.golongan,
         satuan_jual = d.satuan_jual, isi_per_satuan = d.isi_per_satuan,
         harga_jual = d.harga_jual, harga_acuan = d.harga_acuan, stok = d.stok,
         tanggal_kedaluwarsa = d.tanggal_kedaluwarsa, diarsipkan = d.diarsipkan
    from data d
   where o.nama = d.nama
  returning o.nama
)
insert into public.obat
  (nama, bentuk, keluhan, golongan, satuan_jual, isi_per_satuan, kegunaan,
   harga_jual, harga_acuan, stok, tanggal_kedaluwarsa, diarsipkan)
select nama, bentuk, keluhan, golongan, satuan_jual, isi_per_satuan, 'Baris uji.',
       harga_jual, harga_acuan, stok, tanggal_kedaluwarsa, diarsipkan
  from data
 where nama not in (select nama from diperbarui);

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
     where slug in ('uji-kedaluwarsa-hari-ini', 'uji-jual-kedaluwarsa-hari-ini');
  $$
);

-- ---------------------------------------------------------------------------
-- Profil Staf uji (tiket #6). Akun loginnya dibuat dulu lewat dasbor
-- (Authentication → Users → Add user, centang "Auto Confirm User"):
--   admin@apotikku.test, kasir@apotikku.test, nonaktif@apotikku.test
-- Password-nya disimpan di secrets GitHub dan .env.local, TIDAK di repo:
--   SUPABASE_UJI_ADMIN_PASSWORD, SUPABASE_UJI_KASIR_PASSWORD,
--   SUPABASE_UJI_NONAKTIF_PASSWORD
-- Bagian ini bisa dijalankan ulang: profil yang sudah ada diperbarui.
-- ---------------------------------------------------------------------------
insert into public.profil_staf (id, nama_tampilan, peran, aktif)
select u.id, p.nama_tampilan, p.peran, p.aktif
  from (values
    ('admin@apotikku.test',    'Admin Uji',    'admin', true),
    ('kasir@apotikku.test',    'Kasir Uji',    'kasir', true),
    ('nonaktif@apotikku.test', 'Nonaktif Uji', 'kasir', false)
  ) as p (email, nama_tampilan, peran, aktif)
  join auth.users u on u.email = p.email
on conflict (id) do update
  set nama_tampilan = excluded.nama_tampilan,
      peran         = excluded.peran,
      aktif         = excluded.aktif;

-- ---------------------------------------------------------------------------
-- Penjualan uji (tiket #8)
-- ---------------------------------------------------------------------------

-- uji_atur_obat: "tombol reset" untuk tes Penjualan, HANYA di project uji.
-- Setiap tes Penjualan mengurangi stok, sedangkan Kasir tidak boleh mengubah
-- obat dan izin Admin mengubah obat baru ada di tiket #9. Fungsi ini
-- mengembalikan stok dan harga obat uji ke angka awal sebelum setiap tes.
-- Dijaga tiga lapis: hanya ada di project uji (bukan migrasi), hanya Admin,
-- dan hanya obat ber-slug uji-jual-*.
create or replace function public.uji_atur_obat(slug_obat text, stok_baru integer, harga_baru integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.peran_saya() is distinct from 'admin' then
    raise exception 'Hanya Admin uji yang boleh mengatur obat uji.';
  end if;
  if slug_obat not like 'uji-jual-%' then
    raise exception 'Hanya obat uji-jual-* yang boleh diatur.';
  end if;
  update public.obat
     set stok = stok_baru, harga_jual = harga_baru
   where slug = slug_obat;
  if not found then
    raise exception 'Obat uji % tidak ada.', slug_obat;
  end if;
end;
$$;

revoke all on function public.uji_atur_obat(text, integer, integer) from public, anon;
grant execute on function public.uji_atur_obat(text, integer, integer) to authenticated;

-- uji_arsipkan_obat: mengarsipkan atau mengembalikan obat uji (tiket #13),
-- untuk tes "stok tetap kembali walau obatnya sudah diarsipkan". Dijaga sama
-- dengan uji_atur_obat: hanya di project uji, hanya Admin, hanya uji-jual-*.
create or replace function public.uji_arsipkan_obat(slug_obat text, diarsipkan_baru boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.peran_saya() is distinct from 'admin' then
    raise exception 'Hanya Admin uji yang boleh mengatur obat uji.';
  end if;
  if slug_obat not like 'uji-jual-%' then
    raise exception 'Hanya obat uji-jual-* yang boleh diatur.';
  end if;
  update public.obat set diarsipkan = diarsipkan_baru where slug = slug_obat;
  if not found then
    raise exception 'Obat uji % tidak ada.', slug_obat;
  end if;
end;
$$;

revoke all on function public.uji_arsipkan_obat(text, boolean) from public, anon;
grant execute on function public.uji_arsipkan_obat(text, boolean) to authenticated;

-- Satu Penjualan lama milik Kasir uji, untuk tes "Kasir tidak bisa melihat
-- Penjualan kemarin". Ditulis langsung (bukan lewat catat_penjualan) karena
-- waktunya harus di masa lalu. Tidak ditambahkan dua kali bila dipasang ulang.
with baru as (
  insert into public.penjualan (kasir_id, waktu, total, metode_bayar, uang_diterima, kembalian)
  select u.id, timestamptz '2026-01-01 10:00+07', 2500, 'tunai', 5000, 2500
    from auth.users u
   where u.email = 'kasir@apotikku.test'
     and not exists (
       select 1 from public.penjualan p
        where p.kasir_id = u.id and p.waktu = timestamptz '2026-01-01 10:00+07')
  returning id
)
insert into public.item_penjualan (penjualan_id, obat_id, jumlah, harga_satuan, subtotal)
select baru.id, o.id, 1, 2500, 2500
  from baru, public.obat o
 where o.slug = 'uji-jual-bebas';

-- ---------------------------------------------------------------------------
-- Penjualan berjam tetap (tiket #10)
-- ---------------------------------------------------------------------------
-- Tes "hari ini menurut WIB" (user story 72) butuh Penjualan Kasir uji pada
-- jam tertentu, relatif terhadap hari ini:
--   hari-ini-0030 : pukul 00.30 WIB hari ini (= 17.30 UTC KEMARIN). Kalau
--                   "hari ini" salah dihitung memakai UTC, baris ini hilang.
--                   Berisi obat 'Uji Diarsipkan', untuk tes Struk yang tetap
--                   menampilkan nama obat yang sudah diarsipkan.
--   hari-ini-2330 : pukul 23.30 WIB hari ini, tetap terhitung hari ini.
--   kemarin-2330  : pukul 23.30 WIB kemarin, TIDAK terhitung hari ini.
--   admin-1200    : milik Admin uji, pukul 12.00 WIB hari ini. Kasir tidak
--                   boleh melihatnya; Admin melihatnya beserta namanya.
-- Tes hari ini tidak mencatat Penjualan baru, supaya tidak mengganggu angka
-- stok tes Penjualan yang berjalan bersamaan.
-- Waktunya disegarkan setiap menit oleh jadwal di bawah (seperti tanggal
-- kedaluwarsa). Tabel penanda ini hanya ada di project uji.
create table if not exists private.uji_penjualan_berjam (
  kunci        text primary key,
  penjualan_id bigint not null unique references public.penjualan (id),
  geser_hari   integer not null,
  jam          time not null
);

with rencana (kunci, email, geser_hari, jam, slug_obat, harga) as (
  values
    ('hari-ini-0030', 'kasir@apotikku.test',  0, time '00:30', 'uji-diarsipkan', 1000),
    ('hari-ini-2330', 'kasir@apotikku.test',  0, time '23:30', 'uji-jual-bebas', 2500),
    ('kemarin-2330',  'kasir@apotikku.test', -1, time '23:30', 'uji-jual-bebas', 2500),
    ('admin-1200',    'admin@apotikku.test',  0, time '12:00', 'uji-jual-kedua', 7000)
),
belum as (
  select r.*, row_number() over (order by r.kunci) as urut
    from rencana r
   where r.kunci not in (select kunci from private.uji_penjualan_berjam)
),
baru as (
  insert into public.penjualan (kasir_id, waktu, total, metode_bayar)
  select u.id,
         ((private.hari_ini() + b.geser_hari) + b.jam) at time zone 'Asia/Jakarta',
         b.harga, 'qris_transfer'
    from belum b
    join auth.users u on u.email = b.email
   order by b.urut
  returning id
),
berpasangan as (
  select b.*, n.id as penjualan_id
    from (select id, row_number() over (order by id) as urut from baru) n
    join belum b on b.urut = n.urut
),
penanda as (
  insert into private.uji_penjualan_berjam (kunci, penjualan_id, geser_hari, jam)
  select kunci, penjualan_id, geser_hari, jam from berpasangan
)
insert into public.item_penjualan (penjualan_id, obat_id, jumlah, harga_satuan, subtotal)
select p.penjualan_id, o.id, 1, p.harga, p.harga
  from berpasangan p
  join public.obat o on o.slug = p.slug_obat;

select cron.schedule(
  'uji-segarkan-waktu-penjualan',
  '* * * * *',
  $$
    update public.penjualan p
       set waktu = ((private.hari_ini() + b.geser_hari) + b.jam) at time zone 'Asia/Jakarta'
      from private.uji_penjualan_berjam b
     where p.id = b.penjualan_id;
  $$
);
