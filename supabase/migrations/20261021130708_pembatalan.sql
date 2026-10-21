-- Migrasi 5: Pembatalan Penjualan (tiket #13)
-- Rujukan: docs/SPEC.md 4.4 (batalkan_penjualan), 4.5, 4.9; ADR 0003 dan 0005;
-- docs/penjelasan/06-pembatalan.md.
--
-- Tidak ada izin UPDATE langsung ke tabel penjualan untuk siapa pun. Satu-
-- satunya cara membatalkan adalah fungsi batalkan_penjualan di bawah.
--
-- Aturan project: objek baru TIDAK otomatis terbuka untuk anon/authenticated,
-- jadi setiap izin (GRANT) ditulis di sini secara eksplisit.

-- ---------------------------------------------------------------------------
-- 1. batalkan_penjualan: satu-satunya pintu Pembatalan (SPEC 4.4)
-- ---------------------------------------------------------------------------
-- nomor  : Nomor Penjualan, misalnya 'PJ-000123'
-- alasan : wajib, 1-200 huruf setelah spasi/baris kosong di ujung dibuang
--
-- Urutan cek (berhenti di pelanggaran pertama, RAISE EXCEPTION kode P0001):
--   1. Admin aktif           -> Kasir tidak bisa menebak nomor mana yang ada
--   2. alasan kosong / > 200 -> tidak butuh data, jadi dicek sebelum mengunci
--   3. kunci baris Penjualan -> dua Admin membatalkan bersamaan: yang kedua
--                               menunggu, lalu melihat status "dibatalkan"
--   4. nomor tidak ada, sudah Dibatalkan, bukan hari ini (WIB)
--   5. kunci baris obat URUT ID (ADR 0005), kembalikan stok, tandai Dibatalkan
--
-- Hanya Penjualan HARI INI yang bisa dibatalkan: obat Penjualan kemarin sudah
-- dibawa pulang pembeli dan uangnya sudah dihitung, jadi "mengembalikan stok"
-- membuat angka tidak cocok dengan rak, dan Laporan hari itu berubah diam-diam.
--
-- Stok tetap dikembalikan walau obatnya sudah diarsipkan atau kedaluwarsa:
-- stok adalah jumlah fisik di rak, dan strip yang batal dijual memang kembali.
--
-- security definer: Admin pun tidak punya izin mengubah penjualan secara
-- langsung. Karena itu fungsi mengecek sendiri pemanggilnya dan memakai
-- search_path kosong (semua nama tabel ditulis lengkap).
create function public.batalkan_penjualan(nomor text, alasan text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- Spasi, tab, dan baris kosong di ujung dibuang; yang disimpan sudah rapi.
  alasan_ text := btrim(coalesce(batalkan_penjualan.alasan, ''), E' \t\r\n');
  jual    record;
  item    jsonb;
  waktu_  timestamptz := now();
begin
  -- 1. Pemanggil harus Admin aktif.
  if private.peran_saya() is distinct from 'admin' then
    raise exception 'Hanya Admin yang bisa membatalkan Penjualan.';
  end if;

  -- 2. Alasan.
  if alasan_ = '' then
    raise exception 'Tulis alasan pembatalan.';
  end if;
  if char_length(alasan_) > 200 then
    raise exception 'Alasan pembatalan paling panjang 200 huruf.';
  end if;

  -- 3. Kunci baris Penjualan, lalu cek keadaannya (angkanya pasti terbaru).
  select p.id, p.nomor, p.status, p.waktu
    into jual
    from public.penjualan p
   where p.nomor = batalkan_penjualan.nomor
     for update;

  if not found then
    raise exception 'Penjualan % tidak ditemukan.', coalesce(batalkan_penjualan.nomor, '');
  end if;
  if jual.status = 'dibatalkan' then
    raise exception '% sudah dibatalkan sebelumnya.', jual.nomor;
  end if;
  if (jual.waktu at time zone 'Asia/Jakarta')::date <> private.hari_ini() then
    raise exception '% bukan Penjualan hari ini, jadi tidak bisa dibatalkan.', jual.nomor;
  end if;

  -- 4. Kunci baris obat urut id (ADR 0005), sama dengan catat_penjualan,
  -- supaya Pembatalan dan Penjualan yang menyentuh obat yang sama antre
  -- dengan urutan yang sama dan tidak saling menunggu selamanya.
  perform 1
     from public.obat o
    where o.id in (select i.obat_id from public.item_penjualan i where i.penjualan_id = jual.id)
    order by o.id
      for update;

  -- 5. Kembalikan stok setiap Item penjualan, lalu tandai Dibatalkan.
  update public.obat o
     set stok = o.stok + i.jumlah
    from public.item_penjualan i
   where i.penjualan_id = jual.id
     and o.id = i.obat_id;

  update public.penjualan p
     set status          = 'dibatalkan',
         dibatalkan_oleh = (select auth.uid()),
         dibatalkan_pada = waktu_,
         alasan_batal    = alasan_
   where p.id = jual.id;

  -- Rincian stok yang kembali, untuk pesan di layar Admin.
  select jsonb_agg(
           jsonb_build_object(
             'nama',        o.nama,
             'satuan_jual', o.satuan_jual,
             'jumlah',      i.jumlah
           ) order by o.id)
    into item
    from public.item_penjualan i
    join public.obat o on o.id = i.obat_id
   where i.penjualan_id = jual.id;

  return jsonb_build_object(
    'nomor',           jual.nomor,
    'dibatalkan_pada', waktu_,
    'alasan',          alasan_,
    'item',            coalesce(item, '[]'::jsonb)
  );
end;
$$;

comment on function public.batalkan_penjualan(text, text) is
  'Satu-satunya cara membatalkan Penjualan: hanya Admin, hanya hari ini, alasan wajib, stok dikembalikan, utuh atau tidak sama sekali.';

-- Pengunjung (anon) tidak boleh memanggil; hanya akun yang login. Siapa yang
-- boleh di antara mereka (Admin aktif) dicek di dalam fungsi.
-- Pemeriksa keamanan Supabase memberi peringatan "Signed-In Users Can Execute
-- SECURITY DEFINER Function" untuk fungsi ini. Itu disengaja, sama seperti
-- catat_penjualan: inilah satu-satunya pintu Pembatalan, dan dijaga tes
-- tests/pembatalan.test.ts (Kasir, Staf nonaktif, dan Pengunjung ditolak).
revoke all on function public.batalkan_penjualan(text, text) from public, anon;
grant execute on function public.batalkan_penjualan(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 2. penjualan_hari_ini: tambah kapan, oleh siapa, dan alasan Pembatalan
-- ---------------------------------------------------------------------------
-- Kolom lama tetap di tempatnya; kolom baru ditambahkan di ujung.
-- nama_pembatal dibaca lewat RLS profil_staf si pembaca: Admin melihat nama
-- Admin yang membatalkan; Kasir hanya boleh membaca profilnya sendiri, jadi
-- mendapat kosong, dan layar menulis "Admin" (hanya Admin yang bisa
-- membatalkan, jadi tulisan itu pasti benar tanpa membuka data baru).
create or replace view public.penjualan_hari_ini
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
  s.nama_tampilan as nama_kasir,
  p.dibatalkan_pada,
  p.alasan_batal,
  b.nama_tampilan as nama_pembatal
from public.penjualan p
left join public.profil_staf s on s.id = p.kasir_id
left join public.profil_staf b on b.id = p.dibatalkan_oleh
where p.waktu >= (private.hari_ini()::timestamp at time zone 'Asia/Jakarta')
  and p.waktu <  ((private.hari_ini() + 1)::timestamp at time zone 'Asia/Jakarta');

comment on view public.penjualan_hari_ini is
  'Penjualan hari ini (WIB) beserta nama Kasir dan data Pembatalan. Mengikuti RLS: Kasir hanya miliknya, Admin semua.';
