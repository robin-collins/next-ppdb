FROM alpine:3.20

# Install required packages
# - curl: for HTTP requests to Next.js app
# - docker-cli: for executing Docker commands (pull, restart, etc.)
# - logrotate: for log rotation
# - tzdata: for timezone support
RUN apk add --no-cache \
    curl \
    docker-cli \
    logrotate \
    tzdata \
    bash

# Create directories
RUN mkdir -p /var/log/scheduler /scripts

# Copy configuration files
COPY crontab /etc/crontabs/root
COPY logrotate.conf /etc/logrotate.d/scheduler
COPY scripts/ /scripts/

# Set permissions
RUN chmod +x /scripts/*.sh

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

# Run crond in foreground with log level 2 (notice and above)
CMD ["crond", "-f", "-l", "2"]
