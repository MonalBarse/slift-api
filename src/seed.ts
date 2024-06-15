import fs from "fs";
import csv from "csv-parser";
import { Index } from "@upstash/vector";

import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const { VECTOR_URL, VECTOR_TOKEN } = process.env;

if (!VECTOR_URL || !VECTOR_TOKEN) {
  throw new Error(
    "VECTOR_URL and VECTOR_TOKEN must be set in environment variables",
  );
}

const index = new Index({
  // Create a new instance of the Index class which will be used to interact with the database (Upstash) (index.query, index.upsert, index.delete, etc.)
  url: VECTOR_URL,
  token: VECTOR_TOKEN,
});

interface Row {
  text: string;
}

async function parseCSV(filepath: string): Promise<Row[]> {
  const rows: Row[] = [];
  return new Promise((res, rej) => {
    fs.createReadStream(filepath)
      .pipe(csv({ separator: "," }))
      .on("data", (row) => {
        rows.push(row);
      })
      .on("error", (err) => {
        rej(err);
      })
      .on("end", () => {
        res(rows);
      });
  });
}

const BLOB = 40;
const seed = async () => {
  const rows = await parseCSV("data.csv");

  for (let i = 0; i < rows.length; i += BLOB) {
    const blob = rows.slice(i, i + BLOB);
    // Insert a blob into the database
    const dataBlob = blob.map((row, index) => {
      return {
        id: i + index,
        data: row.text,
        metadata: { text: row.text },
      };
    });
    await index.upsert(dataBlob);
  }
};

seed();
