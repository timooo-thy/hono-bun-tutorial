import { pgTable, serial, varchar, bigint, date } from "drizzle-orm/pg-core";

export const instruments = pgTable("instruments", {
  id: serial("id").primaryKey(),
  group: varchar("group", { length: 64 }).notNull(),
  instrument: varchar("instrument", { length: 128 }).notNull(),
  department: varchar("department", { length: 16 }).notNull(),
  country: varchar("country", { length: 32 }).notNull(),
  exchange: varchar("exchange", { length: 128 }).notNull(),
  trade_ccy: varchar("trade_ccy", { length: 8 }).notNull(),
  settlement_ccy: varchar("settlement_ccy", { length: 8 }).notNull(),
});

export const limits = pgTable("limits", {
  id: serial("id").primaryKey(),
  group: varchar("group", { length: 64 }).notNull(),
  counterparty: varchar("counterparty", { length: 128 }).notNull(),
  currency: varchar("currency", { length: 8 }).notNull(),
  available_limit: bigint("available_limit", { mode: "number" }).notNull(),
  date: date("date").notNull(),
});
