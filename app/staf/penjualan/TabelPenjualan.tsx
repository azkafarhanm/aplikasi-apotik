"use client";
// Daftar Penjualan hari ini beserta jumlahnya (F-08), dan untuk Admin tombol
// Batalkan dengan jendela konfirmasi (F-14, NF-03, tiket #13).
//
// Komponen ini berjalan di browser karena jendela konfirmasi butuh keadaan
// (Penjualan mana yang dipilih, alasan, pesan). Isinya (milik siapa, hari
// apa) tetap ditentukan database, dan tombol Batalkan hanya kemudahan
// tampilan: yang menolak Kasir adalah batalkan_penjualan.
import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { tulisRupiah } from "@/lib/katalog";
import {
  panjangAlasanMaks,
  tulisanCaraBayar,
  tulisanStatusPenjualan,
  tulisHasilPembatalan,
  tulisJamWib,
  tulisPembatal,
  type BarisPenjualanHariIni,
} from "@/lib/penjualan";
import { batalkanPenjualan } from "./aksi";
import styles from "./penjualan.module.css";

export function TabelPenjualan({
  daftar,
  admin,
}: {
  daftar: BarisPenjualanHariIni[];
  /** Admin melihat Penjualan semua Kasir (kolom Kasir) dan tombol Batalkan. */
  admin: boolean;
}) {
  const [dipilih, setDipilih] = useState<BarisPenjualanHariIni | null>(null);
  const [pesanBerhasil, setPesanBerhasil] = useState<string | null>(null);

  // Penjualan Dibatalkan tetap tampil (aturan bisnis 7) tetapi tidak dihitung.
  const selesai = daftar.filter((p) => p.status === "selesai");
  const jumlahDibatalkan = daftar.length - selesai.length;
  const total = selesai.reduce((jumlah, p) => jumlah + p.total, 0);
  const jumlahKolom = admin ? 8 : 6;

  return (
    <>
      {pesanBerhasil && (
        <p className={styles.berhasil} role="status">
          {pesanBerhasil}
        </p>
      )}

      {daftar.length === 0 ? (
        <div className={styles.kosong}>
          <p>Belum ada Penjualan hari ini.</p>
          {/* Penjualan kemarin tidak hilang, hanya bukan "hari ini" (tiket #13). */}
          <p className={styles.kosongKecil}>
            Penjualan hari sebelumnya tetap tersimpan. Admin bisa melihatnya di Laporan.
          </p>
        </div>
      ) : (
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
                  {admin && <th scope="col">Kasir</th>}
                  <th scope="col">Cara bayar</th>
                  <th scope="col" className={styles.angka}>
                    Total
                  </th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className={styles.tersembunyi}>Struk</span>
                  </th>
                  {admin && (
                    <th scope="col">
                      <span className={styles.tersembunyi}>Batalkan</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {daftar.map((p) => (
                  <BarisPenjualan
                    key={p.nomor}
                    p={p}
                    admin={admin}
                    jumlahKolom={jumlahKolom}
                    onBatalkan={() => {
                      setPesanBerhasil(null);
                      setDipilih(p);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {admin && dipilih && (
        <JendelaBatalkan
          penjualan={dipilih}
          onTutup={() => setDipilih(null)}
          onBerhasil={(pesan) => {
            setDipilih(null);
            setPesanBerhasil(pesan);
          }}
        />
      )}
    </>
  );
}

function BarisPenjualan({
  p,
  admin,
  jumlahKolom,
  onBatalkan,
}: {
  p: BarisPenjualanHariIni;
  admin: boolean;
  jumlahKolom: number;
  onBatalkan: () => void;
}) {
  const dibatalkan = p.status === "dibatalkan";
  return (
    <>
      <tr className={dibatalkan ? styles.dibatalkan : undefined}>
        <td className={styles.nomor}>{p.nomor}</td>
        <td className={styles.nomor}>{tulisJamWib(p.waktu)}</td>
        {admin && <td>{p.nama_kasir ?? "Staf"}</td>}
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
        {admin && (
          <td>
            {!dibatalkan && (
              <button
                type="button"
                className={styles.tombolBatal}
                onClick={onBatalkan}
                aria-label={`Batalkan ${p.nomor}`}
              >
                Batalkan
              </button>
            )}
          </td>
        )}
      </tr>
      {dibatalkan && (
        <tr className={styles.barisAlasan}>
          <td colSpan={jumlahKolom}>
            Dibatalkan {p.dibatalkan_pada ? `pukul ${tulisJamWib(p.dibatalkan_pada)} ` : ""}
            oleh {tulisPembatal(p.nama_pembatal)} · Alasan: {p.alasan_batal}
          </td>
        </tr>
      )}
    </>
  );
}

/**
 * Jendela konfirmasi Pembatalan (NF-03: tombol berbahaya selalu minta
 * konfirmasi; user story 64). Memakai <dialog> bawaan browser: latar di
 * belakangnya tidak bisa diklik, dan Esc menutupnya.
 */
function JendelaBatalkan({
  penjualan,
  onTutup,
  onBerhasil,
}: {
  penjualan: BarisPenjualanHariIni;
  onTutup: () => void;
  onBerhasil: (pesan: string) => void;
}) {
  const jendela = useRef<HTMLDialogElement>(null);
  const kolomAlasan = useRef<HTMLTextAreaElement>(null);
  const [alasan, setAlasan] = useState("");
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);
  const [sedangMembatalkan, mulaiMembatalkan] = useTransition();

  useEffect(() => {
    const dialog = jendela.current;
    if (!dialog) {
      return;
    }
    dialog.showModal();
    // Kolom alasan langsung siap diketik.
    kolomAlasan.current?.focus();
    return () => dialog.close();
  }, []);

  // Setelah ditolak, kursor kembali ke kolom alasan supaya bisa langsung diperbaiki.
  useEffect(() => {
    if (pesanGagal) {
      kolomAlasan.current?.focus();
    }
  }, [pesanGagal]);

  function kirim(event: FormEvent) {
    event.preventDefault();
    if (alasan.trim() === "") {
      setPesanGagal("Tulis alasan pembatalan.");
      kolomAlasan.current?.focus();
      return;
    }
    setPesanGagal(null);
    mulaiMembatalkan(async () => {
      const hasil = await batalkanPenjualan(penjualan.nomor, alasan);
      if (hasil.berhasil) {
        onBerhasil(tulisHasilPembatalan(hasil.pembatalan));
      } else {
        setPesanGagal(hasil.pesan);
      }
    });
  }

  return (
    <dialog
      ref={jendela}
      className={styles.jendela}
      aria-labelledby="judul-batalkan"
      onCancel={(event) => {
        // Esc: tidak ditutup selagi permintaan masih berjalan.
        event.preventDefault();
        if (!sedangMembatalkan) {
          onTutup();
        }
      }}
    >
      <form onSubmit={kirim}>
        <h2 id="judul-batalkan" className={styles.jendelaJudul}>
          Batalkan {penjualan.nomor}?
        </h2>

        <dl className={styles.ringkas}>
          <dt>Jam</dt>
          <dd className={styles.nomor}>{tulisJamWib(penjualan.waktu)}</dd>
          <dt>Kasir</dt>
          <dd>{penjualan.nama_kasir ?? "Staf"}</dd>
          <dt>Total</dt>
          <dd className={styles.nomor}>{tulisRupiah(penjualan.total)}</dd>
        </dl>
        <p className={styles.jendelaCatatan}>
          Stok setiap obat dikembalikan. Penjualan tetap tercatat dengan tanda Dibatalkan dan tidak dihitung sebagai
          pendapatan. Pembatalan tidak bisa diurungkan.{" "}
          <Link href={`/staf/penjualan/${penjualan.nomor}/struk`} className={styles.struk}>
            Lihat Struk dulu
          </Link>
        </p>

        <label htmlFor="alasan-batal" className={styles.labelAlasan}>
          Alasan pembatalan
        </label>
        <textarea
          id="alasan-batal"
          ref={kolomAlasan}
          className={styles.alasan}
          rows={3}
          maxLength={panjangAlasanMaks}
          value={alasan}
          onChange={(event) => setAlasan(event.target.value)}
          placeholder="Misalnya: Kasir salah ketik jumlah"
          aria-describedby="sisa-alasan"
          readOnly={sedangMembatalkan}
        />
        <p id="sisa-alasan" className={styles.sisa}>
          {alasan.length}/{panjangAlasanMaks}
        </p>

        {pesanGagal && (
          <p className={styles.gagal} role="alert">
            {pesanGagal}
          </p>
        )}

        <div className={styles.jendelaAksi}>
          <button type="submit" className={styles.tombolYakin} disabled={sedangMembatalkan}>
            {sedangMembatalkan ? "Membatalkan…" : `Batalkan ${penjualan.nomor}`}
          </button>
          <button type="button" className={styles.tombolKembali} onClick={onTutup} disabled={sedangMembatalkan}>
            Jangan batalkan
          </button>
        </div>
      </form>
    </dialog>
  );
}
