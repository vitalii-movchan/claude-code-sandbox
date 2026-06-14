#!/usr/bin/env node
/* storage_local.mjs — STORAGE-провайдер «local».
 * Кладёт готовый файл в pages/<лендинг>/img/ и возвращает ОТНОСИТЕЛЬНЫЙ путь
 * (img/<имя>) — ровно то, что ждёт существующий data-bg-механизм лендингов.
 *
 * Контракт (общий для всех storage-скриптов):
 *   node storage_local.mjs --landing <dir> --file <src> [--name <basename>]
 *   → печатает в stdout JSON: { "url": "<значение для data.js>" }
 * Так SKILL.md дёргает любой storage одинаково и берёт url из stdout.
 *
 * Сильные/слабые стороны — references/provider-profiles.md (#local).
 */
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join, basename, extname } from "node:path";

function arg(name) {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
function die(m) { process.stderr.write(m + "\n"); process.exit(1); }

const landing = arg("--landing");
const file = arg("--file");
let name = arg("--name");
if (!landing || !file) die("usage: storage_local.mjs --landing <dir> --file <src> [--name <basename>]");
if (!existsSync(file)) die(`source file not found: ${file}`);

if (!name) name = basename(file);
if (!extname(name)) name += extname(file); // на случай имени без расширения

const imgDir = resolve(join(landing, "img"));
mkdirSync(imgDir, { recursive: true });
const dest = join(imgDir, name);
copyFileSync(file, dest);

// Относительный путь — как в существующих data.js (img/review-1.jpg).
process.stdout.write(JSON.stringify({ url: `img/${name}` }) + "\n");
