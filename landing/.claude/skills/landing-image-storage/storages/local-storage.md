# local-storage — файловая система

Реализация `action-list` поверх файловой системы. Хранилище — папка
`pages/<landing>/img/`, локатор = путь к файлу.

Скрипты `scripts/local/{upload,download,locate}.sh`, запуск из корня `landing/`.

---

## upload-action

Копирует исходный файл в `pages/<landing>/img/`.

```bash
scripts/local/upload.sh <landing> <source> [name]
```

- `<source>` — путь к локальному изображению.
- `[name]` — имя в `img/` (по умолчанию — имя исходного файла).
- **stdout:** путь к файлу `pages/<landing>/img/<name>`. Перезаписывает одноимённый.

## download-action

Для local «скачать» = достать копию файла из `img/` в произвольное место.

```bash
scripts/local/download.sh <landing> <locator> [dest]
```

- `<locator>` — путь/имя в `pages/<landing>/img/` (имя файла или полный путь).
- `[dest]` — куда сохранить (файл или папка; по умолчанию — текущая папка).
- **stdout:** путь к сохранённой копии.

## locate-action

```bash
scripts/local/locate.sh <landing> [name]
```

- С `name` — печатает путь к файлу, если он есть в `img/` (иначе ошибка).
- Без `name` — список всех изображений в `pages/<landing>/img/`: `имя` +
  путь + размер.
- **stdout:** локатор(ы) — путь(и), пригодные как вход `download-action`.
