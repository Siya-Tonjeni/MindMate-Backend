// prisma/prisma.config.ts
import { defineConfig } from "@prisma/config";

export default defineConfig({
  datasource: {
    // Prisma will read the string from process.env.DATABASE_URL at runtime
    url: process.env.DATABASE_URL!,
  },
});
