#!/usr/bin/env node
/* apply_url.mjs — прописывает полученный URL в data.js на место заглушки.
 *
 * Зачем отдельный скрипт: правка исходника data.js — деликатная операция.
 * Мы НЕ перезаписываем data.js целиком (потеряли бы комментарии, форматирование,
 * порядок ключей). Вместо этого делаем точечную текстовую замену СТАРОГО строкового
 * значения слота на новое — ровно ту строку в кавычках, что стоит в currentValue.
 *
 * Контракт:
 *   node apply_url.mjs --landing <dir> --old "<currentValue>" --new "<url>"
 *   → меняет первое вхождение "<old>" на "<new>" в js/data.js (кавычки сохраняет).
 *   → stdout JSON: { "replaced": true|false }
 *
 * old берётся из slot.currentValue карты — он уникален и стоит в кавычках, так
 * что коллизий с другим текстом практически нет. Если old встречается несколько
 * раз (одинаковые заглушки), скилл должен звать скрипт по одному слоту за раз,
 * двигаясь по карте, — replaceFirst гарантирует по одной замене за вызов.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";

function arg(name) {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
function die(m) { process.stderr.write(m + "\n"); process.exit(1); }

const landing = arg("--landing");
const oldVal = arg("--old");
const newVal = arg("--new");
if (!landing || oldVal == null || newVal == null) {
  die('usage: apply_url.mjs --landing <dir> --old "<currentValue>" --new "<url>"');
}

const dataPath = resolve(join(landing, "js", "data.js"));
let src;
try { src = readFileSync(dataPath, "utf8"); }
catch { die(`cannot read ${dataPath}`); }

// Меняем строковый литерал целиком: и в одинарных, и в двойных кавычках.
let replaced = false;
for (const q of ['"', "'"]) {
  const needle = q + oldVal + q;
  const idx = src.indexOf(needle);
  if (idx !== -1) {
    src = src.slice(0, idx) + q + newVal + q + src.slice(idx + needle.length);
    replaced = true;
    break;
  }
}

if (replaced) writeFileSync(dataPath, src);
process.stdout.write(JSON.stringify({ replaced }) + "\n");
if (!replaced) process.stderr.write(`value not found in data.js: ${oldVal}\n`);
