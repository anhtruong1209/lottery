# Hướng dẫn Test Seed Data

## Bước 1: Đảm bảo Backend đang chạy

Backend phải chạy tại: `http://localhost:3001`

## Bước 2: Seed Data

### Cách 1: Dùng Swagger (Dễ nhất)

1. Mở: `http://localhost:3001/swagger`
2. Tìm endpoint: `POST /api/seeddata`
3. Click "Try it out"
4. Click "Execute"
5. Xem kết quả trong "Response body"

**Kết quả mong đợi:**
```json
{
  "message": "Đã seed dữ liệu mẫu thành công!",
  "participants": {
    "created": 150,
    "inDatabase": 150,
    "status": "✓ Thành công"
  },
  "drawConfigs": {
    "created": 7,
    "inDatabase": 7,
    "status": "✓ Thành công"
  },
  "departmentsCount": 10
}
```

### Cách 2: Dùng PowerShell Script

```powershell
cd Backend
.\scripts\seed-data.ps1
```

### Cách 3: Dùng curl/Postman

```bash
POST http://localhost:3001/api/seeddata
Content-Type: application/json
```

## Bước 3: Kiểm tra dữ liệu đã seed

### Xem thông tin tổng quan

```
GET http://localhost:3001/api/seeddata/info
```

Hoặc trong Swagger: `GET /api/seeddata/info`

### Kiểm tra Participants

```
GET http://localhost:3001/api/participants
```

### Kiểm tra DrawConfigs

```
GET http://localhost:3001/api/drawconfigs
```

## Nếu seed không thành công

### Lỗi: Database connection

- Kiểm tra SQL Server đang chạy
- Kiểm tra connection string trong `appsettings.json`
- Xem logs trong terminal Backend

### Lỗi: Migration chưa chạy

```powershell
cd Backend
# Dừng Backend trước (Ctrl+C)
dotnet ef database update
# Chạy lại Backend
dotnet run
```

### Seed lại nhiều lần

Có thể chạy seed nhiều lần, nó sẽ xóa dữ liệu cũ và tạo mới mỗi lần.

