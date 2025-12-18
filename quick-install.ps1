<#
.SYNOPSIS
    Quick install script for Next PPDB.
    Downloads necessary Docker files and starts the application.
.DESCRIPTION
    This script downloads the minimum files needed to run Next PPDB:
    - docker-compose.yml
    - .env.example (for reference)
    - docker/mysql-init/01-grant-privileges.sh (MySQL init script)

    If no .env file exists, it will interactively prompt for configuration
    with sensible defaults.
#>

$ErrorActionPreference = "Stop"
$repoBaseUrl = "https://raw.githubusercontent.com/robin-collins/next-ppdb/main"
$AppVersion = "1.0.1"  # Default version - update as needed

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

# Function to generate a random password
function New-RandomPassword {
    param ([int]$Length = 24)
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    -join (1..$Length | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
}

# Function to generate a hex key (for API keys)
function New-HexKey {
    param ([int]$Bytes = 32)
    -join (1..$Bytes | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
}

# Function to prompt with default value
function Read-HostWithDefault {
    param (
        [string]$Prompt,
        [string]$Default
    )
    $displayDefault = if ($Default) { " [$Default]" } else { "" }
    $input = Read-Host "$Prompt$displayDefault"
    if ([string]::IsNullOrWhiteSpace($input)) { $Default } else { $input }
}

Write-Host "Starting Next PPDB Quick Install..."

# 1. Download necessary files
Download-File -RemotePath "docker-compose.yml" -LocalPath "docker-compose.yml"
Download-File -RemotePath ".env.example" -LocalPath ".env.example"
Download-File -RemotePath "docker/mysql-init/01-grant-privileges.sh" -LocalPath "docker/mysql-init/01-grant-privileges.sh"

function Load-DotEnvFile ($Path = ".env") {
    if (-not (Test-Path $Path)) {
        Write-Error "Error: .env file not found at $Path"
        return
    }
    
    Write-Host "Loading environment variables from $Path..."

    $envContent = Get-Content -Path $Path

    foreach ($line in $envContent) {
        $trimmedLine = $line.Trim()
        
        # Skip empty lines or lines starting with a comment character (#)
        if (-not ([string]::IsNullOrEmpty($trimmedLine)) -and -not ($trimmedLine.StartsWith("#"))) {
            $parts = $trimmedLine.Split("=", 2)
            
            if ($parts.Length -eq 2) {
                $key = $parts[0].Trim()
                $rawValue = $parts[1].Trim()

                # Robustly remove leading/trailing single or double quotes
                $value = $rawValue.Trim("""'""") 

                # Set the environment variable in the current session scope
                # Using the Env: provider is standard practice
                Set-Item -Path Env:$key -Value $value
                Write-Host "Set $key" -ForegroundColor Green
            }
        }
    }
}

# 2. Setup .env - Interactive configuration if .env doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "`n" -NoNewline
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Environment Configuration Setup" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "No .env file found. Let's configure your environment."
    Write-Host "Press Enter to accept the default values shown in [brackets].`n"

    # Generate secure defaults
    $defaultRootPass = New-RandomPassword -Length 24
    $defaultUserPass = New-RandomPassword -Length 24
    $defaultSchedulerKey = New-HexKey -Bytes 32

    # Required Configuration
    Write-Host "--- Required Settings ---" -ForegroundColor Yellow
    $domainName = Read-HostWithDefault -Prompt "Domain name (e.g., example.com)" -Default ""
    while ([string]::IsNullOrWhiteSpace($domainName)) {
        Write-Host "Domain name is required!" -ForegroundColor Red
        $domainName = Read-Host "Domain name"
    }

    $acmeEmail = Read-HostWithDefault -Prompt "Email for SSL certificates" -Default "admin@$domainName"
    $timezone = Read-HostWithDefault -Prompt "Timezone" -Default "Australia/Sydney"

    # MySQL Configuration
    Write-Host "`n--- MySQL Configuration ---" -ForegroundColor Yellow
    $mysqlRootPass = Read-HostWithDefault -Prompt "MySQL root password" -Default $defaultRootPass
    $mysqlDatabase = Read-HostWithDefault -Prompt "MySQL database name" -Default "ppdb-app"
    $mysqlUser = Read-HostWithDefault -Prompt "MySQL username" -Default "ppdb-user"
    $mysqlUserPass = Read-HostWithDefault -Prompt "MySQL user password" -Default $defaultUserPass

    # Scheduler Configuration
    Write-Host "`n--- Scheduler Configuration ---" -ForegroundColor Yellow
    $schedulerKey = Read-HostWithDefault -Prompt "Scheduler API key" -Default $defaultSchedulerKey

    # Optional SMTP Configuration
    Write-Host "`n--- Email Notifications (Optional) ---" -ForegroundColor Yellow
    $configureSmtp = Read-HostWithDefault -Prompt "Configure SMTP for email notifications? (y/n)" -Default "n"

    if ($configureSmtp -eq "y" -or $configureSmtp -eq "Y") {
        $smtpHost = Read-HostWithDefault -Prompt "SMTP host" -Default "smtp.example.com"
        $smtpPort = Read-HostWithDefault -Prompt "SMTP port" -Default "587"
        $smtpUser = Read-HostWithDefault -Prompt "SMTP username" -Default ""
        $smtpPass = Read-HostWithDefault -Prompt "SMTP password" -Default ""
        $smtpFrom = Read-HostWithDefault -Prompt "SMTP from address" -Default "notifications@$domainName"
        $notifyEmail = Read-HostWithDefault -Prompt "User notification email (updates/success)" -Default "admin@$domainName"
        $devNotifyEmail = Read-HostWithDefault -Prompt "Developer notification email (failures/rollbacks)" -Default $notifyEmail
    } else {
        $smtpHost = ""; $smtpPort = "587"; $smtpUser = ""; $smtpPass = ""
        $smtpFrom = ""; $notifyEmail = ""; $devNotifyEmail = ""
    }

    # Optional GitHub Configuration
    Write-Host "`n--- GitHub/GHCR Configuration (Optional) ---" -ForegroundColor Yellow
    $configureGhcr = Read-HostWithDefault -Prompt "Configure GitHub for version checks? (y/n)" -Default "n"

    if ($configureGhcr -eq "y" -or $configureGhcr -eq "Y") {
        $ghcrToken = Read-HostWithDefault -Prompt "GitHub PAT (read:packages scope)" -Default ""
    } else {
        $ghcrToken = ""
    }

    # Write .env file
    Write-Host "`nWriting .env file..." -ForegroundColor Green
    $envContent = @"
# ==========================================
# Docker Compose Configuration
# Generated by quick-install.ps1
# ==========================================

# MySQL Configuration
MYSQL_ROOT_PASSWORD=$mysqlRootPass
MYSQL_DATABASE=$mysqlDatabase
MYSQL_USER=$mysqlUser
MYSQL_PASSWORD=$mysqlUserPass
MYSQL_HOST=mysql
MYSQL_PORT=3306

# Traefik / Let's Encrypt Configuration
DOMAIN_NAME=$domainName
ACME_EMAIL=$acmeEmail

# VALKEY SETTINGS
Valkey_HOST=valkey
Valkey_PORT=6379

# ==========================================
# Next.js / Prisma Configuration
# ==========================================

NEXT_PUBLIC_API_URL=https://next-ppdb.$domainName
NODE_ENV=production
DATABASE_URL="mysql://`${MYSQL_USER}:`${MYSQL_PASSWORD}@`${MYSQL_HOST}:`${MYSQL_PORT}/`${MYSQL_DATABASE}"
DEBUG=false

# ==========================================
# Scheduler Configuration
# ==========================================

APP_VERSION=$AppVersion
SCHEDULER_API_KEY=$schedulerKey
TZ=$timezone

# ==========================================
# Email Notifications (SMTP)
# ==========================================

SMTP_HOST=$smtpHost
SMTP_PORT=$smtpPort
SMTP_USER=$smtpUser
SMTP_PASS=$smtpPass
SMTP_FROM=$smtpFrom
UPDATE_NOTIFICATION_EMAIL=$notifyEmail
BACKUP_NOTIFICATION_EMAIL=$notifyEmail
DEVELOPER_NOTIFICATION_EMAIL=$devNotifyEmail

# ==========================================
# GHCR / GitHub Configuration
# ==========================================

GHCR_TOKEN=$ghcrToken
GHCR_REPOSITORY=robin-collins/next-ppdb
GITHUB_TOKEN=$ghcrToken
"@

    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host ".env file created successfully!" -ForegroundColor Green
    $startApp = $True
} else {
    Write-Host ".env already exists, skipping configuration."
    $startApp = $True
}

# Load the .env values to use in the pwsh script
Load-DotEnvFile -Path ".env"


# 3. Check for Docker
if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not in the PATH. Please install Docker Desktop."
    exit 1
}

