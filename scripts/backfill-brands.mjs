// One-off script: backfill column H (Marca) based on matches found in the
// product name (column C). Run with --dry-run (default) to only preview,
// or --write to actually update the Sheet.
//
// Usage:
//   node backfill-brands.mjs            (dry run, no writes)
//   node backfill-brands.mjs --write    (writes for real)

import { auth, sheets } from "@googleapis/sheets";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: new URL("../.env.local", import.meta.url) });

const RANGE = "A2:H";
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

const BRAND_PATTERNS = [
  { brand: "Kalop", regex: /\bkalop\b/i },
  { brand: "Argenplas", regex: /\bargenplas\b/i },
  { brand: "Jeluz", regex: /\bjeluz\b/i },
  { brand: "Re-Flex", regex: /\bre[\s-]?flex\b/i },
  { brand: "Sica", regex: /\bsica\b/i },
  { brand: "Dayton", regex: /\bdayton\b/i },
];

function matchBrand(name) {
  const matches = BRAND_PATTERNS.filter((p) => p.regex.test(name));
  return matches;
}

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
  const ambiguous = [];
  let matchedCount = 0;
  let blankCount = 0;
  let unchangedCount = 0;

  rows.forEach((row, i) => {
    const sku = row[0]?.trim();
    const name = row[2]?.trim();
    const currentBrand = row[7]?.trim() ?? "";
    if (!sku || !name) return;

    const matches = matchBrand(name);
    const newBrand = matches.length > 0 ? matches[0].brand : "";

    if (matches.length > 1) {
      ambiguous.push({ sku, name, matches: matches.map((m) => m.brand) });
    }

    const sheetRow = i + 2;
    if (newBrand === currentBrand) {
      unchangedCount++;
      return;
    }

    changes.push({ sheetRow, sku, name, from: currentBrand || "(vacío)", to: newBrand || "(vacío)" });
    if (newBrand) matchedCount++;
    else blankCount++;
  });

  console.log(`\nTotal productos: ${rows.length}`);
  console.log(`Sin cambios (ya coincide): ${unchangedCount}`);
  console.log(`A actualizar: ${changes.length} (${matchedCount} con marca, ${blankCount} a blanco)\n`);

  const perBrand = {};
  for (const c of changes) {
    if (c.to === "(vacío)") continue;
    perBrand[c.to] = (perBrand[c.to] ?? 0) + 1;
  }
  console.log("Por marca:");
  for (const [brand, count] of Object.entries(perBrand).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${brand.padEnd(12)} ${count}`);
  }
  console.log("");

  if (ambiguous.length > 0) {
    console.log(`⚠️  ${ambiguous.length} producto(s) matchean MÁS DE UNA marca (se usó la primera de la lista):`);
    for (const a of ambiguous) {
      console.log(`   ${a.sku} — "${a.name}" — ${a.matches.join(", ")}`);
    }
    console.log("");
  }

  console.log("Primeros 40 cambios:");
  console.log("SKU".padEnd(16), "Nombre".padEnd(50), "Antes".padEnd(12), "Después");
  for (const c of changes.slice(0, 40)) {
    console.log(
      c.sku.padEnd(16),
      c.name.slice(0, 48).padEnd(50),
      c.from.padEnd(12),
      c.to
    );
  }
  if (changes.length > 40) {
    console.log(`... y ${changes.length - 40} más.`);
  }

  if (!write) {
    console.log("\n(DRY RUN — no se escribió nada. Correr con --write para aplicar.)");
    return;
  }

  if (changes.length === 0) {
    console.log("\nNada para escribir.");
    return;
  }

  console.log(`\nEscribiendo ${changes.length} cambios...`);
  const data = changes.map((c) => ({
    range: `H${c.sheetRow}`,
    values: [[c.to === "(vacío)" ? "" : c.to]],
  }));

  await client.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { valueInputOption: "RAW", data },
  });

  console.log("Listo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
