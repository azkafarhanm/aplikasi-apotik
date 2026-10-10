// Halaman /masuk: formulir login Staf (F-05, SPEC 4.6).
// Tidak ada tombol Daftar: akun Staf dibuat pengelola lewat dasbor Supabase
// (ADR 0003). Staf yang sudah login diarahkan proxy.ts ke /staf.
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FormMasuk } from "./FormMasuk";
import styles from "./masuk.module.css";

export const metadata: Metadata = {
  title: "Masuk Staf · ApotikKu",
  robots: { index: false },
};

export default function HalamanMasuk({ searchParams }: PageProps<"/masuk">) {
  return (
    <main className={styles.halaman}>
      <section className={styles.etiket} aria-labelledby="judul-masuk">
        <p className={styles.merek}>ApotikKu · Area staf</p>
        <h1 id="judul-masuk" className={styles.judul}>
          Masuk Staf
        </h1>

        <Suspense fallback={null}>
          <PesanKeluar searchParams={searchParams} />
        </Suspense>

        <FormMasuk />
      </section>

      <p className={styles.kembali}>
        <Link href="/">← Kembali ke Katalog</Link>
      </p>
    </main>
  );
}

async function PesanKeluar({ searchParams }: Pick<PageProps<"/masuk">, "searchParams">) {
  const { keluar } = await searchParams;
  if (keluar !== "1") {
    return null;
  }
  return (
    <p className={styles.info} role="status">
      Kamu sudah keluar.
    </p>
  );
}
