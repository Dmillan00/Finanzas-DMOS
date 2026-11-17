# Backup de la BD real (POSTGRES_DB_MAIN) con pg_dump.
#
# Uso (desde cualquier carpeta):
#   powershell -ExecutionPolicy Bypass -File .\scripts\backup.ps1
#
# Guarda el backup en BACKUP_DIR (del .env, fuera del repo) con la fecha de hoy.
# Para verificar y restaurar: ver README, seccion Backups.

# --- Configuracion ---
$raizRepo   = Split-Path -Parent $PSScriptRoot
$contenedor = 'finanzas_dmos_db'

function Fallar($mensaje) {
  Write-Host "ERROR: $mensaje" -ForegroundColor Red
  exit 1
}

# --- Usuario y BD desde el .env de la raiz (no se escriben aqui: el repo es publico) ---
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
$carpeta = $vars['BACKUP_DIR']
if (-not $usuario -or -not $bd -or -not $carpeta) { Fallar 'Faltan POSTGRES_USER, POSTGRES_DB_MAIN o BACKUP_DIR en el .env' }
# BACKUP_DIR relativo = relativo a la raiz del repo (igual que en el compose y en los .sh).
if (-not [System.IO.Path]::IsPathRooted($carpeta)) { $carpeta = Join-Path $raizRepo $carpeta }
$carpeta = [System.IO.Path]::GetFullPath($carpeta)

$fecha   = Get-Date -Format 'yyyy-MM-dd'
$archivo = "${bd}_$fecha.dump"
$destino = Join-Path $carpeta $archivo

# --- Comprobaciones previas ---
$null = docker info --format '{{.ServerVersion}}'
if ($LASTEXITCODE -ne 0) { Fallar 'Docker no responde. Abre Docker Desktop.' }

$enMarcha = docker inspect -f '{{.State.Running}}' $contenedor
if ($LASTEXITCODE -ne 0 -or $enMarcha -ne 'true') {
  Fallar "El contenedor $contenedor no esta en marcha. Ejecuta: docker compose up -d postgres"
}

if (-not (Test-Path $carpeta)) { New-Item -ItemType Directory -Path $carpeta | Out-Null }

# --- Backup ---
Write-Host "Haciendo backup de $bd..."

docker exec $contenedor pg_dump -U $usuario -d $bd -Fc -f "/tmp/$archivo"
if ($LASTEXITCODE -ne 0) { Fallar 'pg_dump ha fallado.' }

docker cp "${contenedor}:/tmp/$archivo" $carpeta
if ($LASTEXITCODE -ne 0) { Fallar 'docker cp ha fallado.' }

if (-not (Test-Path $destino) -or (Get-Item $destino).Length -eq 0) {
  Fallar "El backup no esta en $destino o esta vacio."
}

docker exec $contenedor rm -f "/tmp/$archivo"
if ($LASTEXITCODE -ne 0) {
  Write-Host "AVISO: no se pudo borrar /tmp/$archivo del contenedor." -ForegroundColor Yellow
}

$tamanoKb = [math]::Round((Get-Item $destino).Length / 1KB, 1)
Write-Host "Backup OK: $destino ($tamanoKb KB)" -ForegroundColor Green
