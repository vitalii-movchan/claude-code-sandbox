#!/usr/bin/env node
/* slot_map.mjs — строит «карту медиа-слотов» лендинга, читая его как референс.
 *
 * Зачем: у каждого лендинга свои слоты под картинки и свой способ их рендерить
 * (car_service: reviews[].photo; move_service: services/team/blog [].img;
 * pet_care: именованный media:{hero,vets,footer}; video_alliance: слотов нет).
 * Жёстко предполагать структуру нельзя — её надо ОБНАРУЖИТЬ. Скрипт грузит
 * data.js в песочнице, достаёт window.SITE_DATA, находит строковые значения,
 * похожие на пути к изображениям, и для каждого собирает СЕМАНТИЧЕСКИЙ контекст
 * (соседние title/name/role/alt/text) — он становится ключом для стокового
 * поиска и подсказкой для сопоставления пользовательских файлов.
 *
 * Использование:
 *   node slot_map.mjs <путь к папке лендинга>
 * Печатает JSON-карту в stdout. Ничего не пишет и не качает.
 */
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import vm from "node:vm";

const IMG_RE = /\.(jpe?g|png|webp|gif|avif|svg)$/i;
// Ключи рядом со слотом, чей текст годится как описание картинки (для ключевых слов).
const LABEL_KEYS = ["title", "name", "alt", "label", "role", "text", "caption", "heading"];

function die(msg) {
  process.stderr.write(msg + "\n");
  process.exit(1);
}

const landingDir = process.argv[2];
if (!landingDir) die("usage: node slot_map.mjs <landing-dir>");

const dataPath = resolve(join(landingDir, "js", "data.js"));
let src;
try {
  src = readFileSync(dataPath, "utf8");
} catch {
  die(`cannot read ${dataPath}`);
}

// Грузим data.js в изолированном контексте: он только присваивает window.SITE_DATA.
const sandbox = { window: {} };
vm.createContext(sandbox);
try {
  vm.runInContext(src, sandbox, { filename: dataPath, timeout: 2000 });
} catch (e) {
  die(`failed to evaluate data.js: ${e.message}`);
}
const data = sandbox.window.SITE_DATA;
if (!data || typeof data !== "object") die("window.SITE_DATA not found in data.js");

// Из объекта-контейнера слота вытягиваем человекочитаемую метку для ключевых слов.
function labelFrom(container) {
  if (!container || typeof container !== "object") return "";
  for (const k of LABEL_KEYS) {
    if (typeof container[k] === "string" && container[k].trim()) return container[k].trim();
  }
  return "";
}

// Рекурсивный обход SITE_DATA. Любое строковое значение, похожее на путь к
// изображению, — слот. jsonPath показывает, где в data.js его править.
const slots = [];
function walk(node, path, parentContainer, parentKey) {
  if (typeof node === "string") {
    if (IMG_RE.test(node)) {
      const label = labelFrom(parentContainer);
      const section = (path.match(/^SITE_DATA\.([A-Za-z0-9_]+)/) || [])[1] || "";
      // keywords — то, по чему искать сток. Если рядом есть текст (title/name/…),
      // он самый информативный. Если нет (плоский media:{hero,vets,…}) — падаем
      // на имя слота + секцию: «hero», «footer», «vets» сами по себе осмысленны.
      const keywords = (label || [parentKey, section].filter(Boolean).join(" ")).trim();
      slots.push({
        jsonPath: path,           // напр. SITE_DATA.reviews[2].photo
        key: parentKey,           // напр. photo / img / hero
        currentValue: node,       // текущее значение-заглушка
        label,                    // соседний текст, если был
        keywords,                 // строка-запрос для стокового поиска
      });
    }
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, i) => walk(item, `${path}[${i}]`, item, parentKey));
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      walk(v, `${path}.${k}`, node, k);
    }
  }
}
walk(data, "SITE_DATA", null, null);

// Группируем слоты по «секции» (первый сегмент пути после SITE_DATA) — удобно
// человеку и помогает подобрать связные ключевые слова на секцию.
const sections = {};
for (const s of slots) {
  const m = s.jsonPath.match(/^SITE_DATA\.([A-Za-z0-9_]+)/);
  const section = m ? m[1] : "(root)";
  (sections[section] ||= []).push(s);
}

const out = {
  landingDir,
  dataPath,
  totalSlots: slots.length,
  sections: Object.entries(sections).map(([name, items]) => ({
    section: name,
    count: items.length,
    slots: items,
  })),
};

process.stdout.write(JSON.stringify(out, null, 2) + "\n");
if (slots.length === 0) {
  process.stderr.write(
    "note: no image slots found — landing may be text/SVG-only (e.g. video_alliance)\n"
  );
}
