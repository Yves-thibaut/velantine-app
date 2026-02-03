# Contexte = racine du projet (comme le backend). Préfixe du front Next.js.
ARG SRC=valentine-front/valentine-web

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
ARG SRC=valentine-front/valentine-web
# Copy package files
COPY ${SRC}/package*.json ./
# Install dependencies
RUN yarn install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
ARG SRC=valentine-front/valentine-web
# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY ${SRC}/ .

# Set environment variables (NEXT_PUBLIC_* au build pour l’URL de l’API)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the application
RUN yarn build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Start the application
CMD ["node", "server.js"]
