#!/bin/sh
# Backup automatico diario de la BD real (PGDATABASE = POSTGRES_DB_MAIN).
# Corre dentro del servicio "backup" del docker-compose (imagen postgres:17).
#
# pg_dump lee la conexion de PGHOST, PGUSER, PGPASSWORD y PGDATABASE.
# Nombre: <bd>_AAAA-MM-DD.dump (un archivo por dia).

set -u

DESTINO=/backups
RETENCION_DIAS=28
INTERVALO=86400 # 24 h
REINTENTO=300  # 5 min

while ! pg_isready -q; do
  sleep 5s
done

while true; do
  archivo="$DESTINO/${PGDATABASE}_$(date +%F).dump"
  tmp="$archivo.tmp"

  # Primero a .tmp: si pg_dump se corta, nunca queda un .dump roto.
  if pg_dump -Fc -f "$tmp" && [ -s "$tmp" ]; then
    mv "$tmp" "$archivo"
    echo "$(date '+%F %T') Backup OK: $(basename "$archivo")"
    espera="$INTERVALO"
    # Solo los diarios (????-??-??)
    find "$DESTINO" -maxdepth 1 -name "${PGDATABASE}_????-??-??.dump" \
    -mtime +"$RETENCION_DIAS" -delete
  else
    rm -f "$tmp"
    echo "$(date '+%F %T') ERROR: el backup ha fallado" >&2
    espera="$REINTENTO"
  fi

  

  sleep "$espera"
done
