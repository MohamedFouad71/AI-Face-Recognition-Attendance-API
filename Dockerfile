# ==========================================
# Stage 1: Builder
# ==========================================
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY src ./src
# output to /app/dist
RUN npm run build

# npm ci deletes any existing node_modules before installation
# which means it will keep only the dev dependancies
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts

# ==========================================
# Stage 2: Production Runtime
# ==========================================
FROM gcr.io/distroless/nodejs24-debian13:nonroot AS production

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /app/dist ./dist
COPY .env .
COPY package*.json .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["/nodejs/bin/node", "/app/dist/src/healthcheck.js"]

# The default entrypoint in this image is `/nodejs/bin/node`
CMD ["--env-file", ".env", "dist/src/server.js"]