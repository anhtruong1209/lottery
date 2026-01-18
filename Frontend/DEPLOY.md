# Hướng dẫn Deploy ứng dụng Quay thưởng VISHIPEL

## Cấu trúc Project

```
quaythuong-vishipel/
├── Backend/              # .NET 8 Web API
│   ├── Controllers/      # API Controllers
│   ├── Data/            # DbContext
│   ├── Models/          # Database Models
│   ├── wwwroot/         # Frontend build files (sẽ được copy vào đây)
│   └── Backend.csproj
├── components/          # React Components
├── utils/               # Utilities & API Service
├── public/              # Static files (img.png)
└── scripts/             # Build scripts
```

## Các bước Build và Deploy

### Bước 1: Cấu hình Database

1. Mở `Backend/appsettings.json`
2. Cập nhật connection string cho SQL Server:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=LotteryDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

**Ví dụ:**
- LocalDB: `Server=(localdb)\\mssqllocaldb;Database=LotteryDb;Trusted_Connection=True;MultipleActiveResultSets=true`
- SQL Server: `Server=localhost;Database=LotteryDb;User Id=sa;Password=YourPassword;TrustServerCertificate=True`

### Bước 2: Build Frontend và Copy sang wwwroot

Chạy lệnh sau để build frontend và tự động copy vào `Backend/wwwroot`:

```bash
npm run build:copy
```

Hoặc build thủ công:
```bash
npm run build
# Sau đó copy thủ công thư mục dist/* vào Backend/wwwroot/
```

### Bước 3: Build Backend

```bash
cd Backend
dotnet restore
dotnet publish -c Release -o ./publish
```

### Bước 4: Deploy lên IIS

1. **Tạo Website mới trong IIS Manager:**
   - Site name: `QuayThuongVishipel`
   - Physical path: Trỏ đến thư mục `Backend/publish`
   - Port: `8061` (hoặc port bạn muốn)
   - Host name: `demo.vishipel.net` (hoặc để trống)

2. **Cấu hình Application Pool:**
   - .NET CLR Version: `No Managed Code`
   - Managed Pipeline Mode: `Integrated`

3. **Kiểm tra quyền:**
   - Đảm bảo IIS_IUSRS có quyền Read & Execute trên thư mục publish

4. **Test:**
   - Truy cập: `http://demo.vishipel.net:8061`
   - Kiểm tra API: `http://demo.vishipel.net:8061/api/participants`
   - Swagger: `http://demo.vishipel.net:8061/swagger` (nếu Development)

## Workflow Development

### Chạy Frontend riêng (Development):

```bash
npm run dev
# Frontend chạy tại http://localhost:3000
# Sẽ proxy API requests đến backend
```

### Chạy Backend riêng (Development):

```bash
cd Backend
dotnet run
# Backend chạy tại https://localhost:7000
```

### Chạy cả hai cùng lúc:

1. Terminal 1: `npm run dev` (Frontend)
2. Terminal 2: `cd Backend && dotnet run` (Backend)

## Cấu hình môi trường

Tạo file `.env` ở thư mục gốc (nếu muốn override API URL):

```
VITE_API_URL=https://localhost:7000/api
```

Khi deploy lên IIS, frontend sẽ tự động sử dụng cùng origin (relative path `/api`).

## Database Migration

Database sẽ tự động được tạo khi chạy lần đầu. Nếu muốn tạo migration thủ công:

```bash
cd Backend
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## Troubleshooting

### Frontend không kết nối được API

1. Kiểm tra CORS trong `Backend/Program.cs`
2. Kiểm tra connection string trong `appsettings.json`
3. Kiểm tra firewall cho port backend

### Database connection error

1. Kiểm tra SQL Server đang chạy
2. Kiểm tra connection string đúng format
3. Kiểm tra quyền truy cập database

### IIS 404 khi refresh page

Đảm bảo file `web.config` có trong thư mục `Backend/publish` (đã được copy tự động).

### QR Code không đúng URL

QR Code tự động sử dụng `window.location.origin`, sẽ tự động đúng với URL deploy.

## Quick Deploy Script

Tạo file `deploy.ps1`:

```powershell
# Build Frontend
Write-Host "Building frontend..." -ForegroundColor Green
npm run build:copy

# Build Backend
Write-Host "Building backend..." -ForegroundColor Green
cd Backend
dotnet publish -c Release -o ./publish
cd ..

Write-Host "Deploy completed! Copy Backend/publish to IIS folder." -ForegroundColor Green
```

Chạy: `.\deploy.ps1`

