# =============================================================
# Dockerfile del server (NestJS + Prisma 7)
# Se construye en 2 etapas (multi-stage):
#   1) "build": instala TODO y compila el código.
#   2) "final": solo lo necesario para ejecutar.
# La etapa build se descarta al final, así la imagen queda pequeña.
# =============================================================


# -------------------------------------------------------------
# ETAPA 1: build
# -------------------------------------------------------------

# Imagen base: Debian recortado ("slim") con Node 22 ya instalado.
# "AS build" le da nombre a la etapa para poder copiar cosas
# desde ella más adelante (COPY --from=build ...).
FROM node:22-slim AS build

# Carpeta de trabajo dentro de la imagen. Se crea si no existe
# y todas las instrucciones siguientes se ejecutan dentro (como un "cd").
WORKDIR /app

# Copiamos SOLO package.json y package-lock.json (el * pilla los dos).
# Truco de caché: Docker guarda cada instrucción como una capa.
# Si estos archivos no cambian, reutiliza la capa del "npm ci" de abajo
# y no reinstala dependencias aunque cambies el código.
COPY package*.json ./

# Instala exactamente lo que dice package-lock.json, incluidas las
# devDependencies: hacen falta para compilar (@nestjs/cli, typescript...).
# Se ejecuta al CONSTRUIR la imagen (RUN), no al arrancar el contenedor.
RUN npm ci

# Ahora sí, copiamos el resto del código de server/ a /app.
# Lo que está en .dockerignore NO se copia: node_modules (el de tu PC
# es de Windows y machacaría el recién instalado), .env (secretos) y dist.
COPY . .

# Genera el cliente de Prisma en src/generated/prisma a partir de
# prisma/schema.prisma. Tiene que ir ANTES del build porque tu código
# importa ese cliente; sin él, TypeScript no compila.
RUN npx prisma generate

# Compila src/ (incluido el cliente generado) a JavaScript en dist/.
# Ejecuta el script "build" de package.json, que es "nest build".
RUN npm run build


# -------------------------------------------------------------
# ETAPA 2: final (la imagen que realmente se ejecuta)
# -------------------------------------------------------------

# Cada FROM empieza una imagen NUEVA y VACÍA desde la base.
# No hereda nada de la etapa build (ni archivos ni WORKDIR):
# solo tendrá lo que copiemos explícitamente con COPY --from=build.
# Sin "AS" porque es la última etapa: esta es la imagen resultante.
FROM node:22-slim

# Hay que repetirlo: la etapa nueva no recuerda el WORKDIR anterior.
# Sin él trabajaríamos en la raíz del sistema (/), mezclado con /bin, /etc...
WORKDIR /app

# Copiamos de nuevo los package*.json desde tu PC (contexto de build):
# la etapa está vacía y npm ci los necesita para saber qué instalar.
# Mismo truco de caché que en la etapa build.
COPY package*.json ./

# Instala SOLO las dependencies de producción (--omit=dev): Nest,
# @prisma/client, prisma (CLI, necesario para migrate deploy), dotenv...
# Sin typescript, vitest, oxlint ni @nestjs/cli: no hacen falta para ejecutar.
# Por eso no copiamos el node_modules de la etapa build (lleva las dev).
RUN npm ci --omit=dev

# --from=build = copiar desde la etapa build, NO desde tu PC.
# dist: la app compilada (incluye el cliente de Prisma generado).
# Se usa el dist fabricado dentro de Docker, no el tuyo local
# (excluido en .dockerignore y quizá desactualizado).
COPY --from=build /app/dist ./dist

# schema.prisma + migrations/: los necesita "prisma migrate deploy".
COPY --from=build /app/prisma ./prisma

# Config del CLI de Prisma: dónde está el schema, las migraciones
# y de qué variable leer la URL de la BD (DATABASE_URL).
COPY --from=build /app/prisma.config.ts ./

# Solo DOCUMENTA que la app escucha en el 8010 (rango 8010-801x).
# No publica nada: el mapeo de puertos real se hace en el compose.
EXPOSE 8010

# Se ejecuta CADA VEZ que arranca el contenedor (no al construir).
# 1) prisma migrate deploy: aplica las migraciones pendientes a la BD.
#    Va aquí y no en un RUN porque al construir la imagen NO hay BD.
# 2) && : solo continúa si el comando anterior terminó bien.
#    Si las migraciones fallan, la app NO arranca y el contenedor se para.
# 3) node dist/main: arranca Nest (igual que npm run start:prod).
# "sh -c" hace falta porque && es sintaxis de la shell; la forma de
# array por sí sola ejecuta el programa sin shell y no lo entendería.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
