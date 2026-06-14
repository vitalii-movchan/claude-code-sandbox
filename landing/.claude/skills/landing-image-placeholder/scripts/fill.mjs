#!/usr/bin/env node
/*
 * landing-image-placeholder — вписывает ссылки в слоты-изображения SITE_DATA.
 *
 * Зеркало landing-image-audit: тот рекурсивно ЧИТАЕТ слоты и печатает таблицу
 * `mock (slot) → ссылка для заполнения`; этот берёт ту же таблицу с УЖЕ
 * вписанными во вторую колонку ссылками и ЗАПИСЫВАЕТ их в pages/<landing>/js/data.js.
 *
 * Вход — заполненная markdown-таблица audit (через --table <file> или stdin).
 * Парсятся строки `| <slot> | <url> |`; шапка, разделитель и плейсхолдер
 * «← вписать» (незаполненные строки) пропускаются.
 *
 * Запись безопасна для data.js (это JS-исходник, не JSON): значение слота
 * резолвится через vm, затем в исходнике заменяется ИМЕННО тот строковый литерал,
 * сохраняя формат файла (кавычки, отступы, комментарии). Меняется только URL
 * внутри кавычек.
 *
 * Валидация (симметрично audit): пишем ТОЛЬКО в существующий слот, чьё текущее
 * значение проходит тот же IMAGE_RE. Не существует / не картинка → строка
 * пропускается и попадает в отчёт; data.js не трогаем, если применимых строк нет.
 *
 * Запуск:  node fill.mjs <landing> [--table <file>] [--pages <dir>] [--dry-run]
 *   <landing>     имя папки в pages/ (car_service, pet_care…)
 *   --table <f>   файл с заполненной таблицей (по умолчанию — читаем stdin)
 *   --pages <dir> корень pages/ (по умолчанию — поднимаемся от скилла к landing/pages)
 *   --dry-run     показать, что изменилось бы, но не писать на диск
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const PLACEHOLDER = "← вписать";
// Значение-картинка — тот же критерий, что в landing-image-audit/scripts/scan.mjs.
const IMAGE_RE = /(^https?:\/\/)|(\.(jpe?g|png|webp|svg|gif|avif)(\?.*)?$)|(^img\/)/i;

function parseArgs(argv) {
  const args = { landing: null, table: null, pages: null, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--table") args.table = argv[++i];
    else if (a === "--pages") args.pages = argv[++i];
    else if (a === "--dry-run") args.dryRun = true;
    else if (!args.landing) args.landing = a;
  }
  return args;
}

function defaultPagesDir() {
  // scripts/fill.mjs → landing-image-placeholder → skills → .claude → landing → pages
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, "..", "..", "..", "..", "pages");
}

function readInput(tableFile) {
  if (tableFile) return readFileSync(resolve(tableFile), "utf8");
  return readFileSync(0, "utf8"); // stdin
}

// Парсим заполненную audit-таблицу: строки `| <slot> | <url> |`.
// Пропускаем шапку (`mock (slot)`), разделитель (`|---|`) и незаполненные
// строки (правая ячейка пуста, прочерк или ещё содержит плейсхолдер).
function parseTable(text) {
  const pairs = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 2) continue;
    const [slot, url] = cells;
    if (!slot || slot.startsWith("---")) continue;
    if (slot.toLowerCase().startsWith("mock")) continue; // шапка
    if (slot.startsWith("_(")) continue; // «слотов нет»
    if (!url || url === "—" || url.includes(PLACEHOLDER)) continue; // не заполнено
    pairs.push({ slot, url });
  }
  return pairs;
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
  return { src, data };
}

// Резолвим JS-адрес слота (a.b[0].c) в текущее значение, не доверяя eval.
// Возвращаем undefined, если путь не существует.
function resolveSlot(data, slotPath) {
  const tokens = [];
  for (const part of slotPath.split(/(\[\d+\])/)) {
    if (!part) continue;
    const idx = part.match(/^\[(\d+)\]$/);
    if (idx) tokens.push(Number(idx[1]));
    else for (const k of part.split(".")) if (k) tokens.push(k);
  }
  let node = data;
  for (const t of tokens) {
    if (node == null || typeof node !== "object") return undefined;
    node = node[t];
  }
  return node;
}

// Полный рекурсивный обход в ТОМ ЖЕ порядке, что и landing-image-audit/scan.mjs.
// Для каждого строкового слота-картинки запоминаем, какое по счёту (0-based) это
// вхождение его значения среди всех одинаковых литералов — это и есть позиция
// литерала в исходнике (порядок текстовых вхождений совпадает с порядком обхода
// объекта, т.к. значения сериализованы в data.js в том же порядке). Так слот
// адресует свой литерал даже при дублях значений, независимо от порядка таблицы.
function indexSlots(node, path, out, counts) {
  if (typeof node === "string") {
    if (IMAGE_RE.test(node)) {
      const occ = counts.get(node) ?? 0;
      counts.set(node, occ + 1);
      out.set(path, occ);
    }
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, i) => indexSlots(item, `${path}[${i}]`, out, counts));
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, val] of Object.entries(node)) {
      indexSlots(val, path ? `${path}.${key}` : key, out, counts);
    }
  }
}

// Находим в ИСХОДНИКЕ occurrence-е (0-based) вхождение строкового литерала oldVal
// и возвращаем {start, end, quote} — границы литерала вместе с кавычками. Поиск по
// одинаковым значениям ведётся по неизменному src, чтобы индексы вхождений не
// сдвигались; применяем замены потом разом справа налево.
function locateNthLiteral(src, oldVal, occurrence) {
  for (const q of ['"', "'", "`"]) {
    const needle = q + oldVal + q;
    let from = 0, seen = 0, idx;
    while ((idx = src.indexOf(needle, from)) !== -1) {
      if (seen === occurrence) {
        return { start: idx, end: idx + needle.length, quote: q };
      }
      seen++;
      from = idx + needle.length;
    }
  }
  return null; // литерал не найден ровно в таком виде
}

function main() {
  const { landing, table, pages, dryRun } = parseArgs(process.argv.slice(2));
  if (!landing) {
    console.error("Usage: node fill.mjs <landing> [--table <file>] [--pages <dir>] [--dry-run]");
    process.exit(2);
  }
  const pagesDir = pages ? resolve(pages) : defaultPagesDir();
  const dataPath = join(pagesDir, landing, "js", "data.js");

  let src, data;
  try {
    ({ src, data } = loadSiteData(dataPath));
  } catch (err) {
    console.error(`Ошибка чтения ${dataPath}: ${err.message}`);
    process.exit(1);
  }

  let pairs;
  try {
    pairs = parseTable(readInput(table));
  } catch (err) {
    console.error(`Ошибка чтения таблицы: ${err.message}`);
    process.exit(1);
  }

  // Карта «слот → индекс вхождения его литерала» по полному обходу (порядок scan.mjs).
  const slotOccurrence = new Map();
  indexSlots(data, "", slotOccurrence, new Map());

  const applied = [];
  const skipped = [];
  const edits = []; // {start, end, quote, url} по исходному src

  for (const { slot, url } of pairs) {
    const current = resolveSlot(data, slot);
    if (current === undefined) {
      skipped.push({ slot, url, reason: "слот не существует" });
      continue;
    }
    if (typeof current !== "string" || !IMAGE_RE.test(current)) {
      skipped.push({ slot, url, reason: "слот не является img-слотом" });
      continue;
    }
    if (current === url) {
      skipped.push({ slot, url, reason: "значение уже совпадает" });
      continue;
    }
    // Индекс вхождения берём из карты обхода — это надёжно адресует литерал
    // именно этого слота, даже если значение дублируется в других слотах.
    const occ = slotOccurrence.get(slot) ?? 0;
    const loc = locateNthLiteral(src, current, occ);
    if (loc == null) {
      skipped.push({ slot, url, reason: "литерал не найден в исходнике" });
      continue;
    }
    edits.push({ ...loc, url });
    applied.push({ slot, from: current, to: url });
  }

  // Применяем разом справа налево по исходному src — индексы не сдвигаются.
  let nextSrc = src;
  for (const e of edits.sort((a, b) => b.start - a.start)) {
    nextSrc = nextSrc.slice(0, e.start) + e.quote + e.url + e.quote + nextSrc.slice(e.end);
  }

  if (applied.length > 0 && !dryRun) {
    writeFileSync(dataPath, nextSrc, "utf8");
  }

  // Отчёт.
  console.log(`# Заполнение слотов-изображений — ${landing}${dryRun ? " (dry-run)" : ""}\n`);
  console.log(`| slot | вписано |`);
  console.log(`|---|---|`);
  if (applied.length === 0) {
    console.log(`| _(нечего применять)_ | — |`);
  } else {
    for (const a of applied) console.log(`| ${a.slot} | ${a.to} |`);
  }
  if (skipped.length > 0) {
    console.log(`\n## Пропущено\n`);
    console.log(`| slot | причина |`);
    console.log(`|---|---|`);
    for (const s of skipped) console.log(`| ${s.slot} | ${s.reason} |`);
  }
  const verb = dryRun ? "было бы применено" : "применено";
  console.log(`\n_Слотов ${verb}: ${applied.length}, пропущено: ${skipped.length}.${dryRun ? " Dry-run: data.js не менялся." : applied.length ? "" : " data.js не менялся."}_`);
}

main();
