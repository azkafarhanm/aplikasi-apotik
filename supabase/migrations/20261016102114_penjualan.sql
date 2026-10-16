-- Migrasi 3: Penjualan (tiket #8)
-- Rujukan: docs/SPEC.md 4.3 (penjualan, item_penjualan), 4.4 (catat_penjualan),
-- 4.5 (RLS), 4.8 (layar Jual); ADR 0003 dan 0005.
--
-- Aturan project: tabel baru TIDAK otomatis terbuka untuk anon/authenticated,
-- jadi setiap izin (GRANT) ditulis di sini secara eksplisit.

-- ---------------------------------------------------------------------------
-- 1. Sudah kedaluwarsa: dihitung di satu tempat
-- ---------------------------------------------------------------------------
-- Dipakai status_stok, tampilan obat_kasir, dan catat_penjualan, supaya
-- arti "sudah kedaluwarsa" tidak mungkin berbeda di tiga tempat.
-- Obat yang kedaluwarsa HARI INI masih boleh dijual (SPEC 4.3).
create function private.sudah_kedaluwarsa(tanggal_kedaluwarsa date)
returns boolean
language sql
stable
set search_path = ''
as $$
  select tanggal_kedaluwarsa < private.hari_ini();
$$;

comment on function private.sudah_kedaluwarsa(date) is
  'true bila tanggal kedaluwarsa sebelum hari ini (WIB).';

create or replace function private.status_stok(stok integer, tanggal_kedaluwarsa date)
returns text
language sql
stable
set search_path = ''
as $$
  select case
    when private.sudah_kedaluwarsa(tanggal_kedaluwarsa) then 'habis'
    when stok <= 0                                       then 'habis'
    when stok <= 20                                      then 'hampir_habis'
    else                                                      'tersedia'
  end;
$$;

revoke all on function private.sudah_kedaluwarsa(date) from public;
-- anon ikut diberi izin karena status_stok (dipakai tampilan katalog yang
-- dibaca Pengunjung) memanggil fungsi ini dengan hak si pembaca.
grant execute on function private.sudah_kedaluwarsa(date) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Tabel penjualan: satu baris per pembeli yang dilayani
-- ---------------------------------------------------------------------------
create table public.penjualan (
  id              bigint generated always as identity primary key,
  -- Nomor di Struk, misalnya PJ-000123. Dibentuk dari id, jadi pasti unik dan
  -- tidak pernah bisa diketik sendiri.
  nomor           text generated always as ('PJ-' || lpad(id::text, 6, '0')) stored unique,
  kasir_id        uuid not null references public.profil_staf (id),
  waktu           timestamptz not null default now(),
  -- Uang = bilangan bulat rupiah (SPEC 4.3). Semua angka diisi catat_penjualan.
  total           integer not null check (total > 0),
  metode_bayar    text not null check (metode_bayar in ('tunai', 'qris_transfer')),
  uang_diterima   integer,
  kembalian       integer,
  cek_resep       boolean not null default false,
  status          text not null default 'selesai' check (status in ('selesai', 'dibatalkan')),
  dibatalkan_oleh uuid references public.profil_staf (id),
  dibatalkan_pada timestamptz,
  alasan_batal    text,

  -- Tunai: uang diterima cukup dan kembalian tepat. QRIS/transfer: keduanya kosong.
  constraint penjualan_pembayaran_benar check (
    (metode_bayar = 'tunai'
       and uang_diterima >= total
       and kembalian = uang_diterima - total)
    or
    (metode_bayar = 'qris_transfer'
       and uang_diterima is null
       and kembalian is null)
  ),
  -- Data Pembatalan terisi ketiganya, atau kosong ketiganya (SPEC 4.3).
  constraint penjualan_pembatalan_lengkap check (
    (status = 'selesai'
       and dibatalkan_oleh is null and dibatalkan_pada is null and alasan_batal is null)
    or
    (status = 'dibatalkan'
       and dibatalkan_oleh is not null and dibatalkan_pada is not null
       and btrim(coalesce(alasan_batal, '')) <> '')
  )
);

comment on table public.penjualan is
  'Satu Penjualan = satu pembeli dilayani. Hanya bisa ditambah lewat catat_penjualan; tidak pernah dihapus (aturan bisnis 7).';

-- Untuk "Penjualan hari ini milik Kasir ini" (RLS di bawah, tiket #10).
create index penjualan_kasir_waktu on public.penjualan (kasir_id, waktu);

-- ---------------------------------------------------------------------------
-- 3. Tabel item_penjualan: satu baris per obat dalam satu Penjualan
-- ---------------------------------------------------------------------------
-- Rujukan ke obat memakai bawaan "no action": obat yang pernah terjual tidak
-- bisa dihapus, hanya diarsipkan (aturan bisnis 7).
create table public.item_penjualan (
  id           bigint generated always as identity primary key,
  penjualan_id bigint not null references public.penjualan (id),
  obat_id      bigint not null references public.obat (id),
  jumlah       integer not null check (jumlah > 0),
  -- SALINAN harga jual saat terjual, bukan rujukan ke obat.harga_jual:
  -- mengubah harga besok tidak boleh mengubah Penjualan hari ini (NF-06).
  harga_satuan integer not null check (harga_satuan > 0),
  subtotal     integer not null,
  constraint item_penjualan_subtotal_benar check (subtotal = jumlah * harga_satuan),
  -- Satu obat sekali per Penjualan; jumlahnya yang ditambah, bukan barisnya.
  constraint item_penjualan_obat_sekali unique (penjualan_id, obat_id)
);

comment on table public.item_penjualan is
  'Item penjualan: obat, jumlah, dan Harga jual saat itu terjual.';

create index item_penjualan_obat on public.item_penjualan (obat_id);

-- ---------------------------------------------------------------------------
-- 4. Hak akses penjualan dan item_penjualan (SPEC 4.5)
-- ---------------------------------------------------------------------------
-- Hanya izin MEMBACA. Menambah hanya lewat catat_penjualan (di bawah);
-- membatalkan hanya lewat batalkan_penjualan (tiket #13); menghapus tidak
-- diizinkan untuk siapa pun.
alter table public.penjualan enable row level security;
alter table public.item_penjualan enable row level security;

revoke all on table public.penjualan from anon, authenticated;
revoke all on table public.item_penjualan from anon, authenticated;
grant select on table public.penjualan to authenticated;
grant select on table public.item_penjualan to authenticated;

-- Kasir: Penjualan miliknya, hari ini (WIB). Admin: semua.
-- Daftar Penjualan semua Kasir = laporan pendapatan, wewenang Admin (SPEC 4.5).
create policy "Kasir membaca Penjualan miliknya hari ini, Admin membaca semua"
  on public.penjualan
  for select
  to authenticated
  using (
    (select private.peran_saya()) = 'admin'
    or (
      (select private.peran_saya()) = 'kasir'
      and kasir_id = (select auth.uid())
      and (waktu at time zone 'Asia/Jakarta')::date = (select private.hari_ini())
    )
  );

-- Item penjualan ikut terlihat bila Penjualan induknya terlihat. Subkueri ke
-- penjualan terkena aturan di atas, jadi aturannya tidak ditulis dua kali.
create policy "Item penjualan terlihat bila Penjualannya terlihat"
  on public.item_penjualan
  for select
  to authenticated
  using (
    exists (select 1 from public.penjualan p where p.id = penjualan_id)
  );

-- ---------------------------------------------------------------------------
-- 5. Tampilan obat_kasir: daftar obat untuk layar Jual
-- ---------------------------------------------------------------------------
-- security_invoker = true: tampilan membaca tabel obat dengan hak SI PEMBACA,
-- jadi aturan RLS obat tetap berlaku (Pengunjung dan Staf nonaktif mendapat
-- daftar kosong). Status stok dihitung dengan fungsi yang sama dengan Katalog.
create view public.obat_kasir
with (security_invoker = true)
as
select
  id,
  nama,
  bentuk,
  golongan,
  satuan_jual,
  isi_per_satuan,
  harga_jual,
  stok,
  tanggal_kedaluwarsa,
  private.status_stok(stok, tanggal_kedaluwarsa)   as status_stok,
  private.sudah_kedaluwarsa(tanggal_kedaluwarsa)   as sudah_kedaluwarsa
from public.obat
where not diarsipkan;

comment on view public.obat_kasir is
  'Obat yang bisa muncul di layar Jual (tidak diarsipkan), dengan stok persis dan Status stok. Mengikuti RLS tabel obat.';

revoke all on table public.obat_kasir from anon, authenticated;
grant select on table public.obat_kasir to authenticated;

-- ---------------------------------------------------------------------------
-- 6. catat_penjualan: satu-satunya pintu untuk mencatat Penjualan (SPEC 4.4)
-- ---------------------------------------------------------------------------
-- keranjang     : [{"obat_id": 12, "jumlah": 2}, ...]. Harga yang ikut dikirim
--                 DIABAIKAN; harga selalu diambil dari database (aturan bisnis 6).
-- metode_bayar  : 'tunai' | 'qris_transfer'
-- uang_diterima : wajib dan >= total bila tunai; harus kosong bila QRIS/transfer
-- cek_resep     : wajib true bila ada Obat keras; disimpan apa adanya
--
-- Mengembalikan rincian resmi: nomor, total, kembalian, dan setiap Item
-- penjualan dengan harga database, supaya layar bisa memberi tahu bila harga
-- sudah berubah (SPEC 4.8).
--
-- Penolakan memakai RAISE EXCEPTION: seluruh fungsi berjalan dalam satu
-- transaksi database, jadi pengecualian membatalkan SEMUA yang sudah terjadi
-- (utuh atau tidak sama sekali, NF-06). Pesannya bahasa sehari-hari dan
-- ditampilkan apa adanya ke Kasir.
--
-- security definer: fungsi berjalan dengan hak pemiliknya, karena Kasir tidak
-- punya izin menulis tabel penjualan atau mengubah stok obat secara langsung.
-- Karena itu fungsi mengecek sendiri pemanggilnya (Staf aktif) dan memakai
-- search_path kosong (semua nama tabel ditulis lengkap) supaya tidak bisa
-- dibelokkan ke tabel tiruan.
create function public.catat_penjualan(
  keranjang     jsonb,
  metode_bayar  text,
  uang_diterima integer default null,
  cek_resep     boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  baris          record;
  nama_salah     text;
  obat_keras     text;
  total_         integer := 0;
  item           jsonb := '[]'::jsonb;
  penjualan_id_  bigint;
  nomor_         text;
  kembalian_     integer;
begin
  -- 1. Pemanggil harus Staf aktif (Kasir atau Admin).
  if private.peran_saya() is null then
    raise exception 'Akun ini tidak bisa mencatat Penjualan.';
  end if;

  -- 2. Bentuk masukan.
  if keranjang is null
     or jsonb_typeof(keranjang) <> 'array'
     or jsonb_array_length(keranjang) = 0 then
    raise exception 'Keranjang masih kosong.';
  end if;

  if metode_bayar is null or metode_bayar not in ('tunai', 'qris_transfer') then
    raise exception 'Cara bayar harus Tunai atau QRIS/transfer.';
  end if;

  if exists (
    select 1
      from jsonb_to_recordset(keranjang) as k (obat_id bigint)
     where k.obat_id is null
        or not exists (select 1 from public.obat o where o.id = k.obat_id)
  ) then
    raise exception 'Ada obat di keranjang yang tidak dikenal. Muat ulang halaman Jual.';
  end if;

  select o.nama
    into nama_salah
    from jsonb_to_recordset(keranjang) as k (obat_id bigint, jumlah integer)
    join public.obat o on o.id = k.obat_id
   where k.jumlah is null or k.jumlah <= 0
   order by o.id
   limit 1;
  if found then
    raise exception 'Jumlah % minimal 1.', nama_salah;
  end if;

  -- 3. Kunci baris obat yang dibeli, urut id (ADR 0005).
  -- Bila Kasir lain sedang menjual obat yang sama, langkah ini MENUNGGU sampai
  -- Penjualan itu selesai, lalu membaca stok terbarunya. Urutan id yang sama
  -- untuk semua Kasir mencegah dua Kasir saling menunggu selamanya.
  perform 1
     from public.obat o
    where o.id in (select k.obat_id from jsonb_to_recordset(keranjang) as k (obat_id bigint))
    order by o.id
      for update;

  -- 4. Cek setiap obat (stok sudah terkunci, jadi angkanya pasti terbaru).
  -- Obat yang dikirim dua kali dijumlahkan dulu.
  for baris in
    select o.id, o.nama, o.golongan, o.satuan_jual, o.harga_jual, o.stok,
           o.tanggal_kedaluwarsa, o.diarsipkan, k.jumlah
      from (
        select k.obat_id, sum(k.jumlah)::integer as jumlah
          from jsonb_to_recordset(keranjang) as k (obat_id bigint, jumlah integer)
         group by k.obat_id
      ) k
      join public.obat o on o.id = k.obat_id
     order by o.id
  loop
    if baris.diarsipkan then
      raise exception '% sudah diarsipkan dan tidak bisa dijual.', baris.nama;
    end if;
    if private.sudah_kedaluwarsa(baris.tanggal_kedaluwarsa) then
      raise exception '% sudah kedaluwarsa dan tidak boleh dijual.', baris.nama;
    end if;
    if baris.stok = 0 then
      raise exception 'Stok % habis.', baris.nama;
    end if;
    if baris.stok < baris.jumlah then
      raise exception 'Stok % tinggal % %.', baris.nama, baris.stok, baris.satuan_jual;
    end if;

    if baris.golongan = 'keras' and obat_keras is null then
      obat_keras := baris.nama;
    end if;

    total_ := total_ + baris.jumlah * baris.harga_jual;
    item := item || jsonb_build_object(
      'obat_id',      baris.id,
      'nama',         baris.nama,
      'satuan_jual',  baris.satuan_jual,
      'jumlah',       baris.jumlah,
      'harga_satuan', baris.harga_jual,
      'subtotal',     baris.jumlah * baris.harga_jual
    );
  end loop;

  -- 5. Cek resep untuk Obat keras (aturan bisnis 3).
  if obat_keras is not null and cek_resep is distinct from true then
    raise exception 'Ada Obat keras (%). Centang Cek resep setelah memeriksa resep dokter.', obat_keras;
  end if;

  -- 6. Pembayaran (aturan bisnis 6).
  if metode_bayar = 'tunai' then
    if uang_diterima is null then
      raise exception 'Isi uang diterima untuk pembayaran tunai.';
    end if;
    if uang_diterima < total_ then
      raise exception 'Uang diterima kurang. Total Rp%.',
        replace(to_char(total_, 'FM999,999,999,999'), ',', '.');
    end if;
    kembalian_ := uang_diterima - total_;
  elsif uang_diterima is not null then
    raise exception 'QRIS/transfer tidak memakai uang diterima.';
  end if;

  -- 7. Simpan Penjualan, Item penjualan, lalu kurangi stok.
  insert into public.penjualan
    (kasir_id, total, metode_bayar, uang_diterima, kembalian, cek_resep)
  values
    ((select auth.uid()), total_, metode_bayar, uang_diterima, kembalian_,
     coalesce(cek_resep, false))
  returning id, nomor into penjualan_id_, nomor_;

  insert into public.item_penjualan (penjualan_id, obat_id, jumlah, harga_satuan, subtotal)
  select penjualan_id_, i.obat_id, i.jumlah, i.harga_satuan, i.subtotal
    from jsonb_to_recordset(item) as i (obat_id bigint, jumlah integer, harga_satuan integer, subtotal integer);

  update public.obat o
     set stok = o.stok - i.jumlah
    from jsonb_to_recordset(item) as i (obat_id bigint, jumlah integer)
   where o.id = i.obat_id;

  return jsonb_build_object(
    'nomor',         nomor_,
    'total',         total_,
    'metode_bayar',  metode_bayar,
    'uang_diterima', uang_diterima,
    'kembalian',     kembalian_,
    'item',          item
  );
end;
$$;

comment on function public.catat_penjualan(jsonb, text, integer, boolean) is
  'Satu-satunya cara mencatat Penjualan: cek semua aturan, harga dari database, kurangi stok, utuh atau tidak sama sekali.';

-- Pengunjung (anon) tidak boleh memanggil; hanya akun yang login. Siapa yang
-- boleh di antara mereka (Staf aktif) dicek di dalam fungsi.
-- Pemeriksa keamanan Supabase memberi peringatan "Signed-In Users Can Execute
-- SECURITY DEFINER Function" untuk fungsi ini. Itu disengaja: inilah satu-
-- satunya pintu Penjualan untuk Staf, dan dijaga tes tests/penjualan.test.ts.
revoke all on function public.catat_penjualan(jsonb, text, integer, boolean) from public, anon;
grant execute on function public.catat_penjualan(jsonb, text, integer, boolean) to authenticated;
