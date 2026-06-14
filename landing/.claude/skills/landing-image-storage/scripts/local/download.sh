#!/usr/bin/env bash
# download-action / local-storage — достаёт копию из pages/<landing>/img/.
# Usage: download.sh <landing> <locator> [dest]
set -euo pipefail

landing="${1:?usage: download.sh <landing> <locator> [dest]}"
locator="${2:?usage: download.sh <landing> <locator> [dest]}"
dest="${3:-.}"

dir="pages/$landing/img"
# locator: имя в img/ или уже полный путь.
if [ -f "$locator" ]; then
  src="$locator"
elif [ -f "$dir/$locator" ]; then
  src="$dir/$locator"
else
  echo "изображение не найдено: $locator (в $dir)" >&2
  exit 1
fi

if [ -d "$dest" ]; then
  out="$dest/$(basename "$src")"
else
  out="$dest"
fi

cp "$src" "$out"
echo "$out"
