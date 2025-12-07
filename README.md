# Next PPDB (Pedigree Database)

A modern, containerized Pedigree Database application built with Next.js, MySQL, and Traefik.

## Features

- **Next.js Framework**: High-performance React framework for the frontend and API.
- **MySQL Database**: Robust relational database for storing pedigree information.
- **Traefik Reverse Proxy**: Automatic SSL certificate management and routing.
- **Dockerized**: Fully containerized environment for consistent deployment.
- **phpMyAdmin**: Web interface for database management.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Installation & Deployment

For detailed production deployment and migration instructions, please see **[docs/PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md)**.

### Quick Install (Windows)

Run the following command in PowerShell to automatically download configuration files, set up the environment, and start the application:

```powershell
powershell -c "irm https://raw.githubusercontent.com/robin-collins/next-ppdb/main/quick-install.ps1 | iex"
```

### Manual Installation (Linux / macOS / Windows)

If you prefer to setup manually or are on a non-Windows system:

1.  **Download Files**:
    - `docker-compose.yml`
    - `.env.example` -> `.env`
    - `docker/mysql-init/01-grant-privileges.sh` (preserve directory structure)

2.  **Configure**: Update `.env` with your settings.

3.  **Run**: `docker compose up -d`

## Usage

Once the containers are up and running:

- **Application**: Access the main application at `https://next-ppdb.yourdomain.com` (or configured domain).
- **Traefik Dashboard**: Monitor routes and services at `https://traefik.yourdomain.com` (if enabled).
- **phpMyAdmin**: Manage the database at `https://db.yourdomain.com`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
