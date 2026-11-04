// /obat/[slug]: Detail obat untuk Pengunjung, berbentuk etiket (F-03, F-04;
// SPEC 4.2 dan 4.7).
//
// Halaman ini punya alamat sendiri, bukan sekadar jendela di atas Katalog,
// supaya tombol Kembali di HP bekerja wajar dan tautannya bisa dikirim lewat
// WhatsApp (SPEC 4.2, user story 14-15).
//
// Sumbernya tampilan `katalog`, yang hanya memuat obat yang TIDAK diarsipkan
// dan tidak memuat stok, harga acuan, maupun tanggal kedaluwarsa. Jadi obat
// yang diarsipkan Admin otomatis ikut menghilang dari sini.
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { PapanNama } from "@/components/PapanNama";
import { TandaGolongan } from "@/components/TandaGolongan";
import { apotek, tautanWhatsApp } from "@/lib/apotek";
import {
  jelaskanSatuan,
  penjelasanGolongan,
  tulisanBentuk,
  tulisanGolongan,
  tulisanKeluhan,
  tulisanStatusStok,
  tulisRupiah,
  tulisSatuan,
  type ObatKatalog,
} from "@/lib/katalog";
import { buatSupabaseServer } from "@/lib/supabase/server";
import styles from "./obat.module.css";

export async function generateMetadata({ params }: PageProps<"/obat/[slug]">) {
  const { slug } = await params;
  const obat = await ambilObat(slug).catch(() => null);

  // Judul memuat nama obat, supaya berguna saat tautannya dibagikan di WhatsApp.
  return obat
    ? { title: `${obat.nama} · ApotikKu`, description: obat.kegunaan }
    : { title: "Obat tidak ditemukan · ApotikKu" };
}

export default function HalamanDetailObat(props: PageProps<"/obat/[slug]">) {
  return (
    <Suspense fallback={<p className={styles.pesan}>Memuat obat…</p>}>
      <IsiDetail {...props} />
    </Suspense>
  );
}

async function IsiDetail({ params }: PageProps<"/obat/[slug]">) {
  // Sama dengan Katalog: selalu dibaca ulang, supaya Status stok terbaru.
  await connection();

  const { slug } = await params;

  let obat: ObatKatalog | null;
  try {
    obat = await ambilObat(slug);
  } catch (galat) {
    console.error(galat);
    return (
      <>
        <PapanNama />
        <main className={styles.halaman}>
          <p className={styles.pesan} role="alert">
            Obat sedang tidak bisa dimuat. Coba muat ulang halaman sebentar lagi.
          </p>
        </main>
      </>
    );
  }

  if (!obat) {
    return (
      <>
        <PapanNama />
        <main className={styles.halaman}>
          <div className={styles.tidakAda} role="alert">
            <p className={styles.tidakAdaJudul}>Obat tidak ditemukan.</p>
            <p>Obat ini mungkin sudah tidak dijual lagi di ApotikKu.</p>
            <Link href="/" className={styles.tombolUtama}>
              Lihat semua obat
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <PapanNama />
      <main className={styles.halaman}>
        <Link href="/" className={styles.kembali}>
          ← Kembali ke Katalog
        </Link>

        <article className={styles.etiket} data-status={obat.status_stok}>
          <header className={styles.kepala}>
            <span className={styles.keluhan}>{tulisanKeluhan[obat.keluhan] ?? obat.keluhan}</span>
            <span className={styles.satuan}>{tulisSatuan(obat.satuan_jual, obat.isi_per_satuan)}</span>
          </header>

          <div className={styles.isi}>
            {/* Kolom kiri: identitas dan harga. Di HP ikut turun jadi satu kolom. */}
            <div className={styles.kolomHarga}>
              <h1 className={styles.nama}>{obat.nama}</h1>
              <p className={styles.bentuk}>{tulisanBentuk[obat.bentuk] ?? obat.bentuk}</p>

              <p className={styles.harga}>{tulisRupiah(obat.harga_jual)}</p>
              <p className={styles.perSatuan}>per {obat.satuan_jual}</p>

              <p className={styles.status}>
                <span className={styles.titikStatus} aria-hidden="true" />
                {tulisanStatusStok[obat.status_stok]}
              </p>
            </div>

            {/* Kolom kanan: keterangan yang perlu dibaca. */}
            <div className={styles.kolomKeterangan}>
              <section className={styles.bagian}>
                <h2 className={styles.judulBagian}>Golongan obat</h2>
                <p className={styles.barisGolongan}>
                  <TandaGolongan golongan={obat.golongan} ukuran={48} />
                  <span className={styles.namaGolongan} data-golongan={obat.golongan}>
                    {tulisanGolongan[obat.golongan]}
                  </span>
                </p>
                <p>{penjelasanGolongan[obat.golongan]}</p>
              </section>

              <section className={styles.bagian}>
                <h2 className={styles.judulBagian}>Kegunaan</h2>
                <p>{obat.kegunaan}</p>
              </section>

              <section className={styles.bagian}>
                <h2 className={styles.judulBagian}>Satuan jual</h2>
                <p>{jelaskanSatuan(obat.satuan_jual, obat.isi_per_satuan)}</p>
              </section>
            </div>
          </div>

          {/* Aturan bisnis 8: kegunaan ditulis umum, tanpa dosis, selalu
            disertai catatan ini. */}
          <p className={styles.catatan} role="note">
            Informasi ini bersifat umum dan tidak memuat aturan pakai. Tanyakan apoteker sebelum memakai obat.
          </p>
        </article>

        <section className={styles.tanya}>
          <h2 className={styles.judulBagian}>Mau bertanya dulu?</h2>
          <a
            className={styles.tombolUtama}
            href={tautanWhatsApp(`Halo ApotikKu, saya mau tanya tentang ${obat.nama}.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Tanya lewat WhatsApp
          </a>
          <p className={styles.nomor}>
            {apotek.whatsappTertulis}
            {apotek.whatsappContoh && " (nomor contoh)"}
          </p>
        </section>
      </main>
    </>
  );
}

/** Satu obat dari tampilan `katalog`, atau null bila slug tidak ada / obat diarsipkan. */
async function ambilObat(slug: string): Promise<ObatKatalog | null> {
  const supabase = await buatSupabaseServer();
  const { data, error } = await supabase.from("katalog").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    throw new Error(`Gagal membaca obat ${slug}: ${error.message}`);
  }
  return (data as ObatKatalog | null) ?? null;
}
