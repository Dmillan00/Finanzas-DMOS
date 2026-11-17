#!/bin/sh
# Backup automatico diario de la BD real (PGDATABASE = POSTGRES_DB_MAIN).
# Corre dentro del servicio "backup" del docker-compose (imagen postgres:17).
#
# pg_dump lee la conexion de PGHOST, PGUSER, PGPASSWORD y PGDATABASE.
# Mismo nombre que backup.ps1 (<bd>_AAAA-MM-DD.dump), para que
# verificar.ps1 y restore.ps1 lo encuentren como el mas reciente.

set -u

DESTINO=/backups
RETENCION_DIAS=28
INTERVALO=86400 # 24 h

while true; do
  archivo="$DESTINO/${PGDATABASE}_$(date +%F).dump"
  tmp="$archivo.tmp"

  # Primero a .tmp: si pg_dump se corta, nunca queda un .dump roto.
  if pg_dump -Fc -f "$tmp" && [ -s "$tmp" ]; then
    mv "$tmp" "$archivo"
    echo "$(date '+%F %T') Backup OK: $(basename "$archivo")"
  else
    rm -f "$tmp"
    echo "$(date '+%F %T') ERROR: el backup ha fallado" >&2
  fi

  # Solo los diarios (????-??-??): no toca los _antes-restore.
  find "$DESTINO" -maxdepth 1 -name "${PGDATABASE}_????-??-??.dump" \
    -mtime +"$RETENCION_DIAS" -delete

  sleep "$INTERVALO"
done
