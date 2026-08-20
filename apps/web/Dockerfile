FROM node:22-alpine AS build
WORKDIR /app
# По умолчанию пусто — значит "тот же origin", относительные запросы
# "/api/..." через nginx-проксю (см. nginx.conf и корневой docker-compose.yml).
# Передайте --build-arg VITE_API_BASE_URL=... явно, только если API реально
# живёт на другом origin/домене, чем сам фронтенд.
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
