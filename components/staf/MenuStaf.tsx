"use client";
// Menu Area staf. Kasir hanya melihat menu yang bisa ia pakai (user story 27);
// menyembunyikan menu hanya soal kenyamanan, datanya tetap dijaga RLS.
// "use client" karena menu perlu tahu halaman mana yang sedang dibuka.
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Peran } from "@/lib/staf";
import styles from "@/app/staf/staf.module.css";

const semuaMenu: { alamat: string; tulisan: string; untuk: Peran[] }[] = [
  { alamat: "/staf/ringkasan", tulisan: "Ringkasan", untuk: ["admin"] },
  { alamat: "/staf/jual", tulisan: "Jual", untuk: ["admin", "kasir"] },
  { alamat: "/staf/penjualan", tulisan: "Penjualan hari ini", untuk: ["admin", "kasir"] },
  { alamat: "/staf/obat", tulisan: "Obat", untuk: ["admin"] },
  { alamat: "/staf/laporan", tulisan: "Laporan", untuk: ["admin"] },
];

export function MenuStaf({ peran }: { peran: Peran }) {
  const alamatSekarang = usePathname();

  return (
    <nav className={styles.menu} aria-label="Menu Area staf">
      <ul className={styles.lebar}>
        {semuaMenu
          .filter((menu) => menu.untuk.includes(peran))
          .map((menu) => {
            const aktif =
              alamatSekarang === menu.alamat || alamatSekarang.startsWith(menu.alamat + "/");
            return (
              <li key={menu.alamat}>
                <Link
                  href={menu.alamat}
                  className={styles.tab}
                  aria-current={aktif ? "page" : undefined}
                >
                  {menu.tulisan}
                </Link>
              </li>
            );
          })}
      </ul>
    </nav>
  );
}
