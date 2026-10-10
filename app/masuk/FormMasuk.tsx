"use client";
// Formulir masuk. "use client" hanya untuk menampilkan pesan gagal dan
// keadaan "Memeriksa…" tanpa memuat ulang halaman; pemeriksaannya sendiri
// terjadi di server (aksi.ts).
import { useActionState } from "react";
import { masuk } from "./aksi";
import styles from "./masuk.module.css";

export function FormMasuk() {
  const [hasil, kirim, sedangMemeriksa] = useActionState(masuk, null);

  return (
    <form action={kirim} className={styles.form}>
      <label className={styles.label}>
        Email
        <input
          className={styles.isian}
          type="email"
          name="email"
          autoComplete="username"
          defaultValue={hasil?.email}
          required
          autoFocus
        />
      </label>

      <label className={styles.label}>
        Password
        <input
          className={styles.isian}
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </label>

      {hasil && (
        <p className={styles.gagal} role="alert">
          {hasil.pesan}
        </p>
      )}

      <button className={styles.tombol} type="submit" disabled={sedangMemeriksa}>
        {sedangMemeriksa ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
