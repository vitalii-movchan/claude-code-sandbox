#!/usr/bin/env node
// fetch-action / unsplash-source — скачать фото по id или URL в img/.
// Usage: node fetch.mjs <landing> <ref> [dest]
import { writeFile, stat, mkdir } from 'node:fs/promises';
import { basename, join, dirname } from 'node:path';

const [, , landing, ref, dest] = process.argv;
if (!landing || !ref) {
  console.error('usage: fetch.mjs <landing> <ref> [dest]');
  process.exit(2);
}

const key = process.env.UNSPLASH_ACCESS_KEY;
const isUrl = /^https?:\/\//.test(ref);

let imageUrl = ref;       // если ref — URL, качаем напрямую
let id = isUrl ? null : ref;
let author = null;

if (!isUrl) {
  // ref — id: тянем метаданные фото, берём urls.regular.
  if (!key) {
    console.error('UNSPLASH_ACCESS_KEY не задан в окружении (нужен для скачивания по id)');
    process.exit(1);
  }
  const headers = { authorization: `Client-ID ${key}`, 'accept-version': 'v1' };
  const meta = await fetch(`https://api.unsplash.com/photos/${encodeURIComponent(ref)}`, { headers });
  if (!meta.ok) {
    console.error(`unsplash photo lookup failed: ${meta.status} ${meta.statusText}`);
    process.exit(1);
  }
  const photo = await meta.json();
  imageUrl = photo.urls.regular;
  author = photo.user?.username ? `@${photo.user.username}` : null;
  // требование API Unsplash — засчитать скачивание (best-effort).
  if (photo.links?.download_location) {
    try { await fetch(photo.links.download_location, { headers }); } catch { /* не критично */ }
  }
}

const img = await fetch(imageUrl);
if (!img.ok) {
  console.error(`download failed: ${img.status} ${img.statusText}`);
  process.exit(1);
}

// dest: файл или существующая папка; по умолчанию — pages/<landing>/img/<id>.jpg
const stem = id ?? (basename(new URL(imageUrl).pathname) || 'image');
const defaultName = `${stem}.jpg`;
let out = dest || join('pages', landing, 'img', defaultName);
try {
  if ((await stat(out)).isDirectory()) out = join(out, defaultName);
} catch { /* dest не существует — трактуем как путь к файлу */ }

await mkdir(dirname(out), { recursive: true });
await writeFile(out, Buffer.from(await img.arrayBuffer()));
if (author) console.error(`Photo by ${author} on Unsplash`);   // атрибуция по лицензии
console.log(out);
