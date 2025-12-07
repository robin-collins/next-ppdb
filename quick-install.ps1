<#
.SYNOPSIS
    Quick install script for Next PPDB.
    Downloads necessary Docker files and starts the application.
.DESCRIPTION
    This script downloads docker-compose.yml, .env.example, and the MySQL init script
    from the GitHub repository, sets up the environment, and runs docker compose up.
#>

$ErrorActionPreference = "Stop"
$repoBaseUrl = "https://raw.githubusercontent.com/robin-collins/next-ppdb/main"

# Function to download a file
function Download-File {
    param (
        [string]$RemotePath,
        [string]$LocalPath
    )
    $url = "$repoBaseUrl/$RemotePath"
    Write-Host "Downloading $LocalPath from $url..."
    
    $dir = Split-Path $LocalPath
    if ($dir -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $LocalPath
    }
    catch {
        Write-Error "Failed to download $url. Error: $_"
        exit 1
    }
}

Write-Host "Starting Next PPDB Quick Install..."

# 1. Download necessary files
Download-File -RemotePath "docker-compose.yml" -LocalPath "docker-compose.yml"
Download-File -RemotePath ".env.example" -LocalPath ".env.example"
Download-File -RemotePath "docker/mysql-init/01-grant-privileges.sh" -LocalPath "docker/mysql-init/01-grant-privileges.sh"

# 2. Setup .env
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env from .env.example..."
    Copy-Item ".env.example" ".env"
    Write-Host "WARNING: Using default credentials from .env.example. Please review .env before production use." -ForegroundColor Yellow
} else {
    Write-Host ".env already exists, skipping creation."
}

# 3. Check for Docker
if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not in the PATH. Please install Docker Desktop."
    exit 1
}

# 4. Start Docker Compose
Write-Host "Starting application with Docker Compose..."
docker compose up -d

Write-Host "`nInstallation Complete!" -ForegroundColor Green
Write-Host "App should be available at https://next-ppdb.thepamperedpooch.com.au (wait a moment for startup)"
