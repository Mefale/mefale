// One-time script to upload product images to Cloudinary
// Usage: node scripts/upload-images.mjs
// Images must be in D:\fotos (WSL: /mnt/d/fotos)
// Each file must be named with the product SKU, e.g. LAML0130004.jpg

import { v2 as cloudinary } from "cloudinary";
import { readdir } from "fs/promises";
import { join } from "path";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env.local") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGES_DIR = "/mnt/d/fotos";
const CLOUDINARY_FOLDER = "mefale/products";
const CONCURRENCY = 5;

async function uploadImage(filename) {
  const sku = filename.replace(/\.jpg$/i, "");
  const filePath = join(IMAGES_DIR, filename);

  await cloudinary.uploader.upload(filePath, {
    public_id: sku,
    folder: CLOUDINARY_FOLDER,
    overwrite: false, // skip if already uploaded
    resource_type: "image",
  });

  return sku;
}

async function main() {
  const files = (await readdir(IMAGES_DIR)).filter((f) =>
    f.toLowerCase().endsWith(".jpg")
  );

  console.log(`Found ${files.length} images. Starting upload...\n`);

  let done = 0;
  let errors = 0;

  // Process in batches of CONCURRENCY
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(batch.map(uploadImage));

    for (const result of results) {
      done++;
      if (result.status === "rejected") {
        errors++;
        console.error(`  ERROR: ${result.reason?.message ?? result.reason}`);
      }
    }

    process.stdout.write(`\rProgress: ${done}/${files.length} (${errors} errors)`);
  }

  console.log(`\n\nDone! ${done - errors} uploaded, ${errors} errors.`);
}

main().catch(console.error);
