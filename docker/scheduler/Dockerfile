FROM alpine:3.20

# Build arguments for version info
ARG BUILD_VERSION=dev
ARG BUILD_COMMIT=unknown
ARG BUILD_DATE=unknown

# Labels for container metadata
LABEL org.opencontainers.image.version="${BUILD_VERSION}" \
      org.opencontainers.image.revision="${BUILD_COMMIT}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.title="PPDB Scheduler" \
      org.opencontainers.image.description="Scheduled task runner for PPDB (backups, updates, maintenance)"

# Environment variables for runtime version info
ENV SCHEDULER_VERSION=${BUILD_VERSION} \
    SCHEDULER_COMMIT=${BUILD_COMMIT} \
    SCHEDULER_BUILD_DATE=${BUILD_DATE}

# Install required packages
# - curl: for HTTP requests to Next.js app
# - docker-cli: for executing Docker commands (pull, restart, etc.)
# - docker-cli-compose: for docker compose commands during updates
# - logrotate: for log rotation
# - tzdata: for timezone support
# - msmtp: for sending email notifications (fallback when app is unhealthy)
RUN apk add --no-cache \
    curl \
    docker-cli \
    docker-cli-compose \
    logrotate \
    tzdata \
    bash \
    msmtp

# Create directories
RUN mkdir -p /var/log/scheduler /scripts

# Copy configuration files
COPY crontab /etc/crontabs/root
COPY logrotate.conf /etc/logrotate.d/scheduler
# Copy scripts
COPY scripts/ /scripts/
RUN chmod +x /scripts/*.sh

# Copy and set entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy health check script
COPY healthcheck.sh /healthcheck.sh
RUN chmod +x /healthcheck.sh

# Set timezone to Australia/Adelaide
ENV TZ=Australia/Adelaide
RUN cp /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /healthcheck.sh

# Entrypoint
ENTRYPOINT ["/entrypoint.sh"]
