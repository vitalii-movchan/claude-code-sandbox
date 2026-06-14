# vercel-profile — Vercel Blob

Реализация `action-list` поверх [Vercel Blob](https://vercel.com/docs/vercel-blob)
через REST API (без пакета `@vercel/blob`). Локатор = публичный URL блоба;
изображения лежат под префиксом `landings/<landing>/`, чтобы не пересекаться.

Скрипты `scripts/vercel/{upload,download,locate}.mjs` (Node ≥ 18), запуск из
корня `landing/`.

## Токен

Всем действиям нужен **`BLOB_READ_WRITE_TOKEN`** в окружении (иначе скрипт
падает с понятной ошибкой):

```bash
export BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."   # в этой сессии: ! export ...
```

**Где взять токен.** Это RW-токен конкретного Blob-стора, не account-токен
Vercel. Если стор привязан к проекту — вытянуть в `.env.local`:

```bash
vercel login && vercel link        # один раз: вход + привязка папки к проекту
vercel env pull .env.local         # принесёт BLOB_READ_WRITE_TOKEN (+ BLOB_STORE_ID и пр.)
set -a; . ./.env.local; set +a     # подгрузить в окружение текущей сессии
```

Стора ещё нет → создать в дашборде: **vercel.com/dashboard → Storage → Create
→ Blob**, токен — в его Settings. `.env.local` — секрет, держать вне git.

---

## upload-action

`PUT https://blob.vercel-storage.com/<pathname>` с телом-файлом.

```bash
node scripts/vercel/upload.mjs <landing> <source> [name]
```

- `<source>` — путь к локальному изображению (тело запроса).
- `[name]` — имя в сторе (по умолчанию — имя файла); итоговый pathname —
  `landings/<landing>/<name>`.
- **stdout:** публичный URL блоба (его и используют `locate`/`download`).
- По умолчанию `addRandomSuffix=false` (стабильное имя, перезапись).

## download-action

Обычный `GET` по URL блоба — публичные блобы доступны без токена, но скрипт
шлёт его на всякий случай.

```bash
node scripts/vercel/download.mjs <landing> <url> [dest]
```

- `<url>` — URL блоба (из `upload`/`locate`).
- `[dest]` — путь сохранения (по умолчанию — имя из URL в текущей папке).
- **stdout:** путь к сохранённому файлу.

## locate-action

`GET https://blob.vercel-storage.com/?prefix=...` — список блобов стора.

```bash
node scripts/vercel/locate.mjs <landing> [name]
```

- С `name` — URL конкретного блоба `landings/<landing>/<name>` (ошибка, если нет).
- Без `name` — список блобов под префиксом `landings/<landing>/`: имя + URL + размер.
- **stdout:** локатор(ы) — URL(ы), пригодные как вход `download-action`.
