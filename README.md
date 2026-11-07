# Finanzas DMOS

App de finanzas personales: cuentas con su saldo, movimientos (ingresos, gastos y transferencias) y un dashboard por periodo de cobro.

## Stack

| Parte | Tecnología |
| --- | --- |
| Server | NestJS (ESM), Prisma 7, vitest, oxlint |
| Client | Next.js, TypeScript, Tailwind, shadcn/ui (Base UI), Sonner |
| Base de datos | PostgreSQL 17 |
| Despliegue | Docker Compose |

## Dos formas de usarlo

| | Uso normal | Desarrollo |
| --- | --- | --- |
| Para qué | Usar la app con los datos reales | Programar y probar cambios |
| Cómo se levanta | Todo con Docker Compose | Postgres en Docker, server y client con npm |
| BD | Principal (`POSTGRES_DB_MAIN`) | Desarrollo (`POSTGRES_DB`) |
| Abrir en | `http://localhost:8014` | `http://localhost:8012` |
| Requisitos | Git, Docker con Compose | Git, Docker con Compose, Node.js LTS con npm |

Los pasos 1 y 2 son comunes. Después sigue solo la sección que te toque.

## Puertos

| Puerto | Servicio | Modo |
| --- | --- | --- |
| 8011 | PostgreSQL | Ambos |
| 8013 | Server | Uso normal |
| 8014 | Client | Uso normal |
| 8010 | Server | Desarrollo |
| 8012 | Client | Desarrollo |

## Bases de datos

Un solo PostgreSQL con dos bases de datos:

| BD | Variable | Uso | Cómo se crea |
| --- | --- | --- | --- |
| Principal | `POSTGRES_DB_MAIN` | Uso normal (datos reales) | A mano (ver Uso normal, paso 3) |
| Desarrollo | `POSTGRES_DB` | `npm run start:dev`, `prisma migrate dev` y tests e2e | Sola, la primera vez que arranca Postgres |

---

## Común

### 1. Clonar

```bash
git clone https://github.com/Dmillan00/Finanzas-DMOS.git
cd Finanzas-DMOS
```

### 2. `.env` de la raíz

Copia `.env.example` a `.env` y rellena:

| Variable | Valor |
| --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | Credenciales de Postgres |
| `POSTGRES_DB` | Nombre de la BD de desarrollo |
| `POSTGRES_DB_MAIN` | Nombre de la BD principal |
| `DB_PORT` | `8011` |
| `SERVER_PORT_MAIN` | `8013` |
| `CLIENT_PORT_MAIN` | `8014` |

> Los valores del `.env.example` son de ejemplo (puertos incluidos). Usa los de esta tabla.
>
> Los `.env` no se suben al repo. No pongas contraseñas reales en los `.example`.

---

## Uso normal (Docker Compose)

### 1. `server/.env`

Copia `server/.env.example` a `server/.env`. **Es obligatorio aunque no uses npm**: el compose lo carga y falla si no existe.

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | Da igual cuál pongas: el compose la sobrescribe para apuntar a la BD principal |
| `PORT` | `8010` |
| `CORS_ORIGIN` | `http://localhost:8012` |
| `DIA_COBRO` | Día de cobro (1–28) |

No hace falta `client/.env.local`: el compose ya le pasa `API_URL` al client.

### 2. Levantar PostgreSQL

```bash
docker compose up -d postgres
```

### 3. Crear la BD principal (solo la primera vez)

```bash
docker exec -it finanzas_dmos_db psql -U <POSTGRES_USER> -d postgres -c "CREATE DATABASE <POSTGRES_DB_MAIN>;"
```

Sin ella el server no arranca (falla `prisma migrate deploy`).

### 4. Levantar la app

```bash
docker compose up -d --build
```

- Abre `http://localhost:8014`.
- Al arrancar, el server aplica las migraciones pendientes (`prisma migrate deploy`) en la BD principal.
- Usa `--build` la primera vez y cada vez que cambie el código.

### 5. Pararla

```bash
docker compose down
```

> ⚠️ No uses `docker compose down -v`: borra el volumen `postgres_data` con todos los datos.

---

## Desarrollo (npm)

### 1. `server/.env`

Copia `server/.env.example` a `server/.env`:

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | `postgresql://<POSTGRES_USER>:<POSTGRES_PASSWORD>@localhost:8011/<POSTGRES_DB>?schema=public` |
| `PORT` | `8010` |
| `CORS_ORIGIN` | `http://localhost:8012` |
| `DIA_COBRO` | Día de cobro (1–28) |

### 2. `client/.env.local`

Copia `client/.env.example` a `client/.env.local`:

```
API_URL=http://localhost:8010
```

### 3. Levantar solo PostgreSQL

```bash
docker compose up -d postgres
```

La BD de desarrollo se crea sola. No hace falta crear la principal.

### 4. Server

```bash
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev    # http://localhost:8010
```

### 5. Client (en otra terminal)

```bash
cd client
npm install
npm run dev          # http://localhost:8012
```

### 6. Tests

Desde `server/`:

```bash
npm test             # unitarios
npm run test:e2e     # e2e, contra la BD de desarrollo
```

---

## Flujo de trabajo

- `main` es la versión estable.
- Cada cambio va en una rama (`feat/`, `fix/`, `refactor/`) y entra por PR.
- Solo una rama con migraciones de Prisma abierta a la vez.

## Licencia

[MIT](LICENSE)
