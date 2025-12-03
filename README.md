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

### Quick Start (Dev/Test)

You can quickly set up the project by pulling the configuration files directly from the repository.

### Bash (Linux / macOS)

```bash
# Download configuration files
curl -O https://raw.githubusercontent.com/robin-collins/next-ppdb/main/docker-compose.yml
curl -O https://raw.githubusercontent.com/robin-collins/next-ppdb/main/.env.example

# Create environment file
cp .env.example .env

# Note: Open .env and update the variables with your specific configuration before proceeding.

# Pull images and start services
docker compose pull && docker compose up -d
```

### PowerShell (Windows)

```powershell
# Download configuration files
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/robin-collins/next-ppdb/main/docker-compose.yml" -OutFile "docker-compose.yml"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/robin-collins/next-ppdb/main/.env.example" -OutFile ".env.example"

# Create environment file
Copy-Item .env.example .env

# Note: Open .env and update the variables with your specific configuration before proceeding.

# Pull images and start services
docker compose pull; docker compose up -d
```

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
