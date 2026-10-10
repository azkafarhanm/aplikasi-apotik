// Kerangka bersama semua halaman Area staf (/staf/*): pita atas berisi nama
// Staf, menu sesuai peran (PRD bagian 4), dan tombol Keluar.
//
// Membaca sesi login hanya bisa saat halaman dibuka (bukan saat build), jadi
// bagian itu dibungkus <Suspense>: pita kosong tampil seketika, isinya menyusul.
import type { Metadata } from "next";
import { Suspense } from "react";
import { MenuStaf } from "@/components/staf/MenuStaf";
import { tulisanPeran, wajibStaf } from "@/lib/staf";
import styles from "./staf.module.css";

export const metadata: Metadata = {
  title: "Area staf · ApotikKu",
  robots: { index: false },
};

export default function LayoutStaf({ children }: LayoutProps<"/staf">) {
  return (
    <Suspense fallback={<PitaAtas />}>
      <AreaStaf>{children}</AreaStaf>
    </Suspense>
  );
}

async function AreaStaf({ children }: { children: React.ReactNode }) {
  const staf = await wajibStaf();

  const tombolKeluar = (
    // Formulir biasa (bukan Server Action) supaya halaman dimuat ulang penuh
    // setelah keluar; alasannya di app/keluar/route.ts.
    <form method="post" action="/keluar">
      <button type="submit" className={styles.keluar}>
        Keluar
      </button>
    </form>
  );

  // Staf nonaktif masih bisa login (SPEC 4.6), tetapi semua data menolaknya.
  if (!staf.aktif || !staf.peran) {
    return (
      <>
        <PitaAtas>{tombolKeluar}</PitaAtas>
        <main className={styles.isi}>
          <p className={styles.nonaktif} role="alert">
            Akun ini sudah tidak aktif. Hubungi Admin.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <PitaAtas>
        <p className={styles.siapa}>
          {staf.namaTampilan}
          <span className={styles.peran}>{tulisanPeran[staf.peran]}</span>
        </p>
        {tombolKeluar}
      </PitaAtas>
      <MenuStaf peran={staf.peran} />
      <main className={styles.isi}>{children}</main>
    </>
  );
}

function PitaAtas({ children }: { children?: React.ReactNode }) {
  return (
    <header className={styles.pita}>
      <div className={styles.lebar}>
        <p className={styles.merek}>
          ApotikKu <span className={styles.merekKecil}>Area staf</span>
        </p>
        <div className={styles.kanan}>{children}</div>
      </div>
    </header>
  );
}
