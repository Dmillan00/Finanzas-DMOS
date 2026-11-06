# Finanzas DMOS

App de finanzas personales: cuentas con su saldo, movimientos (ingresos, gastos y transferencias) y un dashboard por periodo de cobro.

## Stack

| Parte | Tecnología |
| --- | --- |
| Server | NestJS (ESM), Prisma 7, vitest, oxlint |
| Client | Next.js, TypeScript, Tailwind, shadcn/ui (Base UI), Sonner |
| Base de datos | PostgreSQL 17 |
| Despliegue | Docker Compose |

## Requisitos

- Git
- Docker con Docker Compose
- Node.js LTS con npm (solo para desarrollo)

## Puertos

| Puerto | Servicio | Modo |
| --- | --- | --- |
| 8011 | PostgreSQL | Ambos |
| 8013 | Server | App (compose) |
| 8014 | Client | App (compose) |
| 8010 | Server | Desarrollo |
| 8012 | Client | Desarrollo |

## Bases de datos

Un solo PostgreSQL con dos bases de datos:

| BD | Variable | Uso |
| --- | --- | --- |
| Desarrollo | `POSTGRES_DB` | `npm run start:dev`, `prisma migrate dev` y tests e2e |
| Principal | `POSTGRES_DB_MAIN` | La app levantada con el compose |

## Puesta en marcha

### 1. Clonar

```bash
git clone https://github.com/Dmillan00/Finanzas-DMOS.git
cd Finanzas-DMOS
```

### 2. Variables de entorno

| Archivo | Se crea a partir de | Para qué |
| --- | --- | --- |
| `.env` (raíz) | `.env.example` | Credenciales de Postgres, nombres de las BD y puertos del compose |
| `server/.env` | `server/.env.example` | `DATABASE_URL` (BD de desarrollo), `PORT`, `CORS_ORIGIN`, `DIA_COBRO` (1–28) |
| `client/.env.local` | `client/.env.example` | `API_URL` del server de desarrollo |

Los valores de los `.example` son de ejemplo: ajústalos a los puertos de la tabla de arriba.

> Los `.env` no se suben al repo. No pongas contraseñas reales en los `.example`.

### 3. Levantar PostgreSQL

```bash
docker compose up -d postgres
```

La BD de desarrollo (`POSTGRES_DB`) se crea sola la primera vez. La principal hay que crearla a mano:

```bash
docker exec -it finanzas_dmos_db psql -U <POSTGRES_USER> -d postgres -c "CREATE DATABASE <POSTGRES_DB_MAIN>;"
```

## Usar la app (Docker Compose)

```bash
docker compose up -d --build
```

- Abre `http://localhost:8014`.
- Al arrancar, el server aplica las migraciones pendientes (`prisma migrate deploy`) en la BD principal.

Para pararla:

```bash
docker compose down
```

> ⚠️ No uses `docker compose down -v`: borra el volumen `postgres_data` con todos los datos.

## Desarrollo

Con solo PostgreSQL levantado:

```bash
# server
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev    # http://localhost:8010

# client (en otra terminal)
cd client
npm install
npm run dev          # http://localhost:8012
```

### Tests

Desde `server/`:

```bash
npm test             # unitarios
npm run test:e2e     # e2e, contra la BD de desarrollo
```

## Flujo de trabajo

- `main` es la versión estable.
- Cada cambio va en una rama (`feat/`, `fix/`, `refactor/`) y entra por PR.
- Solo una rama con migraciones de Prisma abierta a la vez.

## Licencia

[MIT](LICENSE)
