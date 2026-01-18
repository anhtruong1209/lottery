# PowerShell script to setup database (create migration and apply)

Write-Host "Setting up database..." -ForegroundColor Green
Write-Host ""

cd $PSScriptRoot\..

# Check if migrations folder exists
if (-not (Test-Path "Migrations")) {
    Write-Host "Creating initial migration..." -ForegroundColor Yellow
    dotnet ef migrations add InitialCreate
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to create migration!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ Migration created successfully!" -ForegroundColor Green
    Write-Host ""
}

# Apply migrations
Write-Host "Applying migrations to database..." -ForegroundColor Yellow
dotnet ef database update

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Database setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Database: Vishipel_Lottery" -ForegroundColor Cyan
    Write-Host "Tables created:" -ForegroundColor Cyan
    Write-Host "  - Participants" -ForegroundColor White
    Write-Host "  - Winners" -ForegroundColor White
    Write-Host "  - DrawConfigs" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✗ Database setup failed!" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. SQL Server is running" -ForegroundColor White
    Write-Host "  2. Connection string in appsettings.json is correct" -ForegroundColor White
    Write-Host "  3. You have permission to create database" -ForegroundColor White
    exit 1
}

