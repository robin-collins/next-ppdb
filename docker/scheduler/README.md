# PPDB Scheduler Container

Sidecar container for automated scheduled tasks including:

- Nightly database backups (2:00 AM)
- Version checks (6:00 AM daily)
- Update execution (8:00 PM - approved updates only)

## Production Setup

The scheduler is designed for production use with GHCR images. The `docker-compose.yml` should use:

```yaml
next-ppdb:
  image: ghcr.io/${GHCR_REPOSITORY:-robin-collins/next-ppdb}:${APP_VERSION:-latest}
```

### Required Environment Variables

| Variable            | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `SCHEDULER_API_KEY` | Shared secret for scheduler-to-app authentication          |
| `GHCR_TOKEN`        | GitHub Container Registry personal access token            |
| `GHCR_REPOSITORY`   | Repository path (default: `robin-collins/next-ppdb`)       |
| `APP_VERSION`       | Current application version for update tracking            |
| `TZ`                | Timezone for cron scheduling (default: `Australia/Sydney`) |

### How Updates Work

1. **Version Check (6:00 AM)**: Queries GHCR for available versions, creates pending update if newer version exists
2. **Admin Approval**: User approves update via web UI (`/admin/updates`)
3. **Update Execution (8:00 PM)**: Scheduler pulls new image and recreates container
4. **Health Check**: Waits up to 5 minutes for healthy status
5. **Auto-Rollback**: If health check fails, automatically rolls back to previous version

## Local Development Testing

For local testing of the scheduler update mechanism:

### Option 1: Temporarily Use GHCR Images

1. Ensure you have a published test version on GHCR
2. Update `.env` with:
   ```
   APP_VERSION=0.1.0
   GHCR_TOKEN=your_token
   ```
3. The scheduler will work as in production

### Option 2: Manual Testing Without Scheduler

1. Build and tag your local image:
   ```bash
   docker build -t ghcr.io/robin-collins/next-ppdb:0.1.1 .
   ```
2. Update `APP_VERSION` in `.env`
3. Manually run:
   ```bash
   docker compose up -d --force-recreate next-ppdb
   ```

### Option 3: Test Scheduler Scripts Directly

1. Exec into the scheduler container:
   ```bash
   docker exec -it ppdb-scheduler /bin/bash
   ```
2. Run scripts manually:
   ```bash
   /scripts/version-check.sh
   /scripts/execute-updates.sh
   ```

## Scripts

| Script                   | Schedule    | Description                           |
| ------------------------ | ----------- | ------------------------------------- |
| `backup.sh`              | 2:00 AM     | Creates database backup via app API   |
| `version-check.sh`       | 6:00 AM     | Checks GHCR for new versions          |
| `execute-updates.sh`     | 8:00 PM     | Executes approved updates             |
| `process-email-queue.sh` | Every 5 min | Processes pending notification emails |

## Logs

Logs are stored in `/var/log/scheduler/` inside the container and exposed via the `scheduler_logs` volume.

View logs:

```bash
docker exec ppdb-scheduler cat /var/log/scheduler/scheduler.log
```

## Health Check

The scheduler health check (`/healthcheck.sh`) verifies:

- Cron daemon is running
- App API is reachable
- Required environment variables are set
