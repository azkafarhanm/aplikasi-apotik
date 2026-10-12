// Isi sementara halaman Area staf yang belum dibangun. Setiap halaman diisi
// oleh tiketnya sendiri (urutan di issue #1).
import styles from "@/app/staf/staf.module.css";

export function Kerangka({
  judul,
  keterangan,
  tiket,
}: {
  judul: string;
  keterangan: string;
  tiket: number;
}) {
  return (
    <>
      <h1 className={styles.judul}>{judul}</h1>
      <div className={styles.kerangka}>
        <p>{keterangan}</p>
        <p className={styles.tiket}>Dibangun di tiket #{tiket}.</p>
      </div>
    </>
  );
}
