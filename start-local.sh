#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
URL="http://localhost:5173"
if command -v open >/dev/null 2>&1; then open "$URL" >/dev/null 2>&1 &
elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL" >/dev/null 2>&1 &
fi
if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server 5173
else
  python -m http.server 5173
fi
