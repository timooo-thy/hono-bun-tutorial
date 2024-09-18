import { pgTable, serial, varchar, bigint, date } from "drizzle-orm/pg-core";

export const instruments = pgTable("instruments", {
  id: serial("id").primaryKey(),
  group: varchar("group", { length: 64 }),
  instrument: varchar("instrument", { length: 128 }),
  department: varchar("department", { length: 16 }),
  country: varchar("country", { length: 32 }),
  exchange: varchar("exchange", { length: 128 }),
  trade_ccy: varchar("trade_ccy", { length: 8 }),
  settlement_ccy: varchar("settlement_ccy", { length: 8 }),
});

export const limits = pgTable("limits", {
  id: serial("id").primaryKey(),
  group: varchar("group", { length: 64 }),
  counterparty: varchar("counterparty", { length: 128 }),
  currency: varchar("currency", { length: 8 }),
  available_limit: bigint("available_limit", { mode: "number" }),
  date: date("date"),
});
