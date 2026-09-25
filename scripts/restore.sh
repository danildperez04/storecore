#!/usr/bin/env bash
#
# Restauracion de la base de datos desde un respaldo.
#
#   ./scripts/restore.sh backups/storecore_20260925_020000.sql.gz
#
# IMPORTANTE: sobrescribe los datos actuales. Sin un respaldo previo, esta
# operacion no tiene vuelta atras.
# Ver docs/11-guia-despliegue.md §9.3

set -euo pipefail

BACKUP_FILE="${1:-}"
COMPOSE_FILE="${COMPOSE_FILE:-/opt/storecore/docker-compose.prod.yml}"

if [ -z "$BACKUP_FILE" ]; then
  echo "Uso: $0 <archivo-de-respaldo.sql.gz>" >&2
  echo "" >&2
  echo "Respaldos disponibles:" >&2
  ls -1 /opt/storecore/backups/storecore_*.sql.gz 2>/dev/null >&2 || echo "  (ninguno)" >&2
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: no existe el archivo ${BACKUP_FILE}" >&2
  exit 1
fi

cd "$(dirname "$0")/.."

read -r -p "Se sobrescribiran TODOS los datos actuales con ${BACKUP_FILE}. Continuar? [s/N] " CONFIRM
if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
  echo "Cancelado."
  exit 1
fi

# Se detiene la API para que no escriba mientras se restaura.
echo "Deteniendo la API..."
docker compose -f "$COMPOSE_FILE" stop api

echo "Restaurando desde ${BACKUP_FILE}..."
gunzip -c "$BACKUP_FILE" \
  | docker compose -f "$COMPOSE_FILE" exec -T postgres \
      psql --username="${DATABASE_USER:-storecore}" \
           --dbname="${DATABASE_NAME:-storecore}" \
           --on-error=stop

echo "Levantando la API..."
docker compose -f "$COMPOSE_FILE" up -d api

echo "Verificando..."
sleep 5
curl -fsS "http://localhost/api/v1/health" || echo "La API no responde todavia; revisa los logs."

echo "Restauracion completada."
