// Logo golongan obat sesuai penandaan resmi BPOM (PRD sumber [7], [8]):
// - Obat bebas: lingkaran hijau bergaris tepi hitam
// - Obat bebas terbatas: lingkaran biru bergaris tepi hitam
// - Obat keras: lingkaran merah bergaris tepi hitam dengan huruf K yang menyentuh garis tepi
// Logo selalu ditemani tulisan di sebelahnya (ADR 0004), jadi untuk pembaca
// layar logo ini disembunyikan (aria-hidden) agar tidak dibacakan dua kali.
import type { Golongan } from "@/lib/katalog";

const warna: Record<Golongan, string> = {
  bebas: "var(--golongan-bebas)",
  bebas_terbatas: "var(--golongan-bebas-terbatas)",
  keras: "var(--golongan-keras)",
};

export function TandaGolongan({
  golongan,
  ukuran = 40,
}: {
  golongan: Golongan;
  ukuran?: number;
}) {
  return (
    <svg
      width={ukuran}
      height={ukuran}
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="20" cy="20" r="18" fill={warna[golongan]} stroke="#000" strokeWidth="2.5" />
      {golongan === "keras" && (
        <path
          d="M14 3.2 V36.8 M14 20 L32.7 7.3 M14 20 L32.7 32.7"
          stroke="#000"
          strokeWidth="4"
          fill="none"
        />
      )}
    </svg>
  );
}
