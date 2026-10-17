// Daftar Penjualan hari ini beserta jumlahnya (F-08). Hanya menampilkan data;
// isinya (milik siapa, hari apa) sudah ditentukan database.
import Link from "next/link";
import { tulisRupiah } from "@/lib/katalog";
import {
  tulisanCaraBayar,
  tulisanStatusPenjualan,
  tulisJamWib,
  type BarisPenjualanHariIni,
} from "@/lib/penjualan";
import styles from "./penjualan.module.css";

export function TabelPenjualan({
  daftar,
  tampilkanKasir,
}: {
  daftar: BarisPenjualanHariIni[];
  /** Admin melihat Penjualan semua Kasir, jadi perlu kolom Kasir. */
  tampilkanKasir: boolean;
}) {
  if (daftar.length === 0) {
    return <p className={styles.kosong}>Belum ada Penjualan hari ini.</p>;
  }

  // Penjualan Dibatalkan tetap tampil (aturan bisnis 7) tetapi tidak dihitung.
  const selesai = daftar.filter((p) => p.status === "selesai");
  const jumlahDibatalkan = daftar.length - selesai.length;
  const total = selesai.reduce((jumlah, p) => jumlah + p.total, 0);

  return (
    <>
      <p className={styles.jumlah}>
        <strong>{selesai.length}</strong> Penjualan · <strong>{tulisRupiah(total)}</strong>
        {jumlahDibatalkan > 0 && (
          <span className={styles.catatan}> ({jumlahDibatalkan} dibatalkan, tidak dihitung)</span>
        )}
      </p>

      <div className={styles.bungkusTabel}>
        <table className={styles.tabel}>
          <thead>
            <tr>
              <th scope="col">Nomor</th>
              <th scope="col">Jam</th>
              {tampilkanKasir && <th scope="col">Kasir</th>}
              <th scope="col">Cara bayar</th>
              <th scope="col" className={styles.angka}>
                Total
              </th>
              <th scope="col">Status</th>
              <th scope="col">
                <span className={styles.tersembunyi}>Struk</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {daftar.map((p) => (
              <tr key={p.nomor} className={p.status === "dibatalkan" ? styles.dibatalkan : undefined}>
                <td className={styles.nomor}>{p.nomor}</td>
                <td className={styles.nomor}>{tulisJamWib(p.waktu)}</td>
                {tampilkanKasir && <td>{p.nama_kasir ?? "Staf"}</td>}
                <td>{tulisanCaraBayar[p.metode_bayar]}</td>
                <td className={`${styles.angka} ${styles.nomor}`}>{tulisRupiah(p.total)}</td>
                <td>
                  <span className={styles.status}>{tulisanStatusPenjualan[p.status]}</span>
                </td>
                <td>
                  <Link href={`/staf/penjualan/${p.nomor}/struk`} className={styles.struk}>
                    Struk
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
