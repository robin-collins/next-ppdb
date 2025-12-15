# syntax=docker.io/docker/dockerfile:1

FROM node:20-trixie AS base

# Build arguments for version info (declared early for use in all stages)
ARG BUILD_VERSION=dev
ARG BUILD_COMMIT=unknown
ARG BUILD_DATE=unknown

# Step 1. Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./

# Enable pnpm
RUN corepack enable pnpm

# Install dependencies
RUN pnpm i --frozen-lockfile

COPY src ./src
COPY public ./public
COPY prisma ./prisma
COPY next.config.ts .
COPY postcss.config.mjs .
COPY tsconfig.json .
COPY scripts ./scripts

# Generate Prisma Client
RUN pnpm exec prisma generate

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030
# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030
# ARG DATABASE_URL
# ENV DATABASE_URL=${DATABASE_URL}
# ARG DEBUG
# ENV DEBUG=${DEBUG}

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at build time
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js
RUN pnpm build

# Note: It is not necessary to add an intermediate step that does a full copy of `node_modules` here

# Step 2. Production image, copy all the files and run next
FROM base AS runner

# Re-declare build args for this stage
ARG BUILD_VERSION=dev
ARG BUILD_COMMIT=unknown
ARG BUILD_DATE=unknown

# Labels for container metadata
LABEL org.opencontainers.image.version="${BUILD_VERSION}" \
      org.opencontainers.image.revision="${BUILD_COMMIT}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.title="PPDB - Pampered Pooch Database" \
      org.opencontainers.image.description="Next.js pet grooming database application"

# Environment variables for runtime version info
ENV APP_BUILD_VERSION=${BUILD_VERSION} \
    APP_BUILD_COMMIT=${BUILD_COMMIT} \
    APP_BUILD_DATE=${BUILD_DATE}

WORKDIR /app

# Set non‑interactive mode for all subsequent apt commands
ENV DEBIAN_FRONTEND=noninteractive

# Install useful network tools and mysql client for raw SQL imports and backups
RUN apt-get update && apt-get install -y \
    curl \
    net-tools \
    lsof \
    iproute2 \
    default-mysql-client \
    mariadb-client \
    && rm -rf /var/lib/apt/lists/*

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create writable directories for uploads, logs, and backups before switching to non-root user
RUN mkdir -p /app/uploads /app/logs /app/backups && chown -R nextjs:nodejs /app/uploads /app/logs /app/backups

# Install Prisma CLI globally for migrations (pinned to match project version)
RUN npm install -g prisma@6

USER nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and migrations for runtime migrations
# Note: Generated client is in src/generated/prisma/ and already included in standalone build
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy startup script that runs migrations before starting the server
COPY --chown=nextjs:nodejs docker/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Environment variables must be redefined at run time
# Environment variables must be redefined at run time
# ARG DATABASE_URL
# ENV DATABASE_URL=${DATABASE_URL}
# ARG DEBUG
# ENV DEBUG=${DEBUG}

# Uncomment the following line to disable telemetry at run time
ENV NEXT_TELEMETRY_DISABLED=1

# Note: Don't expose ports here, Compose will handle that for us

# Run migrations and start server
CMD ["/app/docker-entrypoint.sh"]