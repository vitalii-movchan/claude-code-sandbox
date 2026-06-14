#!/usr/bin/env node
/* source_user.mjs — SOURCE-провайдер «user-supplied».
 * Сопоставляет готовые файлы из папки пользователя со слотами карты.
 * Сам ничего не качает и никуда не кладёт — только решает, какой файл какому
 * слоту соответствует. Дальше storage заливает выбранные файлы.
 *
 * Две стратегии сопоставления:
 *   --by name  (default): по имени файла. Файл матчится слоту, если его имя
 *              (без расширения) совпадает с currentValue-базнеймом слота
 *              (review-1.jpg → review-1.*) либо с key/секцией слота
 *              (hero.* → слот key=hero). Самый предсказуемый способ.
 *   --by order: по порядку — i-й файл (отсортированы по имени) к i-му слоту.
 *              Грубо, но удобно когда имена не бьются; требует ручной сверки.
 *
 * Контракт:
 *   node source_user.mjs --dir <папка> --slots <slot_map.json> [--by name|order]
 *   → stdout JSON: { "matches": [ { jsonPath, file, by }... ], "unmatchedSlots": [...], "unusedFiles": [...] }
 * Скилл показывает это пользователю на подтверждение, потом гонит каждый
 * match.file через storage. Резюме — provider-profiles.md #user-supplied.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, basename, extname } from "node:path";

function arg(name) {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
function die(m) { process.stderr.write(m + "\n"); process.exit(1); }

const dir = arg("--dir");
const slotsPath = arg("--slots");
const by = arg("--by") || "name";
if (!dir || !slotsPath) die("usage: source_user.mjs --dir <folder> --slots <slot_map.json> [--by name|order]");

const IMG_RE = /\.(jpe?g|png|webp|gif|avif|svg)$/i;

let map;
try { map = JSON.parse(readFileSync(slotsPath, "utf8")); }
catch (e) { die(`cannot read slot map: ${e.message}`); }
const slots = map.sections.flatMap((s) => s.slots);

let files;
try {
  files = readdirSync(dir).filter((f) => IMG_RE.test(f) && statSync(join(dir, f)).isFile()).sort();
} catch (e) { die(`cannot read dir: ${e.message}`); }
if (files.length === 0) die(`no image files in ${dir}`);

const matches = [];
const usedFiles = new Set();
const unmatched = [];

if (by === "order") {
  slots.forEach((slot, i) => {
    if (i < files.length) {
      matches.push({ jsonPath: slot.jsonPath, file: join(dir, files[i]), by: "order" });
      usedFiles.add(files[i]);
    } else unmatched.push(slot.jsonPath);
  });
} else {
  // by name: пытаемся сматчить слот с файлом по базнейму currentValue, по key
  // и по секции. Берём первый незанятый файл, чьё имя (без расш.) совпадает.
  const stem = (f) => basename(f, extname(f)).toLowerCase();
  for (const slot of slots) {
    const wanted = new Set([
      stem(slot.currentValue || ""),       // review-1
      (slot.key || "").toLowerCase(),       // hero / img / photo
    ].filter(Boolean));
    const hit = files.find((f) => !usedFiles.has(f) && wanted.has(stem(f)));
    if (hit) {
      matches.push({ jsonPath: slot.jsonPath, file: join(dir, hit), by: "name" });
      usedFiles.add(hit);
    } else {
      unmatched.push(slot.jsonPath);
    }
  }
}

const unused = files.filter((f) => !usedFiles.has(f));
process.stdout.write(JSON.stringify({
  matches,
  unmatchedSlots: unmatched,
  unusedFiles: unused,
}, null, 2) + "\n");
