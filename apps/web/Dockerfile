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
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
