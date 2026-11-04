-- Migrasi 6: Ringkasan untuk Admin (tiket #11)
-- Rujukan: docs/SPEC.md 4.3 (Status stok, kedaluwarsa), 4.4 (ringkasan), 4.5;
-- ADR 0003; docs/penjelasan/09-ringkasan.md.
--
-- Tidak ada tabel atau izin tulis baru. Migrasi ini hanya menambah SATU fungsi
-- baca yang mengecek sendiri pemanggilnya (Admin aktif).
--
-- Aturan project: objek baru TIDAK otomatis terbuka untuk anon/authenticated,
-- jadi setiap izin (GRANT) ditulis di sini secara eksplisit.

-- ---------------------------------------------------------------------------
-- ringkasan(): kondisi apotek hari ini dalam satu panggilan (SPEC 4.4)
-- ---------------------------------------------------------------------------
-- Mengembalikan JSON berisi:
--   pendapatan         : jumlah rupiah Penjualan HARI INI yang berstatus selesai
--   jumlah_penjualan   : banyaknya Penjualan itu
--   hampir_habis       : obat dengan stok <= 20 (termasuk stok 0), urut stok
--   segera_kedaluwarsa : kedaluwarsa hari ini s/d 90 hari lagi, urut tanggal,
--                        beserta sisa_hari (0 = hari ini)
--   sudah_kedaluwarsa  : kedaluwarsa sebelum hari ini, urut tanggal, beserta
--                        lewat_hari (1 = kemarin)
--
-- "Hari ini" dan "sudah kedaluwarsa" memakai private.hari_ini() dan
-- private.sudah_kedaluwarsa(), fungsi yang sama dengan Katalog, layar Jual,
-- dan Penjualan hari ini. Jadi arti "hari ini menurut WIB" tetap di satu
-- tempat dan tidak mungkin berbeda antar halaman (SPEC 4.3).
--
-- Penjualan Dibatalkan TIDAK dihitung sebagai pendapatan (aturan bisnis 7,
-- tiket #13), karena hanya status 'selesai' yang dijumlahkan.
--
-- Obat yang diarsipkan tidak ikut di ketiga daftar: obat itu sudah tidak
-- dijual, jadi tidak perlu dipesan ulang maupun ditarik dari rak.
--
-- Sisa hari ikut dihitung DI SINI, bukan di layar, karena "hari ini" menurut
-- WIB sudah dimiliki database. Kalau dihitung di browser, hasilnya bergantung
-- pada jam komputer Admin dan bisa meleset sehari.
--
-- Batas yang dipakai mengikuti PRD aturan bisnis 1 dan 2:
--   stok <= 20                      -> perlu dipesan ulang
--   kedaluwarsa <= 90 hari lagi     -> Segera kedaluwarsa (90 masuk, 91 tidak)
--
-- security definer: Admin memang boleh membaca tabel obat dan penjualan, tetapi
-- fungsi ini tetap berjalan dengan hak pemiliknya supaya aturannya seragam
-- dengan fungsi lain dan tidak bergantung pada RLS yang bisa berubah. Karena
-- itu fungsi mengecek sendiri pemanggilnya dan memakai search_path kosong
-- (semua nama tabel ditulis lengkap) supaya tidak bisa dibelokkan.
create function public.ringkasan()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  hari         date := private.hari_ini();
  mulai        timestamptz := (hari::timestamp at time zone 'Asia/Jakarta');
  sampai       timestamptz := ((hari + 1)::timestamp at time zone 'Asia/Jakarta');
  pendapatan_  bigint;
  jumlah_      bigint;
begin
  if private.peran_saya() is distinct from 'admin' then
    raise exception 'Hanya Admin yang bisa melihat Ringkasan.';
  end if;

  select coalesce(sum(p.total), 0), count(*)
    into pendapatan_, jumlah_
    from public.penjualan p
   where p.status = 'selesai'
     and p.waktu >= mulai
     and p.waktu <  sampai;

  return jsonb_build_object(
    'pendapatan',       pendapatan_,
    'jumlah_penjualan', jumlah_,

    'hampir_habis', coalesce((
      select jsonb_agg(baris order by baris->>'urut')
        from (
          select jsonb_build_object(
                   'urut',                lpad(o.stok::text, 6, '0') || o.nama,
                   'id',                  o.id,
                   'nama',                o.nama,
                   'stok',                o.stok,
                   'satuan_jual',         o.satuan_jual,
                   'tanggal_kedaluwarsa', o.tanggal_kedaluwarsa
                 ) as baris
            from public.obat o
           where not o.diarsipkan
             and o.stok <= 20
        ) s
    ), '[]'::jsonb),

    'segera_kedaluwarsa', coalesce((
      select jsonb_agg(baris order by baris->>'urut')
        from (
          select jsonb_build_object(
                   'urut',                o.tanggal_kedaluwarsa::text || o.nama,
                   'id',                  o.id,
                   'nama',                o.nama,
                   'stok',                o.stok,
                   'satuan_jual',         o.satuan_jual,
                   'tanggal_kedaluwarsa', o.tanggal_kedaluwarsa,
                   'sisa_hari',           o.tanggal_kedaluwarsa - hari
                 ) as baris
            from public.obat o
           where not o.diarsipkan
             and o.tanggal_kedaluwarsa >= hari
             and o.tanggal_kedaluwarsa <= hari + 90
        ) s
    ), '[]'::jsonb),

    'sudah_kedaluwarsa', coalesce((
      select jsonb_agg(baris order by baris->>'urut')
        from (
          select jsonb_build_object(
                   'urut',                o.tanggal_kedaluwarsa::text || o.nama,
                   'id',                  o.id,
                   'nama',                o.nama,
                   'stok',                o.stok,
                   'satuan_jual',         o.satuan_jual,
                   'tanggal_kedaluwarsa', o.tanggal_kedaluwarsa,
                   'lewat_hari',          hari - o.tanggal_kedaluwarsa
                 ) as baris
            from public.obat o
           where not o.diarsipkan
             and private.sudah_kedaluwarsa(o.tanggal_kedaluwarsa)
        ) s
    ), '[]'::jsonb)
  );
end;
$$;

comment on function public.ringkasan() is
  'Kondisi apotek hari ini untuk Admin: pendapatan, jumlah Penjualan, obat Hampir habis, Segera kedaluwarsa, Sudah kedaluwarsa.';

-- Pengunjung (anon) tidak boleh memanggil; hanya akun yang login. Siapa yang
-- boleh di antara mereka (Admin aktif) dicek di dalam fungsi.
-- Pemeriksa keamanan Supabase memberi peringatan "Signed-In Users Can Execute
-- SECURITY DEFINER Function" untuk fungsi ini. Itu disengaja, sama seperti
-- catat_penjualan dan batalkan_penjualan, dan dijaga tes tests/ringkasan.test.ts
-- (Kasir, Staf nonaktif, dan Pengunjung ditolak).
revoke all on function public.ringkasan() from public, anon;
grant execute on function public.ringkasan() to authenticated;
