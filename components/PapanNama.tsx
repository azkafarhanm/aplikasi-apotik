// Papan nama hijau di atas halaman publik: Katalog dan Detail obat (ADR 0004).
//
// Dipakai bersama supaya Pengunjung yang membuka tautan Detail obat langsung
// dari WhatsApp tetap melihat ia sedang berada di ApotikKu, dan tetap punya
// jalan masuk ke Area staf.
//
// `judul` sengaja boleh kosong: di Detail obat, judul halaman (h1) adalah nama
// obatnya, jadi papan nama tidak boleh menambah h1 kedua.
import Link from "next/link";
import { LogoApotikKu } from "@/components/LogoApotikKu";
import styles from "./PapanNama.module.css";

export function PapanNama({ judul, subjudul }: { judul?: string; subjudul?: string }) {
  return (
    <header className={styles.papanNama}>
      <div className={styles.lebar}>
        <div className={styles.barisMerek}>
          <p className={styles.merek}>
            <Link href="/" className={styles.tautanMerek}>
              <LogoApotikKu />
              <span className={styles.namaMerek}>ApotikKu</span>
            </Link>
          </p>
          {/* Tautan untuk Staf, di atas supaya tidak perlu menggulir melewati
              semua kartu obat (#24). Sengaja kecil dan pudar agar tidak
              mengalihkan Pengunjung. Bukan pengamanan apa pun: Area staf
              dijaga login dan RLS, bukan oleh alamat yang dirahasiakan. */}
          <Link href="/masuk" className={styles.masukStaf}>
            Masuk Staf
          </Link>
        </div>

        {judul && (
          <>
            <h1 className={styles.judul}>{judul}</h1>
            {subjudul && <p className={styles.subjudul}>{subjudul}</p>}
          </>
        )}
      </div>
    </header>
  );
}
