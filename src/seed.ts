import fs from "fs";
import csv from "csv-parser";

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
    console.log(`Inserting blob with ${dataBlob.length} rows`, dataBlob);
  }
};

seed();
