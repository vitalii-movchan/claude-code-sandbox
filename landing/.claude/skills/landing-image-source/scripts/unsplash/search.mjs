#!/usr/bin/env node
// search-action / unsplash-source — поиск фото по запросу, без скачивания.
// Usage: node search.mjs <landing> <query> [count]
const [, , landing, query, countArg] = process.argv;
if (!landing || !query) {
  console.error('usage: search.mjs <landing> <query> [count]');
  process.exit(2);
}

const key = process.env.UNSPLASH_ACCESS_KEY;
if (!key) {
  console.error('UNSPLASH_ACCESS_KEY не задан в окружении');
  process.exit(1);
}

const perPage = Math.min(Math.max(parseInt(countArg ?? '5', 10) || 5, 1), 30);
const url = new URL('https://api.unsplash.com/search/photos');
url.searchParams.set('query', query);
url.searchParams.set('per_page', String(perPage));

const res = await fetch(url, {
  headers: { authorization: `Client-ID ${key}`, 'accept-version': 'v1' },
});
if (!res.ok) {
  console.error(`unsplash search failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}

const { results } = await res.json();
if (!results?.length) {
  console.error(`ничего не найдено по запросу: ${query}`);
  process.exit(1);
}

// по строке на кандидата: id | url | WxH | @author — вход для fetch.
for (const p of results) {
  console.log([p.id, p.urls.regular, `${p.width}x${p.height}`, `@${p.user.username}`].join('\t'));
}
