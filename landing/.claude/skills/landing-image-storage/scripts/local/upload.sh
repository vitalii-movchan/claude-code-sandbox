#!/usr/bin/env bash
# upload-action / local-storage — копирует изображение в pages/<landing>/img/.
# Usage: upload.sh <landing> <source> [name]
set -euo pipefail

landing="${1:?usage: upload.sh <landing> <source> [name]}"
source_path="${2:?usage: upload.sh <landing> <source> [name]}"
name="${3:-$(basename "$source_path")}"

[ -f "$source_path" ] || { echo "источник не найден: $source_path" >&2; exit 1; }

case "${name##*.}" in
  jpg|jpeg|png|webp|svg|avif|gif) ;;
  *) echo "не изображение: $name" >&2; exit 1 ;;
esac

dir="pages/$landing/img"
[ -d "pages/$landing" ] || { echo "лендинг не найден: pages/$landing" >&2; exit 1; }
mkdir -p "$dir"

dest="$dir/$name"
cp "$source_path" "$dest"
echo "$dest"
