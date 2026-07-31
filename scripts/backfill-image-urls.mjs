// One-time script to backfill column G (ImageUrl) in the products Sheet
// with the real Cloudinary secure_url for images that were already
// uploaded (via scripts/upload-images.mjs) but never registered in the Sheet.
// Usage: node scripts/backfill-image-urls.mjs [--dry-run]
import { v2 as cloudinary } from "cloudinary";
import { auth, sheets } from "@googleapis/sheets";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env.local") });

const DRY_RUN = process.argv.includes("--dry-run");
const CLOUDINARY_FOLDER = "mefale/products";
const RANGE = "A2:G";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getSheetsClient() {
  const authClient = new auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return sheets({ version: "v4", auth: authClient });
}

async function fetchAllCloudinaryUrls() {
  const map = new Map(); // sku -> secure_url
  let nextCursor;
  let page = 0;

  do {
    const res = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: `${CLOUDINARY_FOLDER}/`,
      max_results: 500,
      next_cursor: nextCursor,
    });

    for (const r of res.resources) {
      const sku = r.public_id.slice(CLOUDINARY_FOLDER.length + 1);
      map.set(sku, r.secure_url);
    }

    nextCursor = res.next_cursor;
    page++;
    process.stdout.write(`\rCloudinary: página ${page}, ${map.size} imágenes encontradas`);
  } while (nextCursor);

  console.log("");
  return map;
}

async function main() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const sheets = getSheetsClient();

  const cloudinaryMap = await fetchAllCloudinaryUrls();

  const current = await sheets.spreadsheets.values.get({ spreadsheetId, range: RANGE });
  const rows = current.data.values ?? [];

  let filled = 0;
  let alreadySet = 0;
  let noImage = 0;

  const updated = rows.map((row) => {
    const sku = row[0]?.trim();
    const existingUrl = row[6]?.trim();
    if (!sku) return row;

    if (existingUrl) {
      alreadySet++;
      return row;
    }

    const url = cloudinaryMap.get(sku);
    if (!url) {
      noImage++;
      return row;
    }

    filled++;
    const newRow = [...row];
    while (newRow.length < 7) newRow.push("");
    newRow[6] = url;
    return newRow;
  });

  console.log(`\nProductos en el Sheet: ${rows.length}`);
  console.log(`Ya tenían columna G:   ${alreadySet}`);
  console.log(`Se completarían:       ${filled}`);
  console.log(`Sin imagen en Cloudinary: ${noImage}`);

  if (DRY_RUN) {
    console.log("\n--dry-run: no se escribió nada. Ejemplos de filas a completar:");
    let shown = 0;
    for (let i = 0; i < rows.length && shown < 10; i++) {
      if (rows[i][6]?.trim()) continue;
      const sku = rows[i][0]?.trim();
      const url = cloudinaryMap.get(sku);
      if (url) {
        console.log(`  ${sku} -> ${url}`);
        shown++;
      }
    }
    return;
  }

  if (filled === 0) {
    console.log("\nNada para actualizar.");
    return;
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: RANGE,
    valueInputOption: "RAW",
    requestBody: { values: updated },
  });

  console.log(`\nListo. ${filled} filas actualizadas con su URL de Cloudinary.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
