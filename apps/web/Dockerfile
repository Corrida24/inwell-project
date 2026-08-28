# Build context is the REPO ROOT (see docker-compose.yml: web.build.context = ".",
# web.build.dockerfile = "apps/web/Dockerfile"), not this directory -- same
# reason as apps/api/Dockerfile: apps/web now depends on the packages/shared
# workspace package, which lives outside apps/web and has to be inside the
# build context to be COPYable.

FROM node:22-alpine AS build
WORKDIR /app
# По умолчанию пусто — значит "тот же origin", относительные запросы
# "/api/..." через nginx-проксю (см. nginx.conf и корневой docker-compose.yml).
# Передайте --build-arg VITE_API_BASE_URL=... явно, только если API реально
# живёт на другом origin/домене, чем сам фронтенд.
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
# Supabase (корпоративный login, apps/web/src/corporate/supabaseClient.ts).
# Это ПУБЛИЧНЫЕ ключи (anon/publishable), но всё равно только build-time:
# .dockerignore нарочно исключает .env из контекста сборки, поэтому без
# этих ARG у Vite неоткуда взять значения и login показывает "Supabase ещё
# не настроен". Передавайте через --build-arg или docker-compose.yml args:
# (см. корневой docker-compose.yml и .env.example рядом с ним).
ARG VITE_SUPABASE_URL=""
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY=""
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
# --workspace restricts what actually gets installed to apps/web + the
# shared package + root-level deps -- apps/api's own dependencies (express,
# pg, ...) are NOT installed here, even though apps/api/package.json has to
# be present for npm to resolve the workspace list declared in the root
# package.json.
RUN npm install --workspace=apps/web --include-workspace-root
COPY packages/shared packages/shared
COPY apps/web apps/web
# Vite transforms TypeScript on the fly, including from a linked workspace
# package, so unlike apps/api's production image this doesn't strictly
# require packages/shared to be pre-built -- but building it anyway keeps
# both Dockerfiles doing the same thing and gives Vite the (slightly
# faster to resolve) compiled output instead of raw .ts.
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/web

FROM nginx:alpine
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
