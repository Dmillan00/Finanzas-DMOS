# Finanzas DMOS

App de finanzas personales: cuentas con su saldo, movimientos (ingresos, gastos y transferencias) y un dashboard por periodo de cobro.

**Stack:** NestJS (ESM) + Prisma 7 · Next.js + Tailwind + shadcn/ui (Base UI) · PostgreSQL 17 · Docker Compose.

## Modos y puertos

Un solo PostgreSQL con dos BD: la **principal** (`POSTGRES_DB_MAIN`, datos reales) y la de **desarrollo** (`POSTGRES_DB`, npm, `migrate dev` y e2e).

| Puerto      | Servicio        | Modo                                      |
| ----------- | --------------- | ----------------------------------------- |
| 8014        | Client          | Uso normal (Docker Compose, BD principal) |
| 8013        | Server          | Uso normal ¹                              |
| 8012 / 8010 | Client / Server | Desarrollo (npm, BD de desarrollo)        |
| 8011        | PostgreSQL      | Ambos ¹                                   |

¹ Solo con `docker-compose.override.yml` (ver Configuración). Sin él, el compose solo publica el client.

## Configuración

```bash
git clone https://github.com/Dmillan00/Finanzas-DMOS.git
cd Finanzas-DMOS
```

Copia cada `.example` y rellénalo. Los `.env` no se suben al repo.

| Archivo                       | Variables                                                                                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.env`                        | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_DB_MAIN`, `DB_PORT=8011`, `SERVER_PORT_MAIN=8013`, `CLIENT_PORT_MAIN=8014`, `BACKUP_DIR` (carpeta de backups fuera del repo, p. ej. `../Respaldo/FinanzasDMOS`) |
| `server/.env`                 | `DATABASE_URL` (BD de desarrollo en `localhost:8011`; en Docker la sobrescribe el compose), `PORT=8010`, `CORS_ORIGIN=http://localhost:8012`, `DIA_COBRO` (1–28). **Obligatorio también con Docker**                           |
| `client/.env.local`           | `API_URL=http://localhost:8010`. Solo para desarrollo                                                                                                                                                                          |
| `docker-compose.override.yml` | Copia de `docker-compose.override.example.yml`: publica PostgreSQL y el server. Solo en el PC ⚠️ no lo crees en un servidor                                                                                                    |

> Los valores de los `.example` son de ejemplo (puertos incluidos): usa los de esta tabla.

## Uso normal (Docker Compose)

```bash
docker compose up -d postgres
# Solo la primera vez: crear la BD principal (sin ella el server no arranca)
docker exec -it finanzas_dmos_db psql -U <POSTGRES_USER> -d postgres -c "CREATE DATABASE <POSTGRES_DB_MAIN>;"
docker compose up -d --build   # http://localhost:8014
docker compose down            # parar
```

El server aplica las migraciones al arrancar (`prisma migrate deploy`). Usa `--build` cada vez que cambie el código.

> ⚠️ Nunca `docker compose down -v`: borra el volumen `postgres_data` con todos los datos.

## Desarrollo (npm)

```bash
docker compose up -d postgres            # la BD de desarrollo se crea sola

# Terminal 1, desde la raíz del repo
cd server && npm install && npx prisma generate && npx prisma migrate deploy
npm run start:dev                        # http://localhost:8010

# Terminal 2, desde la raíz del repo
cd client && npm install && npm run dev  # http://localhost:8012
```

Tests, desde `server/`: `npm test` (unitarios) y `npm run test:e2e` (contra la BD de desarrollo).

## Backups

Servicio `backup` del compose: `pg_dump -Fc` diario de la BD principal a `BACKUP_DIR` (relativa = desde la raíz del repo), como `<bd>_AAAA-MM-DD.dump`. Guarda 28 días. Forzar uno: `docker compose restart backup`.

## Flujo de trabajo

`main` es la versión estable. Cada cambio va en una rama (`feature/`, `fix/`, `refactor/`) y entra por PR. Solo una rama con migraciones de Prisma abierta a la vez.

## Licencia

[MIT](LICENSE)
