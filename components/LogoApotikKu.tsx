// Logo ApotikKu (ADR 0006): kotak hijau apotek tua, palang putih etiket, sudut
// kanan atas terlipat seperti kertas etiket. Bentuknya sama dengan logo di
// dokumen SKPL/Figma. app/icon.svg (ikon tab) memakai badan yang sama dengan
// palang lebih tebal supaya tajam di 16 piksel; bila logo berubah, ubah keduanya.
//
// Kepala halaman berlatar hijau yang sama dengan badan logo, jadi logo diberi
// garis tepi warna etiket supaya tidak tenggelam. Logo selalu ditemani tulisan
// "ApotikKu", jadi disembunyikan dari pembaca layar (aria-hidden) agar nama
// tidak dibacakan dua kali.
export function LogoApotikKu({ ukuran = 28 }: { ukuran?: number }) {
  return (
    <svg
      width={ukuran}
      height={ukuran}
      viewBox="-1.5 -1.5 35 35"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 0h18l10 10v18a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
        fill="#1f4a36"
        stroke="#fffcf3"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M22 0v6a4 4 0 0 0 4 4h6z" fill="#8fb39f" />
      <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="#fffcf3" />
    </svg>
  );
}
