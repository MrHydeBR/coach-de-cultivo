#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# merge-full-package.sh
#
# Gera o pacote consolidado "coach-de-cultivo-full.zip" a partir de:
#   - Overlay do Antigravity (este zip)
#   - Código-fonte já presente na pasta do projeto
#
# Uso:
#   cd "Coach de cultivo"                  # pasta do projeto
#   unzip -o ../coach-de-cultivo-antigravity-overlay.zip
#   bash merge-full-package.sh             # gera ../coach-de-cultivo-full.zip
# ---------------------------------------------------------------------------
set -euo pipefail

PROJECT_DIR="$(pwd)"
PROJECT_NAME="$(basename "$PROJECT_DIR")"
OUTPUT="../coach-de-cultivo-full.zip"

echo "==> Pasta do projeto: $PROJECT_DIR"
echo "==> Gerando $OUTPUT"

# Sanity checks
for f in AGENTS.md ANTIGRAVITY_QUICKSTART.md tasks/README.md; do
  if [ ! -f "$f" ]; then
    echo "ERRO: overlay não encontrada ($f ausente)."
    echo "Você extraiu o zip da overlay dentro da pasta do projeto?"
    exit 1
  fi
done

# Remove pacote antigo
rm -f "$OUTPUT"

# Zipa tudo exceto artefatos de build, segredos e caches
( cd .. && zip -r "$(basename "$OUTPUT")" "$PROJECT_NAME" \
    -x "$PROJECT_NAME/**/node_modules/*" \
       "$PROJECT_NAME/**/.next/*" \
       "$PROJECT_NAME/**/__pycache__/*" \
       "$PROJECT_NAME/**/*.pyc" \
       "$PROJECT_NAME/**/.venv/*" \
       "$PROJECT_NAME/**/.pytest_cache/*" \
       "$PROJECT_NAME/**/pytest-cache-files-*/*" \
       "$PROJECT_NAME/**/dist/*" \
       "$PROJECT_NAME/**/build/*" \
       "$PROJECT_NAME/**/.git/*" \
       "$PROJECT_NAME/**/serviceAccount.json" \
       "$PROJECT_NAME/**/.env" \
       "$PROJECT_NAME/**/.env.local" \
       "$PROJECT_NAME/**/.DS_Store" \
       "$PROJECT_NAME/**/package-lock.json" \
) > /dev/null

BYTES=$(stat -f%z "$OUTPUT" 2>/dev/null || stat -c%s "$OUTPUT")
FILES=$(unzip -l "$OUTPUT" | awk 'END{print $2}')

echo "==> Pronto"
echo "    Arquivo: $(cd .. && pwd)/$(basename "$OUTPUT")"
echo "    Tamanho: $(( BYTES / 1024 )) KB"
echo "    Arquivos: $FILES"
