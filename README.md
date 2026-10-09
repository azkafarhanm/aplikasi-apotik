# ApotikKu

Sistem informasi satu apotek: **Katalog** publik untuk Pengunjung (tanpa login) dan **Area staf** untuk Admin dan Kasir. Project mata kuliah Rekayasa Perangkat Lunak.

- Produk dan kebutuhan: [`docs/PRD.md`](docs/PRD.md)
- Cara membangun: [`docs/SPEC.md`](docs/SPEC.md)
- Alasan setiap keputusan: [`docs/KENAPA.md`](docs/KENAPA.md) dan [`docs/adr/`](docs/adr/)
- Penjelasan kode untuk orang awam: [`docs/penjelasan/`](docs/penjelasan/)
- Istilah: [`CONTEXT.md`](CONTEXT.md)

## Menjalankan di laptop

Butuh Node.js 22.

```bash
npm install
cp .env.example .env.local   # isi alamat + kunci publik Supabase
npm run dev                  # buka http://localhost:3000
npm test                     # tes database ke project apotikku-uji
```

Kode HTML versi 1 tersimpan di tag `v1-html`.
