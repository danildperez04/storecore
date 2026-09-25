#!/usr/bin/env bash
#
# Respaldo de la base de datos de StoreCore.
#
# Genera un .sql.gz con la estructura y los datos, y rota los respaldos
# antiguos. Se programa en cron: 0 2 * * * /opt/storecore/scripts/backup.sh
#
# Ver docs/11-guia-despliegue.md §9

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/storecore/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
COMPOSE_FILE="${COMPOSE_FILE:-/opt/storecore/docker-compose.prod.yml}"
STAMP="$(date +%Y%m%d_%H%M%S)"
FILENAME="storecore_${STAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

cd "$(dirname "$0")/.."

# --clean --if-exists permite restaurar sobre una base existente. Sin --clean,
# un restore sobre una base con tablas existentes falla en el primer CREATE.
docker compose -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump --username="${DATABASE_USER:-storecore}" \
          --dbname="${DATABASE_NAME:-storecore}" \
          --clean --if-exists --no-owner --no-privileges \
  | gzip > "${BACKUP_DIR}/${FILENAME}"

# Un respaldo vacio o corrupto es peor que no tener respaldo: se verifica que
# el archivo tenga contenido antes de darlo por bueno.
SIZE=$(stat -c%s "${BACKUP_DIR}/${FILENAME}" 2>/dev/null || echo 0)
if [ "$SIZE" -lt 1024 ]; then
  echo "ERROR: el respaldo ${FILENAME} esta vacio (${SIZE} bytes). Se elimina." >&2
  rm -f "${BACKUP_DIR}/${FILENAME}"
  exit 1
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') respaldo creado: ${FILENAME} (${SIZE} bytes)"

# Rotacion: conserva RETENTION_DAYS respaldos y borra el resto.
DELETED=$(find "$BACKUP_DIR" -name "storecore_*.sql.gz" -mtime "+${RETENTION_DAYS}" -print -delete | wc -l)
if [ "$DELETED" -gt 0 ]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') rotacion: ${DELETED} respaldo(es) antiguo(s) eliminado(s)"
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') respaldos disponibles: $(ls -1 "${BACKUP_DIR}"/storecore_*.sql.gz 2>/dev/null | wc -l)"
