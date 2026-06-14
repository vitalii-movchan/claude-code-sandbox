#!/usr/bin/env node
/* source_stock.mjs — SOURCE-провайдер «stock» (default).
 * По ключевым словам слота тянет тематическое фото из бесплатного стока и
 * скачивает кадр во временный файл. Storage потом зальёт его и вернёт URL.
 *
 * Контракт (как у всех source-скриптов):
 *   node source_stock.mjs --query "<ключевые слова>" [--out <path>] [--orientation landscape|portrait|squarish]
 *   → stdout JSON: { "file": "<путь к скачанному файлу>", "credit": "<автор/источник>" }
 * Скилл берёт .file и отдаёт его в storage-скрипт.
 *
 * Провайдер выбирается по доступному ключу в окружении (читается из .env):
 *   - UNSPLASH_ACCESS_KEY → Unsplash
 *   - PEXELS_API_KEY      → Pexels
 * Нет ни одного ключа / нет интернета → падает с понятным сообщением; скилл
 * должен предложить source=user-supplied (см. provider-profiles.md #stock).
 */
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function arg(name) {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
function die(m) { process.stderr.write(m + "\n"); process.exit(1); }

const query = arg("--query");
const orientation = arg("--orientation") || "landscape";
if (!query) die('usage: source_stock.mjs --query "<keywords>" [--out <path>] [--orientation ...]');

const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
const pexelsKey = process.env.PEXELS_API_KEY;
if (!unsplashKey && !pexelsKey) {
  die("no stock API key found. Set UNSPLASH_ACCESS_KEY or PEXELS_API_KEY in .env (see SKILL.md), or use source=user-supplied");
}

// Возвращает { downloadUrl, credit } для запроса, дёргая доступный сток.
async function pick() {
  if (unsplashKey) {
    const u = new URL("https://api.unsplash.com/photos/random");
    u.searchParams.set("query", query);
    u.searchParams.set("orientation", orientation);
    const r = await fetch(u, { headers: { Authorization: `Client-ID ${unsplashKey}` } });
    if (!r.ok) throw new Error(`Unsplash ${r.status}: ${await r.text()}`);
    const j = await r.json();
    return { downloadUrl: j.urls?.regular, credit: `Unsplash / ${j.user?.name || "unknown"}` };
  }
  // Pexels
  const u = new URL("https://api.pexels.com/v1/search");
  u.searchParams.set("query", query);
  u.searchParams.set("orientation", orientation);
  u.searchParams.set("per_page", "1");
  const r = await fetch(u, { headers: { Authorization: pexelsKey } });
  if (!r.ok) throw new Error(`Pexels ${r.status}: ${await r.text()}`);
  const j = await r.json();
  const photo = j.photos?.[0];
  if (!photo) throw new Error(`Pexels: no results for "${query}"`);
  return { downloadUrl: photo.src?.large, credit: `Pexels / ${photo.photographer || "unknown"}` };
}

try {
  const { downloadUrl, credit } = await pick();
  if (!downloadUrl) throw new Error(`no image returned for "${query}"`);
  const img = await fetch(downloadUrl);
  if (!img.ok) throw new Error(`download failed: ${img.status}`);
  const buf = Buffer.from(await img.arrayBuffer());

  const out = arg("--out") || join(tmpdir(), `stock-${query.replace(/[^a-z0-9]+/gi, "-").slice(0, 40)}-${buf.length}.jpg`);
  writeFileSync(out, buf);
  process.stdout.write(JSON.stringify({ file: out, credit }) + "\n");
} catch (e) {
  die(`stock fetch failed: ${e.message}`);
}
