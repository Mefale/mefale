// One-off (re-runnable) script: sets column H (Marca) to a default value
// for every product that currently has it blank. Useful after importing
// new products that don't match any known brand pattern.
//
// Usage:
//   node set-default-brand.mjs                (dry run, no writes)
//   node set-default-brand.mjs --write         (writes for real)
//   node set-default-brand.mjs --write --value "Otro texto"

import { auth, sheets } from "@googleapis/sheets";
import dotenv from "dotenv";

dotenv.config({ path: new URL("../.env.local", import.meta.url) });

const RANGE = "A2:H";
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const DEFAULT_BRAND = "Alternativo";

function getClient() {
  const authClient = new auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return sheets({ version: "v4", auth: authClient });
}

async function main() {
  const write = process.argv.includes("--write");
  const valueIdx = process.argv.indexOf("--value");
  const value = valueIdx !== -1 ? process.argv[valueIdx + 1] : DEFAULT_BRAND;

  if (!SPREADSHEET_ID) {
    console.error("Falta GOOGLE_SHEETS_ID en .env.local");
    process.exit(1);
  }

  const client = getClient();
  const res = await client.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });
  const rows = res.data.values ?? [];

  const changes = [];
  rows.forEach((row, i) => {
    const sku = row[0]?.trim();
    const name = row[2]?.trim();
    const currentBrand = row[7]?.trim() ?? "";
    if (!sku || !name) return;
    if (currentBrand) return;

    const sheetRow = i + 2;
    changes.push({ sheetRow, sku, name });
  });

  console.log(`\nTotal productos: ${rows.length}`);
  console.log(`Con marca ya asignada: ${rows.length - changes.length}`);
  console.log(`Sin marca (a setear "${value}"): ${changes.length}\n`);

  console.log("Primeros 20:");
  for (const c of changes.slice(0, 20)) {
    console.log(`   ${c.sku}  ${c.name}`);
  }
  if (changes.length > 20) {
    console.log(`   ... y ${changes.length - 20} más.`);
  }

  if (!write) {
    console.log("\n(DRY RUN — no se escribió nada. Correr con --write para aplicar.)");
    return;
  }

  if (changes.length === 0) {
    console.log("\nNada para escribir.");
    return;
  }

  console.log(`\nEscribiendo "${value}" en ${changes.length} productos...`);
  const data = changes.map((c) => ({
    range: `H${c.sheetRow}`,
    values: [[value]],
  }));

  // batchUpdate acepta hasta un límite razonable de rangos por request;
  // para volúmenes grandes lo partimos en tandas de 500.
  const CHUNK = 500;
  for (let i = 0; i < data.length; i += CHUNK) {
    const slice = data.slice(i, i + CHUNK);
    await client.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { valueInputOption: "RAW", data: slice },
    });
    console.log(`   ${Math.min(i + CHUNK, data.length)}/${data.length}`);
  }

  console.log("Listo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
