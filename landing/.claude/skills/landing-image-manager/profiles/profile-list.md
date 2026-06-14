# profile-list — реализации (обзор)

Профиль — реализация интерфейса [`actions/`](../actions/action-list.md) под
конкретное хранилище. Каждый профиль наследует action-list как контракт, но
реализует каждое действие по-своему. Профиль = набор секций, по секции на
действие (`## upload-action` / `## download-action` / `## locate-action`).

Профили, по файлу на каждый:

- [`vercel-profile`](vercel-profile.md) — Vercel Blob (REST API). Локатор = URL.
- [`local-profile`](local-profile.md) — файловая система `pages/<landing>/img/`.
  Локатор = путь.

## Добавить профиль

Новый `<name>-profile.md` здесь, реализующий **те же** секции, что перечислены
в `actions/`, плюс скрипты в `scripts/<name>/`. Контракт `actions/` при этом не
меняется — в этом и смысл общего интерфейса.
