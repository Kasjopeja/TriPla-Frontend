# syntax=docker/dockerfile:1.7
# Multi-stage: Node 20 (build) -> nginx-alpine (runtime).

# ---------- 1. BUILD ----------
FROM node:20-alpine AS build
WORKDIR /app

# Najpierw lockfile + manifest dla cachowania npm install.
COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .
# Vite build produkuje statyczne pliki w dist/
RUN npm run build

# ---------- 2. RUNTIME ----------
FROM nginx:1.27-alpine AS runtime

# Konfiguracja nginx z SPA fallback i opcjonalnym proxy /api.
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Domyślny adres backendu – nadpisywalny przy `docker run -e API_URL=...`.
ENV API_URL=http://api:8080

# Skopiuj zbudowane pliki.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Obraz nginx:alpine ma `envsubst` template'ing wbudowany,
# templates/*.template są procesowane do conf.d/ przy starcie kontenera.
