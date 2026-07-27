# syntax=docker/dockerfile:1
FROM oven/bun:1.3-alpine AS base
WORKDIR /app

# --- deps ---
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# --- runtime ---
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Drop root — Bun's alpine image ships a non-root "bun" user
RUN chown -R bun:bun /app
USER bun

EXPOSE 4070

# Run migrations, then boot the server. Split into a separate entrypoint
# script so `docker compose exec` can also invoke migrations manually.
COPY --chown=bun:bun docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["bun", "run", "src/index.ts"]
