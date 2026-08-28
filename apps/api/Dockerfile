# Build context is the REPO ROOT (see docker-compose.yml: api.build.context = ".",
# api.build.dockerfile = "apps/api/Dockerfile"), not this directory. That's a
# deliberate change from the pre-shared-package version of this file, needed
# because apps/api now depends on the packages/shared workspace package
# (see packages/shared/package.json) -- Docker can only COPY files that are
# inside the build context, and packages/shared lives outside apps/api.
#
# package.json files are copied (and installed) before the rest of the
# source on purpose, so `npm install` only reruns when a manifest actually
# changes, not on every source edit.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
# --workspace restricts what actually gets installed to apps/api + the
# shared package + root-level deps -- apps/web's own dependencies (react,
# vite, ...) are NOT installed here, even though apps/web/package.json has
# to be present for npm to resolve the workspace list declared in the root
# package.json.
RUN npm install --workspace=apps/api --include-workspace-root
COPY packages/shared packages/shared
COPY apps/api apps/api
# packages/shared ships compiled (see its package.json) because the
# production stage below runs plain `node`, with no TypeScript loader.
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/api

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install --workspace=apps/api --include-workspace-root --omit=dev
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/apps/api/dist ./apps/api/dist
EXPOSE 4000
CMD ["node", "apps/api/dist/index.js"]
