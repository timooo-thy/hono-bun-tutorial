import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { config } from "dotenv";

config({
  path: ".env",
});

const client = new Client({
  connectionString: process.env.DB_URL!,
});

client
  .connect()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Error connecting to the database", err);
  });

export const db = drizzle(client);
