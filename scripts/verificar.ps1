# Comprueba que un backup se puede restaurar, SIN tocar la BD real.
# Lo restaura en una BD temporal (finanzas_restore_test), muestra cuantas filas
# hay en cada tabla y la borra al terminar.
#
# Uso (desde cualquier carpeta):
#   powershell -ExecutionPolicy Bypass -File .\scripts\verificar.ps1
#       -> usa el backup mas reciente de ..\Respaldo\FinanzasDMOS
#   powershell -ExecutionPolicy Bypass -File .\scripts\verificar.ps1 -Archivo finanzas_main_2026-11-06.dump
#       -> usa ese backup (nombre dentro de la carpeta o ruta completa)

param([string]$Archivo)

# --- Configuracion ---
$raizRepo   = Split-Path -Parent $PSScriptRoot
$contenedor = 'finanzas_dmos_db'
$carpeta    = [System.IO.Path]::GetFullPath((Join-Path $raizRepo '..\Respaldo\FinanzasDMOS'))
$bdPrueba   = 'finanzas_restore_test'
$hayQueLimpiar = $false

function Limpiar {
  docker exec $contenedor psql -U $usuario -d postgres -c "DROP DATABASE IF EXISTS $bdPrueba WITH (FORCE);" | Out-Null
  docker exec $contenedor rm -f "/tmp/$nombre" | Out-Null
}

function Fallar($mensaje) {
  Write-Host "ERROR: $mensaje" -ForegroundColor Red
  if ($hayQueLimpiar) { Limpiar }
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
if ((Get-Item $ruta).Length -eq 0) { Fallar "El backup $nombre esta vacio." }

Write-Host "Verificando backup: $ruta"

# --- Comprobaciones previas ---
$null = docker info --format '{{.ServerVersion}}'
if ($LASTEXITCODE -ne 0) { Fallar 'Docker no responde. Abre Docker Desktop.' }

$enMarcha = docker inspect -f '{{.State.Running}}' $contenedor
if ($LASTEXITCODE -ne 0 -or $enMarcha -ne 'true') {
  Fallar "El contenedor $contenedor no esta en marcha. Ejecuta: docker compose up -d postgres"
}

# --- Restaurar en la BD temporal ---
$hayQueLimpiar = $true

docker exec $contenedor psql -U $usuario -d postgres -c "DROP DATABASE IF EXISTS $bdPrueba WITH (FORCE);" | Out-Null
if ($LASTEXITCODE -ne 0) { Fallar "No se pudo borrar $bdPrueba." }

docker exec $contenedor psql -U $usuario -d postgres -c "CREATE DATABASE $bdPrueba;" | Out-Null
if ($LASTEXITCODE -ne 0) { Fallar "No se pudo crear $bdPrueba." }

docker cp $ruta "${contenedor}:/tmp/$nombre"
if ($LASTEXITCODE -ne 0) { Fallar 'docker cp ha fallado.' }

docker exec $contenedor pg_restore -U $usuario -d $bdPrueba "/tmp/$nombre"
if ($LASTEXITCODE -ne 0) { Fallar 'pg_restore ha fallado: el backup podria estar danado.' }

# --- Mostrar lo que hay dentro ---
# Se manda por tuberia: PowerShell se come las comillas dobles de "Categoria" en -c.
$sql = 'SELECT ''Categoria'' AS tabla, count(*) AS filas FROM "Categoria" UNION ALL SELECT ''Cuenta'', count(*) FROM "Cuenta" UNION ALL SELECT ''Movimiento'', count(*) FROM "Movimiento";'
$sql | docker exec -i $contenedor psql -U $usuario -d $bdPrueba
if ($LASTEXITCODE -ne 0) { Fallar 'No se pudieron leer las tablas restauradas.' }

# --- Limpiar ---
Limpiar
Write-Host "Backup OK: $nombre se restaura sin errores." -ForegroundColor Green
