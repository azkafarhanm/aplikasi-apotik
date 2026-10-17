// Isi Struk 58 mm (SPEC 4.9). Hanya menampilkan data; tata letak cetaknya
// diatur struk.module.css dan tinggi kertasnya oleh TombolCetak.
import { apotek } from "@/lib/apotek";
import { tulisRupiah } from "@/lib/katalog";
import { tulisanCaraBayar, tulisWaktuWib, type StrukPenjualan } from "@/lib/penjualan";
import styles from "./struk.module.css";

export function Struk({ struk }: { struk: StrukPenjualan }) {
  const dibatalkan = struk.status === "dibatalkan";

  return (
    <article id="struk" className={styles.struk} aria-label={`Struk ${struk.nomor}`}>
      {dibatalkan && <p className={styles.batal}>DIBATALKAN</p>}

      <header className={styles.kepala}>
        <p className={styles.namaApotek}>{apotek.nama}</p>
        <p>{apotek.alamat}</p>
        {apotek.alamatContoh && <p className={styles.kecil}>(alamat contoh)</p>}
      </header>

      <dl className={`${styles.bagian} ${styles.pasangan}`}>
        <dt>No.</dt>
        <dd>{struk.nomor}</dd>
        <dt>Waktu</dt>
        <dd>{tulisWaktuWib(struk.waktu)}</dd>
        <dt>Kasir</dt>
        <dd>{struk.namaKasir}</dd>
      </dl>

      <ul className={`${styles.bagian} ${styles.item}`}>
        {struk.item.map((i) => (
          <li key={i.nama}>
            <p>{i.nama}</p>
            <p className={styles.baris}>
              <span>
                {i.jumlah} {i.satuan_jual} × {tulisRupiah(i.harga_satuan)}
              </span>
              <span>{tulisRupiah(i.subtotal)}</span>
            </p>
          </li>
        ))}
      </ul>

      <div className={styles.bagian}>
        <p className={`${styles.baris} ${styles.total}`}>
          <span>TOTAL</span>
          <span>{tulisRupiah(struk.total)}</span>
        </p>
        {struk.metode_bayar === "tunai" && struk.uang_diterima !== null && struk.kembalian !== null ? (
          <>
            <p className={styles.baris}>
              <span>Tunai</span>
              <span>{tulisRupiah(struk.uang_diterima)}</span>
            </p>
            <p className={styles.baris}>
              <span>Kembalian</span>
              <span>{tulisRupiah(struk.kembalian)}</span>
            </p>
          </>
        ) : (
          <p className={styles.baris}>
            <span>Bayar</span>
            <span>{tulisanCaraBayar[struk.metode_bayar]}</span>
          </p>
        )}
      </div>

      <footer className={`${styles.bagian} ${styles.penutup}`}>
        <p>Terima kasih.</p>
        <p>Simpan struk ini sebagai bukti pembelian.</p>
      </footer>
    </article>
  );
}
