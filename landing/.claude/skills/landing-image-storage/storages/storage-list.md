# storage-list — реализации (обзор)

Хранилище — реализация интерфейса [`actions/`](../actions/action-list.md) под
конкретный бэкенд. Каждое хранилище наследует action-list как контракт, но
реализует каждое действие по-своему. Хранилище = набор секций, по секции на
действие (`## upload-action` / `## download-action` / `## locate-action`).

Хранилища, по файлу на каждое:

- [`vercel-storage`](vercel-storage.md) — Vercel Blob (REST API). Локатор = URL.
- [`local-storage`](local-storage.md) — файловая система `pages/<landing>/img/`.
  Локатор = путь.

## Добавить хранилище

Новый `<name>-storage.md` здесь, реализующий **те же** секции, что перечислены
в `actions/`, плюс скрипты в `scripts/<name>/`. Контракт `actions/` при этом не
меняется — в этом и смысл общего интерфейса.
