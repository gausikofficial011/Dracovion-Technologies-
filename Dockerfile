# ==============================================================================
# Dockerfile — Dracovion Technologies Backend (Node.js 20 Alpine)
# Optional: use if deploying to Railway, Fly.io, VPS, or any Docker host
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for root workspace + backend
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm ci --workspace=backend

# Copy backend source and compile TypeScript
COPY backend/ ./backend/
RUN npm run build --workspace=backend

# ==============================================================================
# Production image — only runtime dependencies
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install production-only deps via root workspace lockfile
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm ci --workspace=backend --include-workspace-root --omit=dev && npm cache clean --force

# Copy compiled backend from builder stage
COPY --from=builder /app/backend/dist ./backend/dist

# Create uploads directory (writable)
RUN mkdir -p ./backend/uploads

EXPOSE 5000

CMD ["npm", "run", "start", "--workspace=backend"]
