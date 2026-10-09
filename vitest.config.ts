import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// Variabel lingkungan dibaca dari .env.local (di laptop) atau dari secrets
// GitHub Actions (di CI).
export default defineConfig(({ mode }) => ({
  test: {
    include: ["tests/**/*.test.ts"],
    env: loadEnv(mode, process.cwd(), ""),
    testTimeout: 20_000,
  },
}));
