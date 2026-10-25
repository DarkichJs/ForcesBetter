#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ $# -ge 1 ]]; then
  python3 - "$1" <<'PY'
import json, re, sys
version = sys.argv[1]
assert re.fullmatch(r"\d+(\.\d+){0,3}", version), f"bad version: {version}"
text = open("manifest.json").read()
text = re.sub(r'"version": "[^"]+"', f'"version": "{version}"', text, count=1)
open("manifest.json", "w").write(text)
PY
fi

version=$(python3 -c 'import json; print(json.load(open("manifest.json"))["version"])')
out="dist/forcesbetter-$version.zip"
mkdir -p dist
rm -f "$out"
zip -qr -X "$out" manifest.json src popup icons fonts -x '*.DS_Store'
echo "$out ($(du -h "$out" | cut -f1 | tr -d ' '))"
