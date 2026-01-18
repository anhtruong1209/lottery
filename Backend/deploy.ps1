# Deploy script for VISHIPEL Lottery App
# Run this from Backend directory

param(
    [string]$ServerPath = "\\demo.vishipel.net\C$\inetpub\wwwroot\vsp_lottery",
    [string]$AppPoolName = "vsp_lottery"
)

Write-Host "=== VISHIPEL Lottery Deployment Script ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build and Publish
Write-Host "[1/5] Building and publishing..." -ForegroundColor Yellow
dotnet publish -c Release -o bin\Release\net8.0\publish
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build successful" -ForegroundColor Green
Write-Host ""

# Step 2: Stop IIS App Pool (if remote access available)
Write-Host "[2/5] Stopping IIS Application Pool..." -ForegroundColor Yellow
try {
    Invoke-Command -ComputerName demo.vishipel.net -ScriptBlock {
        param($poolName)
        Import-Module WebAdministration
        Stop-WebAppPool -Name $poolName
        Start-Sleep -Seconds 2
    } -ArgumentList $AppPoolName -ErrorAction Stop
    Write-Host "✓ App Pool stopped" -ForegroundColor Green
} catch {
    Write-Host "⚠ Could not stop app pool remotely. Please stop manually in IIS Manager." -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Copy files
Write-Host "[3/5] Copying files to server..." -ForegroundColor Yellow
$source = "bin\Release\net8.0\publish\*"
if (Test-Path $ServerPath) {
    Copy-Item -Path $source -Destination $ServerPath -Recurse -Force
    Write-Host "✓ Files copied successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Server path not accessible: $ServerPath" -ForegroundColor Red
    Write-Host "Please copy files manually from: bin\Release\net8.0\publish\" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Create logs folder
Write-Host "[4/5] Creating logs folder..." -ForegroundColor Yellow
$logsPath = Join-Path $ServerPath "logs"
if (Test-Path $ServerPath) {
    if (-not (Test-Path $logsPath)) {
        New-Item -Path $logsPath -ItemType Directory -Force | Out-Null
        Write-Host "✓ Logs folder created" -ForegroundColor Green
    } else {
        Write-Host "✓ Logs folder already exists" -ForegroundColor Green
    }
}
Write-Host ""

# Step 5: Start IIS App Pool
Write-Host "[5/5] Starting IIS Application Pool..." -ForegroundColor Yellow
try {
    Invoke-Command -ComputerName demo.vishipel.net -ScriptBlock {
        param($poolName)
        Import-Module WebAdministration
        Start-WebAppPool -Name $poolName
    } -ArgumentList $AppPoolName -ErrorAction Stop
    Write-Host "✓ App Pool started" -ForegroundColor Green
} catch {
    Write-Host "⚠ Could not start app pool remotely. Please start manually in IIS Manager." -ForegroundColor Yellow
}
Write-Host ""

Write-Host "=== Deployment Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open browser: http://demo.vishipel.net:8077" -ForegroundColor White
Write-Host "2. Hard refresh: Ctrl + Shift + R" -ForegroundColor White
Write-Host "3. Check logs if errors: $ServerPath\logs\stdout_*.log" -ForegroundColor White
Write-Host ""
Write-Host "Database migration (if needed):" -ForegroundColor Yellow
Write-Host 'dotnet ef database update --connection "Server=10.0.0.50,1434;Database=Vishipel_Lottery;User ID=thunghiem2;Password=thunghiem4416;TrustServerCertificate=True;"' -ForegroundColor White
