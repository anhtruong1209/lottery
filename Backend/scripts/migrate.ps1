# PowerShell script to run database migrations

Write-Host "Running database migrations..." -ForegroundColor Green

cd $PSScriptRoot\..
dotnet ef database update

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Migrations applied successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Migration failed!" -ForegroundColor Red
    exit 1
}