# 4. Check for and create Docker network 'web' if it doesn't exist
Write-Host "Checking for Docker network 'web'..."
$networkExists = (docker network ls --format "{{.Name}}" | Select-String -Pattern "^web$" -Quiet)

if (-not $networkExists) {
    Write-Host "Docker network 'web' not found. Creating it..."
    try {
        docker network create web | Out-Null
        Write-Host "Docker network 'web' created successfully."
    }
    catch {
        Write-Error "Failed to create Docker network 'web'. Error: $_"
        exit 1
    }
} else {
    Write-Host "Docker network 'web' already exists. Skipping creation."
}

# 5. Authenticate with GHCR if token is provided
if (-not [string]::IsNullOrWhiteSpace($env:GHCR_TOKEN)) {
    Write-Host "Authenticating with GitHub Container Registry..."
    # Pipe the token to docker login --password-stdin
    $env:GHCR_TOKEN | docker login ghcr.io -u robin-collins --password-stdin
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "GHCR authentication failed. Initial image pull might fail if images are private or rate-limited."
    } else {
        Write-Host "GHCR authentication successful." -ForegroundColor Green
    }
}

# 6. Start Docker Compose
Write-Host "`nStarting application with Docker Compose..."
docker compose up -d

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your services will be available at:" -ForegroundColor Cyan
Write-Host "  App:        https://next-ppdb.$env:DOMAIN_NAME"
Write-Host "  Database:   https://db.$env:DOMAIN_NAME"
Write-Host "  Traefik:    https://traefik.$env:DOMAIN_NAME"
Write-Host ""
Write-Host "Note: Services may take 1-2 minutes to start up fully."
Write-Host "Use 'docker compose logs -f' to watch startup progress."
Write-Host ""
