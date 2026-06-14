#!/usr/bin/env node
// upload-action / vercel-profile — PUT файла в Vercel Blob через REST API.
// Usage: node upload.mjs <landing> <source> [name]
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

const API = 'https://vercel.com/api/blob';
const API_VERSION = '12';
const IMG_EXT = /\.(jpe?g|png|webp|svg|avif|gif)$/i;
const MIME = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  webp: 'image/webp', svg: 'image/svg+xml', avif: 'image/avif', gif: 'image/gif',
};

const [landing, source, name] = process.argv.slice(2);
if (!landing || !source) {
  console.error('usage: upload.mjs <landing> <source> [name]');
  process.exit(2);
}
const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error('нет BLOB_READ_WRITE_TOKEN в окружении');
  process.exit(2);
}
const fileName = name || basename(source);
if (!IMG_EXT.test(fileName)) {
  console.error(`не изображение: ${fileName}`);
  process.exit(1);
}

const body = await readFile(source).catch((e) => {
  console.error(`источник не найден: ${source} (${e.message})`);
  process.exit(1);
});
const pathname = `landings/${landing}/${fileName}`;
const ext = fileName.split('.').pop().toLowerCase();

const res = await fetch(`${API}/?pathname=${encodeURIComponent(pathname)}`, {
  method: 'PUT',
  headers: {
    authorization: `Bearer ${token}`,
    'x-api-version': API_VERSION,
    'x-content-type': MIME[ext] || 'application/octet-stream',
    // стабильное имя + перезапись (без случайного суффикса)
    'x-add-random-suffix': '0',
    'x-allow-overwrite': '1',
  },
  body,
});
if (!res.ok) {
  console.error(`upload failed: ${res.status} ${res.statusText}\n${await res.text()}`);
  process.exit(1);
}
const json = await res.json();
console.log(json.url);
