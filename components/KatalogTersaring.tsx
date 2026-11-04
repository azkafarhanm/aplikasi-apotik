"use client";
// Pencarian nama, laci Keluhan, dan "Tanpa resep" di Katalog (F-01, F-02; #4).
//
// Semua obat sudah dikirim server sekali (SPEC 4.7). Penyaringan dikerjakan di
// HP Pengunjung tanpa meminta data lagi, jadi hasilnya muncul seketika (NF-05).
// Komponen ini hanya menyaring daftar yang diterimanya; pengambilan datanya
// tetap di app/page.tsx (server).
import { useId, useMemo, useState } from "react";
import { KartuEtiket } from "@/components/KartuEtiket";
import { apotek, tautanWhatsApp } from "@/lib/apotek";
import { tulisanKeluhan, type ObatKatalog } from "@/lib/katalog";
import styles from "./KatalogTersaring.module.css";

/** Enam laci, urutannya tetap seperti di prototipe (ADR 0004). */
const daftarKeluhan = Object.keys(tulisanKeluhan);

export function KatalogTersaring({ daftar }: { daftar: ObatKatalog[] }) {
  const [cari, setCari] = useState("");
  const [laci, setLaci] = useState<string | null>(null);
  const [tanpaResep, setTanpaResep] = useState(false);

  const idCari = useId();
  const idTanpaResep = useId();

  const kataKunci = cari.trim().toLowerCase();
  const adaSaringan = kataKunci !== "" || laci !== null || tanpaResep;

  // "dasar" = hasil saringan SELAIN laci. Dipakai dua kali: untuk menghitung
  // isi setiap laci (jadi angkanya ikut menyesuaikan saat "Tanpa resep"
  // dicentang), dan sebagai bahan saringan laci di bawahnya.
  const dasar = useMemo(
    () =>
      daftar.filter(
        (obat) =>
          (kataKunci === "" || obat.nama.toLowerCase().includes(kataKunci)) &&
          (!tanpaResep || obat.golongan !== "keras"),
      ),
    [daftar, kataKunci, tanpaResep],
  );

  const isiLaci = useMemo(() => {
    const jumlah: Record<string, number> = {};
    for (const obat of dasar) {
      jumlah[obat.keluhan] = (jumlah[obat.keluhan] ?? 0) + 1;
    }
    return jumlah;
  }, [dasar]);

  const hasil = useMemo(
    () => (laci === null ? dasar : dasar.filter((obat) => obat.keluhan === laci)),
    [dasar, laci],
  );

  function bersihkan() {
    setCari("");
    setLaci(null);
    setTanpaResep(false);
  }

  return (
    <>
      <div className={styles.penyaring}>
        <label htmlFor={idCari} className={styles.labelCari}>
          Cari obat
        </label>
        <input
          id={idCari}
          type="search"
          className={styles.kotakCari}
          value={cari}
          onChange={(peristiwa) => setCari(peristiwa.target.value)}
          placeholder="Ketik nama obat, misalnya parasetamol"
          autoComplete="off"
        />

        <p className={styles.labelLaci} id="label-laci">
          Laci Keluhan
        </p>
        {/* Hanya satu laci aktif; mengetuk laci yang sama membatalkannya
            (SPEC 4.7). Laci yang kosong dimatikan, kecuali laci yang sedang
            aktif, supaya saringannya selalu bisa dibatalkan. */}
        <div className={styles.laci} role="group" aria-labelledby="label-laci">
          {daftarKeluhan.map((keluhan) => {
            const jumlah = isiLaci[keluhan] ?? 0;
            const aktif = laci === keluhan;
            return (
              <button
                key={keluhan}
                type="button"
                className={styles.tombolLaci}
                aria-pressed={aktif}
                disabled={jumlah === 0 && !aktif}
                onClick={() => setLaci(aktif ? null : keluhan)}
              >
                <span className={styles.namaLaci}>{tulisanKeluhan[keluhan]}</span>
                <span className={styles.isiLaci}>{jumlah} obat</span>
              </button>
            );
          })}
        </div>

        <div className={styles.barisTanpaResep}>
          <input
            id={idTanpaResep}
            type="checkbox"
            className={styles.centang}
            checked={tanpaResep}
            onChange={(peristiwa) => setTanpaResep(peristiwa.target.checked)}
          />
          <label htmlFor={idTanpaResep}>Tanpa resep saja</label>
        </div>
      </div>

      {/* Tombolnya sengaja DI LUAR role="status": kalau di dalam, pembaca layar
          ikut membacakan "Tampilkan semua obat" setiap kali saringan berubah. */}
      <div className={styles.barisJumlah}>
        <p className={styles.jumlah} role="status">
          {tulisJumlah(hasil.length, kataKunci, laci, tanpaResep)}
        </p>
        {adaSaringan && (
          <button type="button" className={styles.bersihkan} onClick={bersihkan}>
            Tampilkan semua obat
          </button>
        )}
      </div>

      {hasil.length === 0 ? (
        <div className={styles.kosong}>
          <p className={styles.kosongJudul}>Obat tidak ditemukan.</p>
          <p>Coba kata lain, atau tanyakan langsung ke apotek.</p>
          <a
            className={styles.tombolWhatsApp}
            href={tautanWhatsApp(
              kataKunci === ""
                ? "Halo ApotikKu, saya mau tanya ketersediaan obat."
                : `Halo ApotikKu, saya mau tanya apakah ada obat "${cari.trim()}".`,
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Tanya lewat WhatsApp
          </a>
          <p className={styles.nomor}>
            {apotek.whatsappTertulis}
            {apotek.whatsappContoh && " (nomor contoh)"}
          </p>
        </div>
      ) : (
        <ul className={styles.daftar}>
          {hasil.map((obat) => (
            <li key={obat.slug}>
              <KartuEtiket obat={obat} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/**
 * Kalimat jumlah hasil, misalnya "8 obat untuk Batuk & Flu" atau
 * "2 obat tanpa resep untuk "para" di Demam & Nyeri".
 */
function tulisJumlah(
  jumlah: number,
  kataKunci: string,
  laci: string | null,
  tanpaResep: boolean,
): string {
  const awal = `${jumlah} obat${tanpaResep ? " tanpa resep" : ""}`;
  const namaLaci = laci === null ? null : tulisanKeluhan[laci];

  if (kataKunci !== "" && namaLaci !== null) {
    return `${awal} untuk "${kataKunci}" di ${namaLaci}`;
  }
  if (kataKunci !== "") {
    return `${awal} untuk "${kataKunci}"`;
  }
  if (namaLaci !== null) {
    return `${awal} untuk ${namaLaci}`;
  }
  return awal;
}
