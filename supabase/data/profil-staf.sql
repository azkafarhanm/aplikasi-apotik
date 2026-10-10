-- Profil Staf untuk project apotikku (tiket #6). Dipasang setelah migrasi.
--
-- Akun login dibuat dulu oleh pemilik project lewat dasbor Supabase
-- (Authentication → Users → Add user, centang "Auto Confirm User"):
--   admin@apotikku.test (Admin) dan kasir@apotikku.test (Kasir)
-- Password tidak pernah ditulis di repo atau dikirim lewat chat.
--
-- Menambah Staf baru: buat akunnya di dasbor, lalu tambahkan satu baris di
-- bawah dan jalankan ulang file ini. Staf yang berhenti TIDAK dihapus; ubah
-- `aktif` menjadi false (aturan bisnis 7). Kelola akun dari dalam aplikasi
-- dijadwalkan di milestone 2.
insert into public.profil_staf (id, nama_tampilan, peran, aktif)
select u.id, p.nama_tampilan, p.peran, p.aktif
  from (values
    ('admin@apotikku.test', 'Admin', 'admin', true),
    ('kasir@apotikku.test', 'Kasir 1', 'kasir', true)
  ) as p (email, nama_tampilan, peran, aktif)
  join auth.users u on u.email = p.email
on conflict (id) do update
  set nama_tampilan = excluded.nama_tampilan,
      peran         = excluded.peran,
      aktif         = excluded.aktif;
