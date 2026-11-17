#!/bin/sh
# EMERGENCIA: reemplaza la BD real (POSTGRES_DB_MAIN) por un backup.
# Todo lo que se hizo despues de ese backup se pierde.
# Version Linux (servidor) de restore.ps1.
#
# Antes de borrar nada hace una copia de como esta ahora
# (..._antes-restore.dump), para poder volver atras.
# Si la BD no existe (primer arranque en el servidor), la crea y restaura sin copia.
#
# Uso (desde cualquier carpeta):
#   sh scripts/restore.sh
#       -> usa el backup mas reciente de BACKUP_DIR
#   sh scripts/restore.sh finanzas_main_2026-11-17.dump
#       -> usa ese backup (nombre dentro de BACKUP_DIR o ruta completa)

set -u

# --- Configuracion ---
raiz=$(cd "$(dirname "$0")/.." && pwd)
contenedor='finanzas_dmos_db'
seguridad=''

fallar() {
  echo "ERROR: $1" >&2
  exit 1
}

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

# --- Comprobaciones previas ---
docker info >/dev/null 2>&1 || fallar 'Docker no responde.'

enMarcha=$(docker inspect -f '{{.State.Running}}' "$contenedor" 2>/dev/null)
[ "$enMarcha" = 'true' ] ||
  fallar "El contenedor $contenedor no esta en marcha. Ejecuta: docker compose up -d postgres"

# --- Confirmacion ---
echo ''
echo "Se va a REEMPLAZAR la BD '$bd' por el backup:"
ls -lh "$ruta"
echo 'Todo lo que hiciste despues de ese backup se perdera.'
printf 'Escribe SI para continuar: '
read -r respuesta
if [ "$respuesta" != 'SI' ]; then
  echo 'Cancelado. No se ha tocado nada.'
  exit 0
fi

# Compose se lanza desde la raiz: asi encuentra el docker-compose.yml.
cd "$raiz" || fallar "No se pudo entrar en $raiz"

# --- Parar server, client y backup (nadie lee ni escribe mientras restauramos) ---
docker compose stop server client backup || fallar 'No se pudieron parar server, client y backup.'

# --- Copia de seguridad de como esta ahora (si la BD existe) ---
existe=$(docker exec "$contenedor" psql -U "$usuario" -d postgres -tAc \
  "SELECT 1 FROM pg_database WHERE datname = '$bd';") ||
  fallar 'No se pudo consultar la lista de BD.'

mkdir -p "$carpeta" || fallar "No se pudo crear $carpeta"

if [ "$existe" = '1' ]; then
  seguridad="${bd}_$(date +%F_%H%M%S)_antes-restore.dump"
  echo "Guardando copia de seguridad: $seguridad"

  docker exec "$contenedor" pg_dump -U "$usuario" -d "$bd" -Fc -f "/tmp/$seguridad" ||
    fallar 'No se pudo hacer la copia de seguridad. No se ha borrado nada.'

  docker cp "$contenedor:/tmp/$seguridad" "$carpeta/" ||
    fallar 'No se pudo copiar la copia de seguridad. No se ha borrado nada.'

  [ -s "$carpeta/$seguridad" ] ||
    fallar 'La copia de seguridad esta vacia. No se ha borrado nada.'

  docker exec "$contenedor" rm -f "/tmp/$seguridad" >/dev/null
else
  echo "AVISO: la BD '$bd' no existe; no hay nada que guardar antes."
fi

# --- Restaurar ---
docker cp "$ruta" "$contenedor:/tmp/$nombre" ||
  fallar 'docker cp ha fallado. No se ha borrado nada.'

docker exec "$contenedor" psql -U "$usuario" -d postgres \
  -c "DROP DATABASE IF EXISTS $bd WITH (FORCE);" || fallar "No se pudo borrar $bd."

docker exec "$contenedor" psql -U "$usuario" -d postgres \
  -c "CREATE DATABASE $bd;" || fallar "No se pudo crear $bd. Server, client y backup siguen parados."

if ! docker exec "$contenedor" pg_restore -U "$usuario" -d "$bd" "/tmp/$nombre"; then
  msg='pg_restore ha fallado. Server, client y backup siguen parados.'
  [ -n "$seguridad" ] && msg="$msg Para volver a como estaba: sh scripts/restore.sh $seguridad"
  fallar "$msg"
fi

docker exec "$contenedor" rm -f "/tmp/$nombre" >/dev/null

# --- Mostrar lo que hay dentro ---
# Comillas dobles escapadas (\") porque las tablas de Prisma van en mayuscula.
sql="SELECT 'Categoria' AS tabla, count(*) AS filas FROM \"Categoria\" UNION ALL SELECT 'Cuenta', count(*) FROM \"Cuenta\" UNION ALL SELECT 'Movimiento', count(*) FROM \"Movimiento\";"
printf '%s\n' "$sql" | docker exec -i "$contenedor" psql -U "$usuario" -d "$bd"

# --- Levantar la app ---
docker compose up -d ||
  fallar 'Restaurado, pero la app no arranco. Revisa: docker compose logs server'

echo "Restore OK: '$bd' restaurada desde $nombre. App levantada."
