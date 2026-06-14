#!/usr/bin/env node
// locate-action / vercel-profile — URL блоба или список под префиксом лендинга.
// Usage: node locate.mjs <landing> [name]
const API = 'https://vercel.com/api/blob';
const API_VERSION = '12';

const [, , landing, name] = process.argv;
if (!landing) {
  console.error('usage: locate.mjs <landing> [name]');
  process.exit(2);
}
const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error('нет BLOB_READ_WRITE_TOKEN в окружении');
  process.exit(2);
}

const prefix = `landings/${landing}/`;
const res = await fetch(`${API}?prefix=${encodeURIComponent(prefix)}&limit=1000`, {
  headers: { authorization: `Bearer ${token}`, 'x-api-version': API_VERSION },
});
if (!res.ok) {
  console.error(`list failed: ${res.status} ${res.statusText}\n${await res.text()}`);
  process.exit(1);
}
const { blobs = [] } = await res.json();

if (name) {
  const target = prefix + name;
  const hit = blobs.find((b) => b.pathname === target);
  if (!hit) {
    console.error(`блоб не найден: ${target}`);
    process.exit(1);
  }
  console.log(hit.url);
  process.exit(0);
}

if (blobs.length === 0) {
  console.error(`(блобов нет под ${prefix})`);
  process.exit(0);
}
for (const b of blobs) {
  const short = b.pathname.slice(prefix.length);
  process.stdout.write(`${short}\t${b.url}\t${b.size} bytes\n`);
}
