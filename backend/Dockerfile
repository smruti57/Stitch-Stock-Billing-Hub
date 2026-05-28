# ── Stage 1: install dependencies ─────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
# Install production deps only
RUN npm ci --omit=dev


# ── Stage 2: production runtime ────────────────────────────────
FROM node:20-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy deps from builder, then app source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure appuser owns the files
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 5000

ENV NODE_ENV=production

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
