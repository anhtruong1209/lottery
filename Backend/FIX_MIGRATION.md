# Hướng dẫn sửa Migration

## Vấn đề

Migration hiện tại (`InitialCreate`) chưa có:
- `DrawConfigs.PrizeName` 
- `Winners.DrawConfigId`

## Giải pháp

### Bước 1: Dừng Backend đang chạy

Dừng process Backend đang chạy (Ctrl+C trong terminal chạy Backend)

### Bước 2: Xóa migration cũ và tạo lại

```powershell
cd Backend
dotnet ef migrations remove
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Bước 3: Hoặc tạo migration mới (nếu đã có data)

Nếu database đã có data, tạo migration mới:

```powershell
cd Backend
dotnet ef migrations add AddPrizeInfo
dotnet ef database update
```

## Seed Data

Sau khi migration xong, seed data:

```powershell
.\scripts\seed-data.ps1
```

Hoặc gọi API:
```
POST http://localhost:3001/api/seeddata
```

