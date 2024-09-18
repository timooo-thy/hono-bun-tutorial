import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({
  path: ".env",
});

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL!,
  },
});
