-- Migrasi 1: tabel obat, fungsi status_stok, tampilan katalog (tiket #2)
-- Rujukan: docs/SPEC.md 4.3 dan 4.5, ADR 0002 dan 0003.
--
-- Aturan project: tabel baru TIDAK otomatis terbuka untuk anon/authenticated,
-- jadi setiap izin (GRANT) ditulis di sini secara eksplisit.

-- ---------------------------------------------------------------------------
-- 0. Skema private: tempat fungsi bantu
-- ---------------------------------------------------------------------------
-- Supabase hanya membuka skema public ke internet (lewat API). Fungsi di skema
-- private tidak bisa dipanggil langsung oleh siapa pun dari luar, tetapi tetap
-- bisa dipakai oleh tampilan dan aturan di dalam database.
-- PostgreSQL mengecek izin FUNGSI di dalam tampilan memakai hak si pembaca
-- (bukan pemilik tampilan), jadi anon perlu izin EXECUTE di sini.
create schema private;

revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 1. "Hari ini" menurut WIB
-- ---------------------------------------------------------------------------
-- Server database memakai UTC (7 jam di belakang WIB). Semua aturan tanggal
-- (kedaluwarsa, Penjualan hari ini, laporan) memakai fungsi ini supaya sama.
create function private.hari_ini()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'Asia/Jakarta')::date;
$$;

comment on function private.hari_ini() is
  'Tanggal hari ini menurut WIB (Asia/Jakarta), bukan UTC.';

-- ---------------------------------------------------------------------------
-- 2. Tabel obat
-- ---------------------------------------------------------------------------
create table public.obat (
  id                  bigint generated always as identity primary key,
  slug                text not null unique,
  nama                text not null check (btrim(nama) <> ''),
  bentuk              text not null check (bentuk in (
                        'tablet', 'kapsul', 'tablet_kunyah', 'sirup', 'salep',
                        'krim', 'cairan', 'serbuk', 'tetes')),
  keluhan             text not null check (keluhan in (
                        'demam_nyeri', 'batuk_flu', 'maag_pencernaan',
                        'alergi', 'luka_kulit', 'vitamin')),
  golongan            text not null check (golongan in (
                        'bebas', 'bebas_terbatas', 'keras')),
  satuan_jual         text not null check (satuan_jual in (
                        'strip', 'botol', 'tube', 'sachet')),
  isi_per_satuan      text not null check (btrim(isi_per_satuan) <> ''),
  kegunaan            text not null check (btrim(kegunaan) <> ''),
  -- Uang = bilangan bulat rupiah (SPEC 4.3).
  harga_jual          integer not null check (harga_jual > 0),
  harga_acuan         integer check (harga_acuan > 0),
  stok                integer not null check (stok >= 0),
  tanggal_kedaluwarsa date not null,
  diarsipkan          boolean not null default false,
  dibuat_pada         timestamptz not null default now(),
  diubah_pada         timestamptz not null default now()
);

comment on table public.obat is
  'Data lengkap obat. Pengunjung tidak boleh membaca tabel ini; mereka membaca tampilan katalog.';

-- slug dibuat otomatis dari nama saat obat ditambahkan, dan tidak pernah
-- berubah walau nama diubah, supaya tautan yang sudah dibagikan tetap jalan.
create function private.obat_atur_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  dasar text;
begin
  if tg_op = 'UPDATE' then
    new.slug := old.slug;
    new.diubah_pada := now();
    return new;
  end if;

  dasar := btrim(regexp_replace(lower(new.nama), '[^a-z0-9]+', '-', 'g'), '-');
  if dasar = '' then
    dasar := 'obat';
  end if;

  -- Nama kembar mendapat akhiran nomor id, misalnya "parasetamol-500-mg-12".
  if exists (select 1 from public.obat where slug = dasar) then
    dasar := dasar || '-' || new.id;
  end if;

  new.slug := dasar;
  return new;
end;
$$;

create trigger obat_atur_slug
  before insert or update on public.obat
  for each row execute function private.obat_atur_slug();

-- ---------------------------------------------------------------------------
-- 3. Status stok: dihitung di satu tempat (SPEC 4.3, PRD aturan bisnis 1–2)
-- ---------------------------------------------------------------------------
create function private.status_stok(stok integer, tanggal_kedaluwarsa date)
returns text
language sql
stable
set search_path = ''
as $$
  select case
    when tanggal_kedaluwarsa < private.hari_ini() then 'habis'
    when stok <= 0                                  then 'habis'
    when stok <= 20                                 then 'hampir_habis'
    else                                                 'tersedia'
  end;
$$;

comment on function private.status_stok(integer, date) is
  'habis | hampir_habis | tersedia. Sudah kedaluwarsa selalu habis.';

-- ---------------------------------------------------------------------------
-- 4. Tampilan katalog: satu-satunya pintu untuk Pengunjung
-- ---------------------------------------------------------------------------
-- security_invoker = false berarti tampilan membaca tabel obat dengan hak
-- pemiliknya, sehingga bisa menghitung Status stok dari kolom stok TANPA
-- memperlihatkan angka stok, harga acuan, atau tanggal kedaluwarsa. Pemeriksa
-- keamanan Supabase akan memberi peringatan "security definer view"; itu
-- disengaja (SPEC 4.3) dan dijaga oleh tes tests/katalog.test.ts.
create view public.katalog
with (security_invoker = false)
as
select
  slug,
  nama,
  bentuk,
  keluhan,
  golongan,
  satuan_jual,
  isi_per_satuan,
  kegunaan,
  harga_jual,
  private.status_stok(stok, tanggal_kedaluwarsa) as status_stok
from public.obat
where not diarsipkan;

comment on view public.katalog is
  'Obat yang tidak diarsipkan, hanya kolom yang aman untuk Pengunjung.';

-- ---------------------------------------------------------------------------
-- 5. Hak akses (RLS + GRANT)
-- ---------------------------------------------------------------------------
-- RLS dinyalakan sejak awal (ADR 0003). Belum ada policy untuk Staf: aturan
-- baca Kasir/Admin ditambahkan bersama tiket login Staf. Sampai saat itu,
-- tidak ada akun aplikasi yang bisa membaca tabel obat secara langsung.
alter table public.obat enable row level security;

revoke all on table public.obat from anon, authenticated;
revoke all on table public.katalog from anon, authenticated;
grant select on table public.katalog to anon, authenticated;

-- Fungsi bantu: hanya boleh dipakai di dalam database (tampilan, aturan).
revoke all on function private.hari_ini() from public;
revoke all on function private.status_stok(integer, date) from public;
revoke all on function private.obat_atur_slug() from public;
grant execute on function private.hari_ini() to anon, authenticated;
grant execute on function private.status_stok(integer, date) to anon, authenticated;
