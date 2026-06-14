#!/usr/bin/env node
/*
 * landing-image-audit — сканер слотов-изображений в SITE_DATA.
 *
 * Грузит pages/<landing>/js/data.js в изолированном vm-контексте, рекурсивно
 * обходит window.SITE_DATA и собирает каждый слот, чьё значение похоже на
 * изображение (путь img/…, расширение картинки или http(s)-URL).
 *
 * Печатает markdown-таблицу `mock (slot) → ссылка для заполнения`: левая
 * колонка — путь до слота (reviews[0].photo, media.hero…), правая — пустой
 * плейсхолдер «← вписать». Это read-only: data.js не трогаем.
 *
 * Запуск:  node scan.mjs <landing> [--pages <dir>]
 *   <landing>     имя папки в pages/ (car_service, pet_care…)
 *   --pages <dir> корень pages/ (по умолчанию — поднимаемся от скилла к
 *                 landing/pages; можно переопределить)
 */
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const PLACEHOLDER = "← вписать";
// Значение-картинка: путь img/… или расширение картинки (в т.ч. http(s)-URL
// с расширением). Голый http-URL без расширения картинкой НЕ считается —
// иначе соц-ссылки / CTA / сайты ловятся как ложные слоты.
const IMAGE_RE = /(\.(jpe?g|png|webp|svg|gif|avif)(\?.*)?$)|(^img\/)/i;

function parseArgs(argv) {
  const args = { landing: null, pages: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--pages") args.pages = argv[++i];
    else if (!args.landing) args.landing = a;
  }
  return args;
}

function defaultPagesDir() {
  // scripts/scan.mjs → landing-image-audit → skills → .claude → landing → pages
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, "..", "..", "..", "..", "pages");
}

function loadSiteData(dataPath) {
  const src = readFileSync(dataPath, "utf8");
  const sandbox = { window: {} };
  createContext(sandbox);
  runInContext(src, sandbox, { filename: dataPath });
  const data = sandbox.window.SITE_DATA;
  if (data == null || typeof data !== "object") {
    throw new Error(`window.SITE_DATA не найден или не объект в ${dataPath}`);
  }
  return data;
}

// Рекурсивный обход: накапливаем (slotPath, value) для строковых
// значений-картинок. Путь строим в JS-нотации: a.b[0].c.
function collectSlots(node, path, out) {
  if (typeof node === "string") {
    if (IMAGE_RE.test(node)) out.push({ slot: path, value: node });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, i) => collectSlots(item, `${path}[${i}]`, out));
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, val] of Object.entries(node)) {
      const next = path ? `${path}.${key}` : key;
      collectSlots(val, next, out);
    }
  }
}

function renderTable(slots) {
  const header = "| mock (slot) | ссылка для заполнения |";
  const sep = "|---|---|";
  if (slots.length === 0) {
    return `${header}\n${sep}\n| _(слотов-изображений в SITE_DATA нет)_ | — |`;
  }
  const rows = slots.map((s) => `| ${s.slot} | ${PLACEHOLDER} |`);
  return [header, sep, ...rows].join("\n");
}

function main() {
  const { landing, pages } = parseArgs(process.argv.slice(2));
  if (!landing) {
    console.error("Usage: node scan.mjs <landing> [--pages <dir>]");
    process.exit(2);
  }
  const pagesDir = pages ? resolve(pages) : defaultPagesDir();
  const dataPath = join(pagesDir, landing, "js", "data.js");

  let data;
  try {
    data = loadSiteData(dataPath);
  } catch (err) {
    console.error(`Ошибка чтения ${dataPath}: ${err.message}`);
    process.exit(1);
  }

  const slots = [];
  collectSlots(data, "", slots);

  console.log(`# Слоты-изображения SITE_DATA — ${landing}\n`);
  console.log(renderTable(slots));
  console.log(`\n_Найдено слотов: ${slots.length}. Колонка справа — плейсхолдер; скилл read-only, data.js не менялся._`);
}

main();
