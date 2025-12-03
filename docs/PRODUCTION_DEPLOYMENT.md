# Production Deployment Guide

This guide outlines the complete process for deploying the Next PPDB application, including migrating data from a legacy installation.

## Prerequisites

- **Docker Engine** (v20.10+)
- **Docker Compose** (v2.0+)
- Access to the server where the application will run.
- A backup of your legacy database (if migrating).

---

## Phase 1: Preparation (Legacy App)

If you are migrating from an existing legacy version of the application, follow these steps to secure your data.

### 1. Backup Legacy Database

Perform a full dump of your existing MySQL database.

```bash
# Replace 'legacy_db_user', 'legacy_db_name' with your actual values
mysqldump -u legacy_db_user -p legacy_db_name > legacy_backup.sql
```

> [!IMPORTANT]
> Verify the backup file exists and is not empty before proceeding.

### 2. Stop Legacy Application

Stop the old application to prevent any new data from being written during the transition.

```bash
# Example if using systemd
sudo systemctl stop apache2
sudo systemctl stop mysql
# OR if using docker
docker-compose down
```

---

## Phase 2: Installation (New App)

### 1. Clone Repository

Clone the new Next PPDB repository to your desired location.

```bash
git clone https://github.com/robin-collins/next-ppdb.git
cd next-ppdb
```

### 2. Configure Environment

Create the production environment file.

```bash
cp .env.example .env
```

Edit `.env` and set your production values:

- `MYSQL_ROOT_PASSWORD`: Set a strong password.
- `MYSQL_PASSWORD`: Set a strong password for the app user.
- `DOMAIN`: Your domain name (e.g., `ppdb.example.com`).

---

## Phase 3: Launch

Start the application stack using Docker Compose.

```bash
docker-compose up -d
```

Wait for the containers to initialize. You can check the status with:

```bash
docker-compose ps
```

---

## Phase 4: Onboarding & Data Migration

The new application includes a built-in setup wizard to handle data migration.

1.  **Access the Setup Page**
    Open your browser and navigate to: `https://<your-domain>/setup`
    (e.g., `https://ppdb.example.com/setup`)

2.  **Upload Backup**
    - You will be prompted to upload the `legacy_backup.sql` file you created in Phase 1.
    - The system will automatically:
      - Import the legacy data.
      - Normalize the schema (convert types, fix dates, etc.).
      - Validate the data integrity.

3.  **Completion**
    - Once the process is complete, you will be redirected to the main dashboard.
    - Your application is now live with your migrated data!

---

## Troubleshooting

### Setup Page Not Loading

- Ensure the containers are running: `docker-compose ps`
- Check logs: `docker-compose logs -f app`

### Migration Failed

- The setup page will provide an error log.
- Common issues include corrupted backup files or insufficient server memory.
- Check `docker-compose logs -f app` for detailed error messages.
