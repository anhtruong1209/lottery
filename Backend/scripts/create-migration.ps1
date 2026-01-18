# PowerShell script to create a new migration

param(
    [Parameter(Mandatory=$true)]
    [string]$MigrationName
)

Write-Host "Creating migration: $MigrationName" -ForegroundColor Green

cd $PSScriptRoot\..
dotnet ef migrations add $MigrationName

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Migration created successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Migration creation failed!" -ForegroundColor Red
    exit 1
}

