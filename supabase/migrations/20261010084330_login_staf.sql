-- Migrasi 2: profil Staf, fungsi peran_saya, hak baca obat untuk Staf (tiket #6)
-- Rujukan: docs/SPEC.md 4.3 (profil_staf), 4.4 (peran_saya), 4.5, 4.6; ADR 0003.
--
-- Aturan project: tabel baru TIDAK otomatis terbuka untuk anon/authenticated,
-- jadi setiap izin (GRANT) ditulis di sini secara eksplisit.

-- ---------------------------------------------------------------------------
-- 1. Tabel profil_staf: satu baris per akun Staf
-- ---------------------------------------------------------------------------
-- Akun login (email + password) disimpan Supabase di auth.users. Tabel ini
-- menambahkan hal yang khusus ApotikKu: nama di layar/Struk, peran, dan aktif.
-- Akun TIDAK dihapus (aturan bisnis 7): Staf yang berhenti dinonaktifkan.
-- Karena itu rujukan ke auth.users memakai "restrict": akun login yang masih
-- punya profil tidak bisa dihapus dari dasbor sebelum profilnya diurus.
create table public.profil_staf (
  id            uuid primary key references auth.users (id) on delete restrict,
  nama_tampilan text not null check (btrim(nama_tampilan) <> ''),
  peran         text not null check (peran in ('admin', 'kasir')),
  aktif         boolean not null default true,
  dibuat_pada   timestamptz not null default now()
);

comment on table public.profil_staf is
  'Peran dan status setiap akun Staf. Diisi lewat dasbor/SQL, tidak bisa diubah dari aplikasi (SPEC 4.5).';

-- ---------------------------------------------------------------------------
-- 2. peran_saya(): peran Staf aktif yang sedang login, atau kosong
-- ---------------------------------------------------------------------------
-- Dipakai oleh aturan RLS di semua tabel. Tinggal di skema private supaya
-- tidak menjadi alamat API (sama seperti status_stok, SPEC 4.3).
--
-- security definer = fungsi membaca profil_staf dengan hak pemiliknya. Ini
-- perlu karena aturan RLS profil_staf sendiri memanggil fungsi ini; tanpa
-- security definer, fungsi akan terkena aturan yang sedang dicek (berputar).
-- Aman karena fungsi hanya pernah mengembalikan peran MILIK PEMANGGIL.
create function private.peran_saya()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select peran
    from public.profil_staf
   where id = (select auth.uid())
     and aktif;
$$;

comment on function private.peran_saya() is
  'admin | kasir untuk Staf aktif yang sedang login; kosong (null) untuk Pengunjung dan Staf nonaktif.';

revoke all on function private.peran_saya() from public;
grant execute on function private.peran_saya() to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Hak akses profil_staf (SPEC 4.5)
-- ---------------------------------------------------------------------------
alter table public.profil_staf enable row level security;

revoke all on table public.profil_staf from anon, authenticated;
-- Hanya izin membaca. Tidak ada izin tambah/ubah/hapus untuk siapa pun dari
-- aplikasi: akun Staf dikelola lewat dasbor Supabase sampai milestone 2.
grant select on table public.profil_staf to authenticated;

-- Setiap Staf membaca profilnya sendiri (termasuk Staf nonaktif, supaya
-- halaman bisa menampilkan "Akun ini sudah tidak aktif. Hubungi Admin.").
-- Admin aktif membaca profil semua Staf.
create policy "Staf membaca profilnya sendiri, Admin membaca semua"
  on public.profil_staf
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or (select private.peran_saya()) = 'admin'
  );

-- ---------------------------------------------------------------------------
-- 4. Hak baca tabel obat untuk Staf (SPEC 4.5)
-- ---------------------------------------------------------------------------
-- Kasir: obat yang tidak diarsipkan (termasuk stok persis dan harga acuan,
-- PRD bagian 4). Admin: semua obat. Staf nonaktif: tidak ada.
-- Izin mengubah obat untuk Admin ditambahkan bersama tiket #9 (Kelola obat).
grant select on table public.obat to authenticated;

create policy "Kasir membaca obat yang tidak diarsipkan, Admin membaca semua"
  on public.obat
  for select
  to authenticated
  using (
    (select private.peran_saya()) = 'admin'
    or ((select private.peran_saya()) = 'kasir' and not diarsipkan)
  );

-- ---------------------------------------------------------------------------
-- 5. Tutup fungsi bawaan rls_auto_enable() dari API
-- ---------------------------------------------------------------------------
-- Pengaturan Supabase "automatic RLS" membuat fungsi public.rls_auto_enable()
-- (dipicu otomatis setiap ada tabel baru). Fungsi ini berjalan dengan hak
-- penuh (security definer) dan, karena ada di skema public, ikut terbuka
-- sebagai alamat API yang bisa dipanggil anon/authenticated. Pemicunya tetap
-- bekerja tanpa izin EXECUTE untuk mereka, jadi izinnya dicabut.
-- Dibungkus pengecekan karena project yang dibangun dari migrasi saja (tanpa
-- pengaturan itu) tidak punya fungsi ini.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke all on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;
