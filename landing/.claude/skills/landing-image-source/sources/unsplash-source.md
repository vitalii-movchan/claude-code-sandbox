# unsplash-source — Unsplash

Реализация `action-list` поверх [Unsplash API](https://unsplash.com/documentation)
(официальный REST, без пакета `unsplash-js`). Кандидат = фото Unsplash с прямым
URL картинки и атрибуцией автора.

Скрипты `scripts/unsplash/{search,fetch}.mjs` (Node ≥ 18), запуск из корня
`landing/`.

## Ключ

Всем действиям нужен **`UNSPLASH_ACCESS_KEY`** в окружении (иначе скрипт падает
с понятной ошибкой):

```bash
export UNSPLASH_ACCESS_KEY="..."        # в этой сессии: ! export ...
```

**Где взять ключ.** Это Access Key приложения Unsplash, не аккаунт-токен.
Зарегистрируй приложение на **unsplash.com/oauth/applications → New Application**,
Access Key — на странице приложения. Демо-доступ: 50 запросов/час (хватает для
подбора картинок лендинга). Ключ — секрет, держать вне git.

Запросы шлются с заголовком `Authorization: Client-ID <key>` и
`Accept-Version: v1`.

---

## search-action

`GET https://api.unsplash.com/search/photos?query=...&per_page=...` — поиск фото.

```bash
node scripts/unsplash/search.mjs <landing> <query> [count]
```

- `<query>` — текстовый запрос (закавычить, если несколько слов).
- `[count]` — сколько кандидатов (по умолчанию 5; Unsplash отдаёт до 30 на стр.).
- **stdout:** по строке на кандидата — `id`, прямой URL картинки (`urls.regular`),
  размеры `WxH`, автор (`@username`). `id`/URL — вход для `fetch`.

## fetch-action

Скачать конкретное фото на диск. `<ref>` — `id` фото или прямой URL из `search`:

- если `<ref>` похож на URL — качается напрямую `GET`-ом;
- иначе трактуется как `id` → `GET https://api.unsplash.com/photos/<id>`, берётся
  `urls.regular` и качается. Дополнительно дёргается endpoint `download_location`
  (требование Unsplash API — засчитать скачивание).

```bash
node scripts/unsplash/fetch.mjs <landing> <ref> [dest]
```

- `<ref>` — `id` фото или прямой URL (из `search`).
- `[dest]` — путь сохранения (по умолчанию — `pages/<landing>/img/<id>.jpg`).
- **stdout:** путь к сохранённому файлу (вход для `upload` из `landing-image-storage`).
- Печатает в stderr строку атрибуции автора — для кредита по лицензии Unsplash.
