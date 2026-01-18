# Backend API - Lottery System

Backend .NET 8.0 Web API với SQL Server cho hệ thống quay thưởng VISHIPEL.

## Yêu cầu

- .NET 8.0 SDK
- SQL Server (LocalDB hoặc SQL Server Express/Full)

## Cấu hình

1. Mở `appsettings.json` và cập nhật connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=LotteryDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

### Ví dụ connection strings:

- **LocalDB**: `Server=(localdb)\\mssqllocaldb;Database=LotteryDb;Trusted_Connection=True;MultipleActiveResultSets=true`
- **SQL Server**: `Server=localhost;Database=LotteryDb;User Id=sa;Password=YourPassword;TrustServerCertificate=True`
- **SQL Server Express**: `Server=.\\SQLEXPRESS;Database=LotteryDb;Trusted_Connection=True;MultipleActiveResultSets=true`

## Database Migration

### Lần đầu tiên - Tạo Migration ban đầu

```bash
cd Backend
dotnet ef migrations add InitialCreate
```

### Áp dụng Migration

Migrations sẽ tự động được áp dụng khi chạy ứng dụng. Hoặc chạy thủ công:

```bash
cd Backend
dotnet ef database update
```

Hoặc sử dụng script PowerShell:

```powershell
.\scripts\migrate.ps1
```

### Tạo Migration mới

Khi thay đổi Models, tạo migration mới:

```bash
dotnet ef migrations add <MigrationName>
```

Hoặc sử dụng script:

```powershell
.\scripts\create-migration.ps1 -MigrationName "AddNewColumn"
```

Xem chi tiết tại [Migrations/README.md](./Migrations/README.md)

## Chạy ứng dụng

```bash
cd Backend
dotnet restore
dotnet run
```

API sẽ chạy tại: `https://localhost:7000` (hoặc port được cấu hình)

## Swagger

Khi chạy ở môi trường Development, truy cập Swagger UI tại:
- `https://localhost:7000/swagger`

## API Endpoints

### Participants
- `GET /api/participants` - Lấy danh sách người tham gia
- `GET /api/participants/{id}` - Lấy thông tin người tham gia theo ID
- `POST /api/participants` - Tạo người tham gia mới
- `PUT /api/participants/{id}` - Cập nhật người tham gia
- `DELETE /api/participants/{id}` - Xóa người tham gia
- `DELETE /api/participants` - Xóa tất cả người tham gia

### Winners
- `GET /api/winners` - Lấy danh sách người trúng thưởng
- `POST /api/winners` - Tạo danh sách người trúng thưởng
- `DELETE /api/winners` - Xóa tất cả người trúng thưởng

### DrawConfigs
- `GET /api/drawconfigs` - Lấy cấu hình giải thưởng
- `POST /api/drawconfigs` - Tạo cấu hình mới
- `PUT /api/drawconfigs/{id}` - Cập nhật cấu hình
- `DELETE /api/drawconfigs/{id}` - Xóa cấu hình

## Deploy lên IIS

1. Build project:
```bash
dotnet publish -c Release -o ./publish
```

2. Copy thư mục `publish` vào thư mục website IIS

3. Đảm bảo file `web.config` có trong thư mục publish (đã được tạo tự động)

4. Cấu hình IIS Application Pool:
   - .NET CLR Version: `No Managed Code` (vì đây là .NET 8)
   - Managed Pipeline Mode: `Integrated`

5. Chạy migrations trên server:
```bash
dotnet ef database update
```
Hoặc đảm bảo connection string đúng và migrations sẽ tự động chạy khi app khởi động.

## CORS

Backend đã được cấu hình CORS để cho phép tất cả origins. Trong production, nên hạn chế theo domain cụ thể.
