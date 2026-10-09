// Satu kartu obat berbentuk etiket apotek (ADR 0004, SPEC 4.7).
// Urutan isi: Keluhan, Satuan jual + isi, tanda golongan, nama, Bentuk,
// tulisan golongan, Status stok, harga jual.
import {
  tulisanBentuk,
  tulisanGolongan,
  tulisanKeluhan,
  tulisanStatusStok,
  tulisRupiah,
  tulisSatuan,
  type ObatKatalog,
} from "@/lib/katalog";
import { TandaGolongan } from "./TandaGolongan";
import styles from "./KartuEtiket.module.css";

export function KartuEtiket({ obat }: { obat: ObatKatalog }) {
  return (
    <article
      className={styles.kartu}
      data-status={obat.status_stok}
      aria-labelledby={`nama-${obat.slug}`}
    >
      <header className={styles.kepala}>
        <span className={styles.keluhan}>{tulisanKeluhan[obat.keluhan] ?? obat.keluhan}</span>
        <span className={styles.satuan}>{tulisSatuan(obat.satuan_jual, obat.isi_per_satuan)}</span>
      </header>

      <div className={styles.badan}>
        <TandaGolongan golongan={obat.golongan} />
        <div>
          <h2 id={`nama-${obat.slug}`} className={styles.nama}>
            {obat.nama}
          </h2>
          <p className={styles.bentuk}>{tulisanBentuk[obat.bentuk] ?? obat.bentuk}</p>
          <p className={styles.golongan} data-golongan={obat.golongan}>
            {tulisanGolongan[obat.golongan]}
          </p>
        </div>
      </div>

      <footer className={styles.kaki}>
        <span className={styles.status}>
          <span className={styles.titikStatus} aria-hidden="true" />
          {tulisanStatusStok[obat.status_stok]}
        </span>
        <span className={styles.harga}>{tulisRupiah(obat.harga_jual)}</span>
      </footer>
    </article>
  );
}
