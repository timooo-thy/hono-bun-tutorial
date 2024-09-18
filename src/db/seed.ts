import * as fs from "fs";
import * as csv from "csv-parser";
import { Client } from "pg";
import { config } from "dotenv";

config({
  path: ".env",
});

const client = new Client({
  connectionString: process.env.DB_URL,
});

type Instrument = {
  group: string;
  instrument: string;
  department: string;
  country: string;
  exchange: string;
  trade_ccy: string;
  settlement_ccy: string;
};

type Limit = {
  group: string;
  counterparty: string;
  currency: string;
  available_limit: number;
  date: string;
};

const seedLimits = async (limits: Limit[]) => {
  for (const limit of limits) {
    await client.query(
      `INSERT INTO limits ("group", counterparty, currency, available_limit, date) VALUES ($1, $2, $3, $4, $5)`,
      [
        limit.group,
        limit.counterparty,
        limit.currency,
        limit.available_limit,
        limit.date,
      ]
    );
  }
};

const seedInstruments = async (instruments: Instrument[]) => {
  for (const instrument of instruments) {
    await client.query(
      `INSERT INTO instruments ("group", instrument, department, country, exchange, trade_ccy, settlement_ccy) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        instrument.group,
        instrument.instrument,
        instrument.department,
        instrument.country,
        instrument.exchange,
        instrument.trade_ccy,
        instrument.settlement_ccy,
      ]
    );
  }
};

const deleteLimits = async () => {
  await client.query(`DELETE FROM limits`);
};

const deleteInstruments = async () => {
  await client.query(`DELETE FROM instruments`);
};

const readCSV = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const transformedRow: any = {};
        for (const [key, value] of Object.entries(row)) {
          switch (key) {
            case "﻿Instrument Group":
              transformedRow.group = value;
              break;
            case "Available limit":
              transformedRow.available_limit = parseFloat(
                (value as string).replace(/,/g, "")
              );
              break;
            case "DataDate":
              transformedRow.date = value;
              break;
            case "Risk Country":
              transformedRow.country = value;
              break;
            case "Trade CCY":
              transformedRow.trade_ccy = value;
              break;
            case "Settlement CCY":
              transformedRow.settlement_ccy = value;
              break;
            default:
              transformedRow[key.toLowerCase()] = value;
          }
        }
        results.push(transformedRow);
      })
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

async function main() {
  try {
    await client.connect();

    const limits = await readCSV("src/db/limits.csv");
    const instruments = await readCSV("src/db/instruments.csv");

    await deleteLimits();
    await deleteInstruments();

    await seedLimits(limits);
    await seedInstruments(instruments);

    console.log("Data successfully seeded");
  } catch (error) {
    console.error("Error seeding data: ", error);
  } finally {
    await client.end();
  }
}

main();
