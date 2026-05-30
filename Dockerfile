# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────
# Stage 1 — build the static bundle
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Install deps from the lockfile first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Build. VITE_API_BASE_URL is intentionally left empty so the app uses
# same-origin relative paths (/api, /rag, ...) which nginx proxies to the
# backend at runtime — this avoids CORS and keeps the image backend-agnostic.
COPY . .
RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 2 — serve with nginx + reverse-proxy to the backend
# ─────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# The nginx image runs envsubst on /etc/nginx/templates/*.template at startup,
# substituting ONLY real env vars (BACKEND_URL) and leaving $uri/$host intact.
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

# Default backend target — override with -e BACKEND_URL=... or compose env.
ENV BACKEND_URL=http://host.docker.internal:8000

EXPOSE 80
# (default nginx CMD + docker-entrypoint handles envsubst + start)
