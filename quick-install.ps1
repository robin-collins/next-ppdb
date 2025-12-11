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

# --- Usage Example ---

# 2. Setup .env Logic (from your original snippet)
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env from .env.example..."
    Copy-Item ".env.example" ".env"
    Write-Host "WARNING: Using default credentials from .env.example. Please review .env before production use." -ForegroundColor Yellow
    $startApp  = $False
} else {
    Write-Host ".env already exists, skipping creation."
    $startApp = $True
}

# Load the .env values to use in the pwsh script
if ($startApp) {
    # Call the function defined above to perform the loading logic
    Load-DotEnvFile -Path ".env"
}


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

# 4.1 Start Docker Compose
if (-not $startApp) {
    Write-Host "Skipping application start. Update the values of the .env file."
} else {
    Write-Host "Starting application with Docker Compose..."
    docker compose up -d
}

Write-Host "`nInstallation Complete!" -ForegroundColor Green
Write-Host "App should be available at $env:NEXT_PUBLIC_API_URL (wait a moment for startup)"
