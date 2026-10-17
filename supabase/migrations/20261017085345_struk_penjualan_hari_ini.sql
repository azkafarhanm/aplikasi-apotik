-- Migrasi 4: Struk dan Penjualan hari ini (tiket #10)
-- Rujukan: docs/SPEC.md 4.2, 4.5, 4.9; docs/penjelasan/05-struk-penjualan-hari-ini.md.
--
-- Tidak ada tabel atau izin tulis baru. Migrasi ini hanya menambah dua
-- tampilan BACA yang tetap tunduk pada RLS penjualan dari migrasi 3:
-- Kasir hanya melihat Penjualan miliknya hari ini, Admin melihat semua.
--
-- Aturan project: objek baru TIDAK otomatis terbuka untuk anon/authenticated,
-- jadi setiap izin (GRANT) ditulis di sini secara eksplisit.

-- ---------------------------------------------------------------------------
-- 1. penjualan_hari_ini: daftar di halaman /staf/penjualan
-- ---------------------------------------------------------------------------
-- RLS Admin mengizinkan membaca SEMUA Penjualan, jadi daftar Admin tetap perlu
-- disaring ke "hari ini". Saringannya ditaruh di sini (memakai private.hari_ini
-- yang sama dengan RLS, kedaluwarsa, dan Ringkasan), bukan di kode Next.js,
-- supaya arti "hari ini menurut WIB" hanya ditulis di satu tempat.
--
-- Saringan ditulis sebagai rentang waktu [00.00 WIB hari ini, 00.00 WIB besok)
-- supaya indeks penjualan (kasir_id, waktu) tetap bisa dipakai.
--
-- security_invoker = true: tampilan membaca tabel dengan hak SI PEMBACA, jadi
-- RLS penjualan dan profil_staf tetap berlaku (Kasir hanya melihat miliknya).
create view public.penjualan_hari_ini
with (security_invoker = true)
as
select
  p.id,
  p.nomor,
  p.waktu,
  p.total,
  p.metode_bayar,
  p.status,
  p.kasir_id,
  s.nama_tampilan as nama_kasir
from public.penjualan p
left join public.profil_staf s on s.id = p.kasir_id
where p.waktu >= (private.hari_ini()::timestamp at time zone 'Asia/Jakarta')
  and p.waktu <  ((private.hari_ini() + 1)::timestamp at time zone 'Asia/Jakarta');

comment on view public.penjualan_hari_ini is
  'Penjualan hari ini (WIB) beserta nama Kasir. Mengikuti RLS: Kasir hanya miliknya, Admin semua.';

revoke all on table public.penjualan_hari_ini from anon, authenticated;
grant select on table public.penjualan_hari_ini to authenticated;

-- ---------------------------------------------------------------------------
-- 2. rincian_struk: Item penjualan beserta nama obat, untuk Struk
-- ---------------------------------------------------------------------------
-- Masalah: Kasir hanya boleh membaca obat yang TIDAK diarsipkan (RLS obat).
-- Bila obat diarsipkan Admin (tiket #9) setelah terjual pagi tadi, Struk yang
-- dicetak ulang Kasir sore harinya akan kehilangan nama obatnya.
--
-- Jalan keluar: nama dan Satuan jual dibaca lewat fungsi kecil yang berjalan
-- dengan hak pemiliknya (security definer). Fungsi ini hanya dipanggil dari
-- tampilan di bawah, untuk Item penjualan yang memang sudah lolos RLS si
-- pembaca. Tinggal di skema private, jadi tidak bisa dipanggil lewat API.
-- Yang terbuka hanya nama dan Satuan jual; stok dan harga acuan tidak.
create function private.obat_untuk_struk(id_obat bigint)
returns table (nama text, satuan_jual text)
language sql
stable
security definer
set search_path = ''
as $$
  select o.nama, o.satuan_jual from public.obat o where o.id = id_obat;
$$;

comment on function private.obat_untuk_struk(bigint) is
  'Nama dan Satuan jual obat untuk Struk, termasuk obat yang sudah diarsipkan.';

revoke all on function private.obat_untuk_struk(bigint) from public;
grant execute on function private.obat_untuk_struk(bigint) to authenticated;

create view public.rincian_struk
with (security_invoker = true)
as
select
  i.id,
  i.penjualan_id,
  i.obat_id,
  o.nama,
  o.satuan_jual,
  i.jumlah,
  i.harga_satuan,
  i.subtotal
from public.item_penjualan i
cross join lateral private.obat_untuk_struk(i.obat_id) o;

comment on view public.rincian_struk is
  'Item penjualan untuk Struk (nama obat, jumlah, harga saat terjual). Mengikuti RLS item_penjualan.';

revoke all on table public.rincian_struk from anon, authenticated;
grant select on table public.rincian_struk to authenticated;
