# Catatan Keputusan (ADR)

Setiap file di folder ini mencatat **satu** keputusan penting: konteks, keputusan, pilihan yang ditolak, konsekuensi, dan jawaban untuk pertanyaan lanjutan ("Kalau dosen bertanya…"). Ringkasan semuanya ada di [`../KENAPA.md`](../KENAPA.md).

| No | Keputusan | Status |
|---|---|---|
| [0001](0001-nextjs-supabase-vercel.md) | Next.js + Supabase + Vercel | Diterima |
| [0002](0002-katalog-publik-dan-area-staf.md) | Katalog publik + Area staf | Diterima |
| [0003](0003-peran-admin-kasir-rls.md) | Peran Admin & Kasir, RLS sejak awal | Diterima |
| [0004](0004-visual-etiket-apotek.md) | Visual "etiket apotek" | Diterima |
| [0005](0005-kunci-baris-obat-saat-penjualan.md) | Stok dijaga dengan mengunci baris obat saat Penjualan | Diterima |
| [0006](0006-logo.md) | Logo ApotikKu: palang putih di kotak hijau bersudut terlipat | Diterima |

## Aturan menulis ADR baru

1. Nomor urut berikutnya, nama file `NNNN-judul-singkat.md`.
2. ADR yang sudah diterima **tidak diedit isinya**. Kalau keputusan berubah, tulis ADR baru dan ubah status yang lama menjadi "Digantikan oleh ADR NNNN". Menambah sumber atau meluruskan fakta pendukung tanpa mengubah keputusan boleh dilakukan langsung.
3. Setiap istilah teknis diberi arti awam dan analogi.
