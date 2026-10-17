"use client";
// Layar Jual untuk laptop/tablet (SPEC 4.8). Berjalan di browser supaya
// pencarian dan keranjang terasa seketika (target NF-03: 3 obat ≤ 30 detik).
//
// Semua angka di sini PERKIRAAN untuk membantu Kasir. Yang menentukan adalah
// fungsi database catat_penjualan: harga, stok, Cek resep, dan uang dicek ulang
// di sana, dan pesan penolakannya ditampilkan apa adanya.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { TandaGolongan } from "@/components/TandaGolongan";
import { tulisanGolongan, tulisanStatusStok, tulisRupiah, tulisSatuan } from "@/lib/katalog";
import {
  bisaDijual,
  tulisanCaraBayar,
  type CaraBayar,
  type HasilPenjualan,
  type ObatJual,
} from "@/lib/penjualan";
import { simpanPenjualan } from "./aksi";
import styles from "./jual.module.css";

/** Satu baris keranjang. Obatnya disimpan supaya baris tetap tampil walau daftar dimuat ulang. */
type BarisKeranjang = { obat: ObatJual; jumlah: number };

/** Harga di layar berbeda dengan harga database saat Penjualan disimpan. */
type PerubahanHarga = { nama: string; lama: number; baru: number };

type Hasil = { penjualan: HasilPenjualan; perubahanHarga: PerubahanHarga[] };

const tombolCepat = [50_000, 100_000];

