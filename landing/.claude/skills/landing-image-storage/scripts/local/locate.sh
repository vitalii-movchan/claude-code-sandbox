#!/usr/bin/env bash
# locate-action / local-storage — ссылка на изображение или список.
# Usage: locate.sh <landing> [name]
set -euo pipefail

landing="${1:?usage: locate.sh <landing> [name]}"
name="${2:-}"

dir="pages/$landing/img"
[ -d "$dir" ] || { echo "нет папки изображений: $dir" >&2; exit 1; }

if [ -n "$name" ]; then
  f="$dir/$name"
  [ -f "$f" ] || { echo "изображение не найдено: $name (в $dir)" >&2; exit 1; }
  echo "$f"
  exit 0
fi

# Список всех изображений: имя  путь  размер.
found=0
shopt -s nullglob
for f in "$dir"/*.{jpg,jpeg,png,webp,svg,avif,gif}; do
  size=$(wc -c < "$f" | tr -d ' ')
  printf '%s\t%s\t%s bytes\n' "$(basename "$f")" "$f" "$size"
  found=1
done
[ "$found" -eq 1 ] || echo "(изображений нет в $dir)" >&2
