# Docker Compose Setup Walkthrough

## Overview

I have generated a [docker-compose.yml](file:///home/tech/projects/ppdb-ts-oct/docker-compose.yml) file that sets up the following services:

- **Traefik**: Reverse proxy with automatic SSL (Let's Encrypt).
- **MySQL**: Database service with persistent storage.
- **phpMyAdmin**: Web interface for MySQL.
- **Next.js App**: A placeholder service ready for your application.

## Files Created

- [docker-compose.yml](file:///home/tech/projects/ppdb-ts-oct/docker-compose.yml): The main orchestration file.
- [.env.example](file:///home/tech/projects/ppdb-ts-oct/.env.example): Template for environment variables.

## How to Use

### 1. Configure Environment Variables

Copy [.env.example](file:///home/tech/projects/ppdb-ts-oct/.env.example) to [.env](file:///home/tech/projects/ppdb-ts-oct/.env) and update the values:

```bash
cp .env.example .env
```

Edit [.env](file:///home/tech/projects/ppdb-ts-oct/.env):

- Set `MYSQL_ROOT_PASSWORD`, `MYSQL_USER`, `MYSQL_PASSWORD`.
- Set `DOMAIN_NAME` to your actual domain (e.g., `myapp.com`).
- Set `ACME_EMAIL` for SSL certificate notifications.

### 2. Create the Network

Traefik expects an external network named `web`. Create it if it doesn't exist:

```bash
docker network create web
```

### 3. Run the Services

Start the stack:

```bash
docker-compose up -d
```

### 4. Access Services

- **Next.js App**: `https://www.your-domain.com` or `https://your-domain.com`
- **phpMyAdmin**: `https://db.your-domain.com`
- **Traefik Dashboard**: `http://localhost:8080` (if port 8080 is enabled and mapped)

## Verification

- Check running containers: `docker-compose ps`
- Check logs: `docker-compose logs -f`