export function LayarJual({ daftarObat }: { daftarObat: ObatJual[] }) {
  const [cari, setCari] = useState("");
  const [keranjang, setKeranjang] = useState<BarisKeranjang[]>([]);
  const [caraBayar, setCaraBayar] = useState<CaraBayar>("tunai");
  const [uangDiterima, setUangDiterima] = useState("");
  const [cekResep, setCekResep] = useState(false);
  const [pesanCari, setPesanCari] = useState<string | null>(null);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);
  const [hasil, setHasil] = useState<Hasil | null>(null);
  const [sedangMenyimpan, mulaiMenyimpan] = useTransition();
  const kotakCari = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Daftar obat dimuat ulang server setelah setiap Penjualan. Baris keranjang
  // memakai data terbaru (stok, harga) bila obatnya masih ada.
  const obatTerbaru = useMemo(() => new Map(daftarObat.map((o) => [o.id, o])), [daftarObat]);
  const barisKeranjang = keranjang.map((baris) => ({
    ...baris,
    obat: obatTerbaru.get(baris.obat.id) ?? baris.obat,
  }));

  const hasilCari = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    return kata ? daftarObat.filter((o) => o.nama.toLowerCase().includes(kata)) : daftarObat;
  }, [cari, daftarObat]);

  const total = barisKeranjang.reduce((jumlah, b) => jumlah + b.jumlah * b.obat.harga_jual, 0);
  const obatKeras = barisKeranjang.find((b) => b.obat.golongan === "keras")?.obat;
  const uang = uangDiterima === "" ? null : Number(uangDiterima);
  const kembalian = uang === null ? null : uang - total;

  const alasanBelumBisa =
    barisKeranjang.length === 0
      ? "Keranjang masih kosong."
      : barisKeranjang.some((b) => b.jumlah < 1)
        ? "Isi jumlah setiap obat."
        : obatKeras && !cekResep
          ? "Centang Cek resep dulu."
          : caraBayar === "tunai" && (uang === null || uang < total)
            ? "Isi uang diterima."
            : null;

  useEffect(() => {
    kotakCari.current?.focus();
  }, []);

  function tambah(obat: ObatJual) {
    if (!bisaDijual(obat)) {
      return;
    }
    setHasil(null);
    setPesanGagal(null);
    setKeranjang((sekarang) => {
      const ada = sekarang.find((b) => b.obat.id === obat.id);
      if (ada) {
        return sekarang.map((b) =>
          b.obat.id === obat.id ? { ...b, jumlah: Math.min(b.jumlah + 1, obat.stok) } : b,
        );
      }
      return [...sekarang, { obat, jumlah: 1 }];
    });
  }

  function ubahJumlah(obatId: number, jumlah: number) {
    setKeranjang((sekarang) =>
      sekarang.map((b) => {
        if (b.obat.id !== obatId) return b;
        const stok = obatTerbaru.get(obatId)?.stok ?? b.obat.stok;
        // Dibatasi stok yang terlihat; database tetap mengecek ulang (ADR 0003).
        return { ...b, jumlah: Math.max(0, Math.min(jumlah, stok)) };
      }),
    );
  }

  function hapus(obatId: number) {
    setKeranjang((sekarang) => sekarang.filter((b) => b.obat.id !== obatId));
  }

  function tekanEnterDiPencarian() {
    // Enter menambahkan hasil teratas yang BISA dijual; obat Habis dilewati.
    const pilihan = hasilCari.find(bisaDijual);
    if (!pilihan) {
      setPesanCari(cari.trim() ? `Tidak ada obat yang bisa dijual untuk "${cari.trim()}".` : null);
      return;
    }
    tambah(pilihan);
    setCari("");
    setPesanCari(null);
  }

  function pilihCaraBayar(cara: CaraBayar) {
    setCaraBayar(cara);
    // QRIS/transfer tidak memakai uang diterima; dikosongkan supaya tidak
    // terkirim angka sisa yang pasti ditolak database.
    if (cara === "qris_transfer") {
      setUangDiterima("");
    }
  }

  function simpan() {
    if (alasanBelumBisa || sedangMenyimpan) {
      return;
    }
    // Harga yang terlihat Kasir saat menekan Simpan, untuk dibandingkan dengan
    // harga resmi dari database.
    const hargaDiLayar = new Map(barisKeranjang.map((b) => [b.obat.id, b.obat.harga_jual]));

    mulaiMenyimpan(async () => {
      setPesanGagal(null);
      const jawaban = await simpanPenjualan({
        keranjang: barisKeranjang.map((b) => ({ obat_id: b.obat.id, jumlah: b.jumlah })),
        metodeBayar: caraBayar,
        uangDiterima: caraBayar === "tunai" ? uang : null,
        cekResep: obatKeras ? cekResep : false,
      });

      if (!jawaban.berhasil) {
        // Keranjang tetap, supaya Kasir cukup memperbaiki lalu menyimpan lagi.
        setPesanGagal(jawaban.pesan);
        return;
      }

      const perubahanHarga = jawaban.penjualan.item
        .filter((i) => hargaDiLayar.get(i.obat_id) !== i.harga_satuan)
        .map((i) => ({ nama: i.nama, lama: hargaDiLayar.get(i.obat_id) ?? 0, baru: i.harga_satuan }));

      setKeranjang([]);
      setUangDiterima("");
      setCekResep(false);
      setCaraBayar("tunai");
      setCari("");

      // Harga sama dengan yang dilihat Kasir: langsung buka Struk, siap dicetak
      // (SPEC 4.8). Harga berubah: tetap di sini dulu supaya Kasir membaca
      // pemberitahuannya, lalu membuka Struk lewat tombol.
      if (perubahanHarga.length === 0) {
        router.push(`/staf/penjualan/${jawaban.penjualan.nomor}/struk?baru=1`);
        return;
      }
      setHasil({ penjualan: jawaban.penjualan, perubahanHarga });
    });
  }

  return (
    <div className={styles.layar}>
      {/* Kiri: cari dan pilih obat */}
      <section className={styles.cari} aria-labelledby="judul-cari">
        <h2 id="judul-cari" className={styles.judulBagian}>
          Cari obat
        </h2>
        <input
          ref={kotakCari}
          className={styles.kotakCari}
          type="search"
          placeholder="Ketik nama obat, Enter untuk menambahkan"
          value={cari}
          onChange={(e) => {
            setCari(e.target.value);
            setPesanCari(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              tekanEnterDiPencarian();
            }
          }}
          aria-describedby="petunjuk-cari"
          autoComplete="off"
        />
        <p id="petunjuk-cari" className={styles.petunjuk}>
          {pesanCari ?? `${hasilCari.length} obat. Obat Habis tampil abu-abu dan tidak bisa dipilih.`}
        </p>

        <ul className={styles.daftar}>
          {hasilCari.map((obat) => {
            const dijual = bisaDijual(obat);
            return (
              <li key={obat.id}>
                <button
                  type="button"
                  className={styles.obat}
                  data-status={obat.status_stok}
                  disabled={!dijual}
                  onClick={() => {
                    tambah(obat);
                    kotakCari.current?.focus();
                  }}
                >
                  <span className={styles.obatTanda}>
                    <TandaGolongan golongan={obat.golongan} ukuran={22} />
                  </span>
                  <span className={styles.obatNama}>
                    {obat.nama}
                    <span className={styles.obatKecil}>
                      {tulisSatuan(obat.satuan_jual, obat.isi_per_satuan)} · {tulisanGolongan[obat.golongan]}
                    </span>
                  </span>
                  <span className={styles.obatStok}>
                    {obat.sudah_kedaluwarsa ? "Sudah kedaluwarsa" : `stok ${obat.stok}`}
                    <span className={styles.obatKecil}>{tulisanStatusStok[obat.status_stok]}</span>
                  </span>
                  <span className={styles.harga}>{tulisRupiah(obat.harga_jual)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Kanan: keranjang dan pembayaran */}
      <section className={styles.kasir} aria-labelledby="judul-keranjang">
        <h2 id="judul-keranjang" className={styles.judulBagian}>
          Keranjang
        </h2>

        {hasil && <PanelHasil hasil={hasil} />}

        {barisKeranjang.length === 0 ? (
          !hasil && <p className={styles.kosong}>Belum ada obat. Cari di sebelah kiri.</p>
        ) : (
          <ul className={styles.keranjang}>
            {barisKeranjang.map(({ obat, jumlah }) => (
              <li key={obat.id} className={styles.baris}>
                <div className={styles.barisNama}>
                  {obat.nama}
                  <span className={styles.obatKecil}>
                    {tulisRupiah(obat.harga_jual)} per {obat.satuan_jual} · stok {obat.stok}
                  </span>
                </div>
                <div className={styles.jumlah}>
                  <button
                    type="button"
                    aria-label={`Kurangi ${obat.nama}`}
                    onClick={() => ubahJumlah(obat.id, Math.max(1, jumlah - 1))}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={obat.stok}
                    aria-label={`Jumlah ${obat.nama}`}
                    value={jumlah === 0 ? "" : jumlah}
                    onChange={(e) => ubahJumlah(obat.id, e.target.value === "" ? 0 : Math.floor(Number(e.target.value)))}
                    onBlur={() => jumlah < 1 && ubahJumlah(obat.id, 1)}
                  />
                  <button
                    type="button"
                    aria-label={`Tambah ${obat.nama}`}
                    onClick={() => ubahJumlah(obat.id, jumlah + 1)}
                    disabled={jumlah >= obat.stok}
                  >
                    +
                  </button>
                </div>
                <span className={styles.harga}>{tulisRupiah(jumlah * obat.harga_jual)}</span>
                <button type="button" className={styles.hapus} onClick={() => hapus(obat.id)}>
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )}

        {barisKeranjang.length > 0 && (
          <>
            <p className={styles.total}>
              <span>Total (perkiraan)</span>
              <span className={styles.hargaBesar}>{tulisRupiah(total)}</span>
            </p>

            {obatKeras && (
              <label className={styles.cekResep}>
                <input type="checkbox" checked={cekResep} onChange={(e) => setCekResep(e.target.checked)} />
                <span>
                  <TandaGolongan golongan="keras" ukuran={18} /> Ada Obat keras ({obatKeras.nama}). Saya sudah
                  memeriksa resep dokter.
                </span>
              </label>
            )}

            <fieldset className={styles.bayar}>
              <legend>Cara bayar</legend>
              {(["tunai", "qris_transfer"] as const).map((cara) => (
                <label key={cara} className={styles.pilihanBayar}>
                  <input
                    type="radio"
                    name="cara-bayar"
                    checked={caraBayar === cara}
                    onChange={() => pilihCaraBayar(cara)}
                  />
                  {tulisanCaraBayar[cara]}
                </label>
              ))}

              {caraBayar === "tunai" ? (
                <div className={styles.tunai}>
                  <label className={styles.uang}>
                    Uang diterima
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={uangDiterima}
                      onChange={(e) => setUangDiterima(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          simpan();
                        }
                      }}
                    />
                  </label>
                  <div className={styles.cepat}>
                    <button type="button" onClick={() => setUangDiterima(String(total))}>
                      Uang pas
                    </button>
                    {tombolCepat.map((nilai) => (
                      <button
                        key={nilai}
                        type="button"
                        onClick={() => setUangDiterima(String(nilai))}
                        disabled={nilai < total}
                      >
                        {tulisRupiah(nilai)}
                      </button>
                    ))}
                  </div>
                  <p className={styles.kembalian}>
                    {kembalian === null ? (
                      "Kembalian: isi uang diterima"
                    ) : kembalian >= 0 ? (
                      <>
                        Kembalian <span className={styles.hargaBesar}>{tulisRupiah(kembalian)}</span>
                      </>
                    ) : (
                      <>Uang kurang {tulisRupiah(-kembalian)}</>
                    )}
                  </p>
                </div>
              ) : (
                <p className={styles.petunjuk}>
                  Pembeli membayar lewat QRIS atau transfer ke rekening apotek. Aplikasi hanya mencatatnya.
                </p>
              )}
            </fieldset>

            {pesanGagal && (
              <p className={styles.gagal} role="alert">
                {pesanGagal}
              </p>
            )}

            <button
              type="button"
              className={styles.simpan}
              onClick={simpan}
              disabled={alasanBelumBisa !== null || sedangMenyimpan}
            >
              {sedangMenyimpan ? "Menyimpan…" : "Simpan Penjualan"}
            </button>
            {alasanBelumBisa && <p className={styles.petunjuk}>{alasanBelumBisa}</p>}
          </>
        )}
      </section>
    </div>
  );
}

function PanelHasil({ hasil }: { hasil: Hasil }) {
  const { penjualan, perubahanHarga } = hasil;
  const tombolStruk = useRef<HTMLAnchorElement>(null);
  // Enter berikutnya langsung membuka Struk (NF-03). React hanya menjalankan
  // autoFocus untuk tombol dan kolom isian, bukan tautan, jadi fokus diatur di sini.
  useEffect(() => {
    tombolStruk.current?.focus();
  }, [penjualan.nomor]);
  return (
    <div className={styles.hasil} role="status">
      <p className={styles.hasilJudul}>
        <span className={styles.nomor}>{penjualan.nomor}</span> tersimpan
      </p>
      <p>
        Total {tulisRupiah(penjualan.total)} · {tulisanCaraBayar[penjualan.metode_bayar]}
        {penjualan.kembalian !== null && (
          <>
            {" "}
            · Kembalian <strong>{tulisRupiah(penjualan.kembalian)}</strong>
          </>
        )}
      </p>
      {perubahanHarga.length > 0 && (
        <div className={styles.perubahan}>
          {perubahanHarga.map((p) => (
            <p key={p.nama}>
              Harga {p.nama} sudah berubah: {tulisRupiah(p.lama)} → {tulisRupiah(p.baru)}.
            </p>
          ))}
          <p>Total memakai harga terbaru. Beri tahu pembeli.</p>
        </div>
      )}
      <Link ref={tombolStruk} href={`/staf/penjualan/${penjualan.nomor}/struk?baru=1`} className={styles.bukaStruk}>
        Buka Struk
      </Link>
    </div>
  );
}
