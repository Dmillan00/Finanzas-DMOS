# =============================================================
# Dockerfile del client (Next.js con output: 'standalone')
# Se construye en 2 etapas (multi-stage):
#   1) "build": instala TODO y ejecuta next build.
#   2) "final": solo el servidor mínimo que genera standalone.
# La etapa build se descarta al final, así la imagen queda pequeña.
# =============================================================


# -------------------------------------------------------------
# ETAPA 1: build
# -------------------------------------------------------------

# Imagen base: Debian recortado ("slim") con Node 22 ya instalado.
# "AS build" le da nombre a la etapa para poder copiar cosas
# desde ella más adelante (COPY --from=build ...).
FROM node:22-slim AS build

# Carpeta de trabajo dentro de la imagen (como un "cd").
WORKDIR /app

# Copiamos SOLO package.json y package-lock.json (el * pilla los dos).
# Truco de caché: si no cambian, Docker reutiliza la capa del "npm ci"
# y no reinstala dependencias aunque cambies el código.
COPY package*.json ./

# Instala exactamente lo que dice package-lock.json, incluidas las
# devDependencies: hacen falta para compilar (typescript, tailwind...).
RUN npm ci

# Copiamos el resto del código de client/ a /app.
# Lo que está en .dockerignore NO se copia: node_modules (el de tu PC
# es de Windows), .next (build local) y los .env (secretos).
COPY . .

# Ejecuta "next build". Con output: 'standalone' (next.config.ts)
# genera .next/standalone: un server.js mínimo + solo los node_modules
# que la app usa de verdad.
# No necesita el back ni API_URL: todas las páginas usan connection()
# y son dinámicas, así que ninguna hace fetch durante el build.
RUN npm run build


# -------------------------------------------------------------
# ETAPA 2: final (la imagen que realmente se ejecuta)
# -------------------------------------------------------------

# Imagen NUEVA y VACÍA: no hereda nada de la etapa build.
FROM node:22-slim

# Hay que repetirlo: la etapa nueva no recuerda el WORKDIR anterior.
WORKDIR /app

 

# El servidor mínimo (server.js) con sus node_modules justos.
# Por eso aquí NO hay npm ci: standalone ya trae lo necesario.
COPY --from=build /app/.next/standalone ./

# CSS y JS que se envían al navegador. standalone NO los copia solo
# (docs de Next: output.md), hay que añadirlos a mano.
COPY --from=build /app/.next/static ./.next/static

# Archivos estáticos (imágenes de public/cards, iconos...).
# Tampoco los copia standalone.
COPY --from=build /app/public ./public

# Puerto en el que escucha server.js (rango 8010-801x, client = 8012).
ENV PORT=8012

# Escuchar en todas las interfaces del contenedor. Sin esto solo
# respondería desde dentro del propio contenedor y no llegarías desde fuera.
ENV HOSTNAME=0.0.0.0

# Solo DOCUMENTA el puerto; el mapeo real se hace en el compose.
EXPOSE 8012

# Se ejecuta CADA VEZ que arranca el contenedor.
# Forma de array sin "sh -c": no hay && ni nada de shell que interpretar.
CMD ["node", "server.js"]
