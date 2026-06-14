#!/usr/bin/env node
// download-action / vercel-profile — GET блоба по URL на диск.
// Usage: node download.mjs <landing> <url> [dest]
import { writeFile, stat } from 'node:fs/promises';
import { basename, join } from 'node:path';

const [, , landing, url, dest] = process.argv;
if (!landing || !url) {
  console.error('usage: download.mjs <landing> <url> [dest]');
  process.exit(2);
}

const token = process.env.BLOB_READ_WRITE_TOKEN;
const res = await fetch(url, {
  // публичные блобы доступны и без токена, но шлём, если есть
  headers: token ? { authorization: `Bearer ${token}` } : {},
});
if (!res.ok) {
  console.error(`download failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}

// dest: файл или существующая папка; по умолчанию — имя из URL в текущей папке.
let out = dest || basename(new URL(url).pathname);
try {
  if ((await stat(out)).isDirectory()) out = join(out, basename(new URL(url).pathname));
} catch { /* dest не существует — трактуем как путь к файлу */ }

await writeFile(out, Buffer.from(await res.arrayBuffer()));
console.log(out);
