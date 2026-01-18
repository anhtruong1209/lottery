# PowerShell script to seed sample data

Write-Host "Seeding sample data..." -ForegroundColor Green
Write-Host ""

$apiUrl = "http://localhost:3001/api/seeddata"

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -ContentType "application/json"
    
    Write-Host "✓ Seed dữ liệu thành công!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Thông tin:" -ForegroundColor Cyan
    Write-Host "  - Số người tham gia: $($response.participantsCount)" -ForegroundColor White
    Write-Host "  - Số phòng ban: $($response.departments)" -ForegroundColor White
    Write-Host ""
    Write-Host "Để xem thông tin chi tiết:" -ForegroundColor Yellow
    Write-Host "  GET http://localhost:3001/api/seeddata/info" -ForegroundColor White
    
} catch {
    Write-Host "✗ Lỗi khi seed dữ liệu!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Nguyen nhan co the:" -ForegroundColor Yellow
    Write-Host "  1. Backend chua chay - Chay: cd Backend; dotnet run" -ForegroundColor White
    Write-Host "  2. Database chua duoc tao - Chay: .\scripts\setup-database.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Chi tiết lỗi: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

