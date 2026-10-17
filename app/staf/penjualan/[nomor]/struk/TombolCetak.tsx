"use client";
// Tombol Cetak Struk + pengatur tinggi kertas.
//
// Printer kasir memakai gulungan kertas 58 mm yang panjangnya bebas, tetapi
// browser butuh ukuran halaman yang pasti: "58mm auto" ditolak Chromium (jatuh
// ke kertas Letter) dan "58mm" saja menjadi kertas persegi 58 × 58 mm.
// Jadi sesaat sebelum mencetak (event beforeprint, juga saat Ctrl+P), tinggi
// Struk diukur dalam ukuran cetaknya lalu dijadikan tinggi halaman.
import { useEffect } from "react";
import styles from "./struk.module.css";

/** Sisa kertas di bawah tulisan penutup, supaya mudah disobek. */
const sisaSobekMm = 6;

export function TombolCetak({ fokusAwal }: { fokusAwal: boolean }) {
  useEffect(() => {
    const aturanKertas = document.createElement("style");
    document.head.appendChild(aturanKertas);

    function aturTinggiKertas() {
      const struk = document.getElementById("struk");
      if (!struk) return;
      // .ukur memberi Struk ukuran cetak (huruf 8 pt, lebar 58 mm) sebentar,
      // tanpa sempat tergambar di layar.
      struk.classList.add(styles.ukur);
      const tinggiMm = Math.ceil((struk.offsetHeight * 25.4) / 96) + sisaSobekMm;
      struk.classList.remove(styles.ukur);
      aturanKertas.textContent = `@page struk { size: 58mm ${tinggiMm}mm; margin: 0; }`;
    }

    // Sesudah mencetak, Enter berikutnya langsung membuka Penjualan berikutnya.
    function sesudahCetak() {
      document.getElementById("penjualan-berikutnya")?.focus();
    }

    window.addEventListener("beforeprint", aturTinggiKertas);
    window.addEventListener("afterprint", sesudahCetak);
    return () => {
      window.removeEventListener("beforeprint", aturTinggiKertas);
      window.removeEventListener("afterprint", sesudahCetak);
      aturanKertas.remove();
    };
  }, []);

  // fokusAwal: dibuka dari layar Jual, jadi Enter berikutnya langsung mencetak (NF-03).
  return (
    <button type="button" className={styles.cetak} autoFocus={fokusAwal} onClick={() => window.print()}>
      Cetak Struk
    </button>
  );
}
