#!/bin/sh
# Comprueba que un backup se puede restaurar, SIN tocar la BD real.
# Lo restaura en una BD temporal (finanzas_restore_test), muestra cuantas filas
# hay en cada tabla y la borra al terminar.
# Version Linux (servidor) de verificar.ps1.
#
# Uso (desde cualquier carpeta):
#   sh scripts/verificar.sh
#       -> usa el backup mas reciente de BACKUP_DIR
#   sh scripts/verificar.sh finanzas_main_2026-11-17.dump
#       -> usa ese backup (nombre dentro de BACKUP_DIR o ruta completa)

set -u

# --- Configuracion ---
raiz=$(cd "$(dirname "$0")/.." && pwd)
contenedor='finanzas_dmos_db'
bdPrueba='finanzas_restore_test'
hayQueLimpiar=0
nombre=''

fallar() {
  echo "ERROR: $1" >&2
  exit 1
}

limpiar() {
  if [ "$hayQueLimpiar" = 1 ]; then
    docker exec "$contenedor" psql -U "$usuario" -d postgres \
      -c "DROP DATABASE IF EXISTS $bdPrueba WITH (FORCE);" >/dev/null 2>&1
    docker exec "$contenedor" rm -f "/tmp/$nombre" >/dev/null 2>&1
  fi
}
# Se ejecuta siempre al salir, tambien si algo falla por el medio.
trap limpiar EXIT

# Lee una variable del .env sin ejecutarlo (quita \r de Windows y comillas).
leer_var() {
  grep -E "^[[:space:]]*$1[[:space:]]*=" "$envFile" | tail -n 1 |
    sed 's/^[^=]*=//' | tr -d '\r' |
    sed 's/^[[:space:]]*//; s/[[:space:]]*$//; s/^"//; s/"$//'
}

# --- Usuario, BD y carpeta desde el .env de la raiz ---
envFile="$raiz/.env"
[ -f "$envFile" ] || fallar "No existe $envFile"

usuario=$(leer_var POSTGRES_USER)
bd=$(leer_var POSTGRES_DB_MAIN)
carpeta=$(leer_var BACKUP_DIR)
[ -n "$usuario" ] && [ -n "$bd" ] && [ -n "$carpeta" ] ||
  fallar 'Faltan POSTGRES_USER, POSTGRES_DB_MAIN o BACKUP_DIR en el .env'

# BACKUP_DIR relativo = relativo a la raiz del repo (igual que en el compose).
case "$carpeta" in
  /*) ;;
  *) carpeta="$raiz/$carpeta" ;;
esac

# --- Elegir el backup ---
if [ $# -ge 1 ]; then
  if [ -f "$1" ]; then ruta="$1"; else ruta="$carpeta/$1"; fi
  [ -f "$ruta" ] || fallar "No existe el backup $ruta"
else
  ruta=$(ls -t "$carpeta"/"${bd}"_*.dump 2>/dev/null | grep -v '_antes-restore' | head -n 1)
  [ -n "$ruta" ] || fallar "No hay backups en $carpeta"
fi
nombre=$(basename "$ruta")
[ -s "$ruta" ] || fallar "El backup $nombre esta vacio."

echo "Verificando backup: $ruta"

# --- Comprobaciones previas ---
docker info >/dev/null 2>&1 || fallar 'Docker no responde.'

enMarcha=$(docker inspect -f '{{.State.Running}}' "$contenedor" 2>/dev/null)
[ "$enMarcha" = 'true' ] ||
  fallar "El contenedor $contenedor no esta en marcha. Ejecuta: docker compose up -d postgres"

# --- Restaurar en la BD temporal ---
hayQueLimpiar=1

docker exec "$contenedor" psql -U "$usuario" -d postgres \
  -c "DROP DATABASE IF EXISTS $bdPrueba WITH (FORCE);" >/dev/null ||
  fallar "No se pudo borrar $bdPrueba."

docker exec "$contenedor" psql -U "$usuario" -d postgres \
  -c "CREATE DATABASE $bdPrueba;" >/dev/null ||
  fallar "No se pudo crear $bdPrueba."

docker cp "$ruta" "$contenedor:/tmp/$nombre" || fallar 'docker cp ha fallado.'

docker exec "$contenedor" pg_restore -U "$usuario" -d "$bdPrueba" "/tmp/$nombre" ||
  fallar 'pg_restore ha fallado: el backup podria estar danado.'

# --- Mostrar lo que hay dentro ---
# Comillas dobles escapadas (\") porque las tablas de Prisma van en mayuscula.
sql="SELECT 'Categoria' AS tabla, count(*) AS filas FROM \"Categoria\" UNION ALL SELECT 'Cuenta', count(*) FROM \"Cuenta\" UNION ALL SELECT 'Movimiento', count(*) FROM \"Movimiento\";"
printf '%s\n' "$sql" | docker exec -i "$contenedor" psql -U "$usuario" -d "$bdPrueba" ||
  fallar 'No se pudieron leer las tablas restauradas.'

# La limpieza la hace el trap al salir.
echo "Backup OK: $nombre se restaura sin errores."
