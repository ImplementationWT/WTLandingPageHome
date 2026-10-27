#!/bin/sh
# Bundles Will Doo for the landing page into ../../assets/willdoo/ (main.js plus a lazy three.js chunk).
set -e
cd "$(dirname "$0")"
[ -d node_modules ] || npm install --no-audit --no-fund
rm -rf ../../assets/willdoo
npx esbuild src/main.ts --bundle --format=esm --splitting --minify --target=es2020 \
  --outdir=../../assets/willdoo --entry-names=[name] --chunk-names=[name]-[hash] --legal-comments=none
ls -la ../../assets/willdoo
