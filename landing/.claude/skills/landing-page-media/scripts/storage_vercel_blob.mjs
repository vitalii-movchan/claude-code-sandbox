#!/usr/bin/env node
/* storage_vercel_blob.mjs — STORAGE-провайдер «vercel-blob» (default).
 * Заливает готовый файл в Vercel Blob и возвращает публичный CDN-URL —
 * абсолютный, не попадает в git (исходная боль: не тащить бинарники в репо).
 *
 * Контракт (как у всех storage-скриптов):
 *   node storage_vercel_blob.mjs --file <src> [--name <basename>]
 *   → stdout JSON: { "url": "https://<...>.public.blob.vercel-storage.com/..." }
 *
 * Требует:
 *   - пакет @vercel/blob (npm i @vercel/blob — ставится в корне репо)
 *   - токен BLOB_READ_WRITE_TOKEN в окружении (читается из .env, см. SKILL.md)
 *   - интернет на момент заливки
 * Любого из трёх нет → скрипт падает с понятным сообщением, скилл должен
 * предложить пару с storage=local (см. provider-profiles.md #vercel-blob).
 */
import { readFileSync, existsSync } from "node:fs";
import { basename } from "node:path";

function arg(name) {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
function die(m) { process.stderr.write(m + "\n"); process.exit(1); }

const file = arg("--file");
const name = arg("--name") || (file && basename(file));
if (!file) die("usage: storage_vercel_blob.mjs --file <src> [--name <basename>]");
if (!existsSync(file)) die(`source file not found: ${file}`);

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) die("BLOB_READ_WRITE_TOKEN is not set (put it in .env and export, see SKILL.md)");

let put;
try {
  ({ put } = await import("@vercel/blob"));
} catch {
  die("@vercel/blob is not installed. Run: npm i @vercel/blob (in repo root)");
}

try {
  const body = readFileSync(file);
  // addRandomSuffix: разные слоты могут иметь одинаковое имя — пусть Blob
  // разведёт их сам, чтобы заливка не перетирала предыдущую картинку.
  const { url } = await put(name, body, {
    access: "public",
    token,
    addRandomSuffix: true,
  });
  process.stdout.write(JSON.stringify({ url }) + "\n");
} catch (e) {
  die(`upload to Vercel Blob failed: ${e.message}`);
}
