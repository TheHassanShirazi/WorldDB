import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Vitest does not read tsconfig `paths`, so the @/ alias has to be
    // restated here or every import from "@/domain" fails to resolve.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // The domain tests finish in milliseconds, but the API tests talk to
    // Atlas. Mongoose alone allows 15s for server selection, so the default
    // 10s hook timeout could never succeed on a cold connection.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
