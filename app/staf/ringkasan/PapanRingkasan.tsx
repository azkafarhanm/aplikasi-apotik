// Tampilan Ringkasan: hanya menampilkan data yang sudah dihitung database
// (#11). Dipisah dari page.tsx supaya tata letaknya bisa dicoba sendiri tanpa
// login, dan supaya pengambilan data dan tampilan tidak bercampur.
import { tulisRupiah } from "@/lib/katalog";
import { tulisTanggalWib } from "@/lib/penjualan";
import {
  tulisLewatHari,
  tulisSisaHari,
  tulisStok,
  tulisTanggalSingkat,
  type BarisObatRingkasan,
  type IsiRingkasan,
} from "@/lib/ringkasan";
import styles from "./ringkasan.module.css";

export function PapanRingkasan({ ringkasan }: { ringkasan: IsiRingkasan }) {
  return (
    <>
      <p className={styles.tanggal}>{tulisTanggalWib(new Date())} (WIB)</p>

      <div className={styles.angka}>
        <div className={styles.kotakAngka}>
          <p className={styles.labelAngka}>Pendapatan hari ini</p>
          <p className={styles.nilaiAngka}>{tulisRupiah(ringkasan.pendapatan)}</p>
        </div>
        <div className={styles.kotakAngka}>
          <p className={styles.labelAngka}>Penjualan hari ini</p>
          <p className={styles.nilaiAngka}>{ringkasan.jumlah_penjualan}</p>
        </div>
      </div>
      <p className={styles.catatanAngka}>Penjualan yang Dibatalkan tidak ikut dihitung.</p>

      <div className={styles.daftar}>
        <Panel
          judul="Hampir habis"
          keterangan="Stok 20 atau kurang, termasuk yang sudah Habis."
          kosong="Tidak ada obat yang hampir habis."
          isi={ringkasan.hampir_habis}
          tulisKanan={(obat) => tulisStok(obat)}
          tandai={(obat) => obat.stok === 0}
        />
        <Panel
          judul="Segera kedaluwarsa"
          keterangan="Kedaluwarsa hari ini sampai 90 hari lagi."
          kosong="Tidak ada obat yang segera kedaluwarsa."
          isi={ringkasan.segera_kedaluwarsa}
          tulisKanan={(obat) => tulisSisaHari(obat.sisa_hari ?? 0)}
          tandai={(obat) => (obat.sisa_hari ?? 0) <= 30}
        />
        <Panel
          judul="Sudah kedaluwarsa"
          keterangan="Tidak boleh dijual. Tarik dari rak."
          kosong="Tidak ada obat yang sudah kedaluwarsa."
          isi={ringkasan.sudah_kedaluwarsa}
          tulisKanan={(obat) => tulisLewatHari(obat.lewat_hari ?? 0)}
          tandai={() => true}
        />
      </div>
    </>
  );
}

function Panel({
  judul,
  keterangan,
  kosong,
  isi,
  tulisKanan,
  tandai,
}: {
  judul: string;
  keterangan: string;
  kosong: string;
  isi: BarisObatRingkasan[];
  /** Tulisan di kolom kanan: stok, sisa hari, atau sudah lewat berapa hari. */
  tulisKanan: (obat: BarisObatRingkasan) => string;
  /** Baris yang perlu segera ditindaklanjuti, ditulis dengan warna peringatan. */
  tandai: (obat: BarisObatRingkasan) => boolean;
}) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.judulPanel}>
        {judul} <span className={styles.jumlahPanel}>{isi.length}</span>
      </h2>
      <p className={styles.keteranganPanel}>{keterangan}</p>

      {isi.length === 0 ? (
        <p className={styles.kosong}>{kosong}</p>
      ) : (
        <ul className={styles.baris}>
          {isi.map((obat) => (
            <li key={obat.id} className={tandai(obat) ? styles.perluPerhatian : undefined}>
              <span className={styles.namaObat}>{obat.nama}</span>
              <span className={styles.kanan}>{tulisKanan(obat)}</span>
              <span className={styles.tanggalObat}>{tulisTanggalSingkat(obat.tanggal_kedaluwarsa)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
