#!/usr/bin/env bash
# download-action / local-storage — достаёт копию из pages/<landing>/img/.
# Usage: download.sh <landing> <locator> [dest]
set -euo pipefail

landing="${1:?usage: download.sh <landing> <locator> [dest]}"
locator="${2:?usage: download.sh <landing> <locator> [dest]}"
dir="pages/$landing/img"
dest="${3:-$dir}"
# locator: имя в img/ или уже полный путь.
if [ -f "$locator" ]; then
  src="$locator"
elif [ -f "$dir/$locator" ]; then
  src="$dir/$locator"
else
  echo "изображение не найдено: $locator (в $dir)" >&2
  exit 1
fi

# дефолт ($dir) и явный путь-с-/ трактуем как папку; иначе — путь к файлу.
if [ -d "$dest" ] || [ "$dest" = "$dir" ] || [ "${dest: -1}" = "/" ]; then
  mkdir -p "$dest"
  out="$dest/$(basename "$src")"
else
  out="$dest"
fi

# src уже лежит по целевому пути (download своей же картинки в её место) — no-op.
if [ "$src" -ef "$out" ]; then
  echo "$out"
  exit 0
fi

cp "$src" "$out"
echo "$out"
