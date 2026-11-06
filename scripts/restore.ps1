# EMERGENCIA: reemplaza la BD real (POSTGRES_DB_MAIN) por un backup.
# Todo lo que se hizo despues de ese backup se pierde.
#
# Antes de borrar nada hace una copia de como esta ahora
# (..._antes-restore.dump), para poder volver atras.
#
# Uso (desde cualquier carpeta):
#   powershell -ExecutionPolicy Bypass -File .\scripts\restore.ps1
#       -> usa el backup mas reciente de ..\Respaldo\FinanzasDMOS
#   powershell -ExecutionPolicy Bypass -File .\scripts\restore.ps1 -Archivo finanzas_main_2026-11-06.dump
#       -> usa ese backup (nombre dentro de la carpeta o ruta completa)

param([string]$Archivo)

# --- Configuracion ---
$raizRepo   = Split-Path -Parent $PSScriptRoot
$compose    = Join-Path $raizRepo 'docker-compose.yml'
$contenedor = 'finanzas_dmos_db'
$carpeta    = [System.IO.Path]::GetFullPath((Join-Path $raizRepo '..\Respaldo\FinanzasDMOS'))

function Fallar($mensaje) {
  Write-Host "ERROR: $mensaje" -ForegroundColor Red
  exit 1
}

# --- Usuario y BD desde el .env de la raiz ---
$envFile = Join-Path $raizRepo '.env'
if (-not (Test-Path $envFile)) { Fallar "No existe $envFile" }

$vars = @{}
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
    $vars[$Matches[1]] = $Matches[2].Trim().Trim('"')
  }
}
$usuario = $vars['POSTGRES_USER']
$bd      = $vars['POSTGRES_DB_MAIN']
if (-not $usuario -or -not $bd) { Fallar 'Faltan POSTGRES_USER o POSTGRES_DB_MAIN en el .env' }

# --- Elegir el backup ---
if ($Archivo) {
  if (Test-Path $Archivo) { $ruta = (Resolve-Path $Archivo).Path }
  else { $ruta = Join-Path $carpeta $Archivo }
  if (-not (Test-Path $ruta)) { Fallar "No existe el backup $ruta" }
} else {
  $ultimo = Get-ChildItem $carpeta -Filter "${bd}_*.dump" -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -notlike '*_antes-restore*' } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
  if (-not $ultimo) { Fallar "No hay backups en $carpeta" }
  $ruta = $ultimo.FullName
}
$nombre = Split-Path -Leaf $ruta
$item = Get-Item $ruta
if ($item.Length -eq 0) { Fallar "El backup $nombre esta vacio." }

# --- Comprobaciones previas ---
$null = docker info --format '{{.ServerVersion}}'
if ($LASTEXITCODE -ne 0) { Fallar 'Docker no responde. Abre Docker Desktop.' }

$enMarcha = docker inspect -f '{{.State.Running}}' $contenedor
if ($LASTEXITCODE -ne 0 -or $enMarcha -ne 'true') {
  Fallar "El contenedor $contenedor no esta en marcha. Ejecuta: docker compose up -d postgres"
}

# --- Confirmacion ---
Write-Host ''
Write-Host "Se va a REEMPLAZAR la BD '$bd' por el backup:" -ForegroundColor Yellow
Write-Host "  $ruta"
Write-Host "  Fecha: $($item.LastWriteTime)  Tamano: $([math]::Round($item.Length / 1KB, 1)) KB"
Write-Host 'Todo lo que hiciste despues de ese backup se perdera.' -ForegroundColor Yellow
$respuesta = Read-Host 'Escribe SI para continuar'
if ($respuesta -cne 'SI') {
  Write-Host 'Cancelado. No se ha tocado nada.'
  exit 0
}

# --- Parar server y client (nadie escribe en la BD mientras restauramos) ---
docker compose -f $compose stop server client
if ($LASTEXITCODE -ne 0) { Fallar 'No se pudieron parar server y client.' }

# --- Copia de seguridad de como esta ahora (si la BD existe) ---
$existe = docker exec $contenedor psql -U $usuario -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$bd';"
if ($LASTEXITCODE -ne 0) { Fallar 'No se pudo consultar la lista de BD.' }

if ($existe -eq '1') {
  $seguridad = "${bd}_$(Get-Date -Format 'yyyy-MM-dd_HHmmss')_antes-restore.dump"
  Write-Host "Guardando copia de seguridad: $seguridad"

  docker exec $contenedor pg_dump -U $usuario -d $bd -Fc -f "/tmp/$seguridad"
  if ($LASTEXITCODE -ne 0) { Fallar 'No se pudo hacer la copia de seguridad. No se ha borrado nada.' }

  docker cp "${contenedor}:/tmp/$seguridad" $carpeta
  if ($LASTEXITCODE -ne 0) { Fallar 'No se pudo copiar la copia de seguridad. No se ha borrado nada.' }

  $rutaSeguridad = Join-Path $carpeta $seguridad
  if (-not (Test-Path $rutaSeguridad) -or (Get-Item $rutaSeguridad).Length -eq 0) {
    Fallar 'La copia de seguridad esta vacia. No se ha borrado nada.'
  }
  docker exec $contenedor rm -f "/tmp/$seguridad" | Out-Null
} else {
  Write-Host "AVISO: la BD '$bd' no existe; no hay nada que guardar antes." -ForegroundColor Yellow
}

# --- Restaurar ---
docker cp $ruta "${contenedor}:/tmp/$nombre"
if ($LASTEXITCODE -ne 0) { Fallar 'docker cp ha fallado. No se ha borrado nada.' }

docker exec $contenedor psql -U $usuario -d postgres -c "DROP DATABASE IF EXISTS $bd WITH (FORCE);"
if ($LASTEXITCODE -ne 0) { Fallar "No se pudo borrar $bd." }

docker exec $contenedor psql -U $usuario -d postgres -c "CREATE DATABASE $bd;"
if ($LASTEXITCODE -ne 0) { Fallar "No se pudo crear $bd. Server y client siguen parados." }

docker exec $contenedor pg_restore -U $usuario -d $bd "/tmp/$nombre"
if ($LASTEXITCODE -ne 0) {
  $msg = "pg_restore ha fallado. Server y client siguen parados."
  if ($seguridad) { $msg += " Para volver a como estaba: restore.ps1 -Archivo $seguridad" }
  Fallar $msg
}

docker exec $contenedor rm -f "/tmp/$nombre" | Out-Null

# --- Mostrar lo que hay dentro ---
# Se manda por tuberia: PowerShell se come las comillas dobles de "Categoria" en -c.
$sql = 'SELECT ''Categoria'' AS tabla, count(*) AS filas FROM "Categoria" UNION ALL SELECT ''Cuenta'', count(*) FROM "Cuenta" UNION ALL SELECT ''Movimiento'', count(*) FROM "Movimiento";'
$sql | docker exec -i $contenedor psql -U $usuario -d $bd

# --- Levantar la app ---
docker compose -f $compose up -d
if ($LASTEXITCODE -ne 0) { Fallar 'Restaurado, pero la app no arranco. Revisa: docker compose logs server' }

Write-Host "Restore OK: '$bd' restaurada desde $nombre. App levantada." -ForegroundColor Green
