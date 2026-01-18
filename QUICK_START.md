# 🚀 Quick Start Guide

## Cấu hình Ports

- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:3001`

## Bước 1: Setup Database

### Cách 1: Tự động (Khuyến nghị)

```powershell
cd Backend
.\scripts\setup-database.ps1
```

### Cách 2: Thủ công

```powershell
cd Backend

# Tạo migration (nếu chưa có)
dotnet ef migrations add InitialCreate

# Apply migration
dotnet ef database update
```

**Lưu ý**: Đảm bảo connection string trong `Backend/appsettings.json` đúng:
- Database name: `Vishipel_Lottery`
- Server: `10.0.0.50,1434`

## Bước 2: Chạy Backend

```powershell
cd Backend
dotnet run
```

Backend sẽ chạy tại: `http://localhost:3001`
- Swagger: `http://localhost:3001/swagger`

## Bước 3: Seed dữ liệu mẫu (Tùy chọn)

```powershell
cd Backend
.\scripts\seed-data.ps1
```

Hoặc gọi API trực tiếp:
- POST `http://localhost:3001/api/seeddata`
- GET `http://localhost:3001/api/seeddata/info` (xem thông tin)

Script sẽ tạo:
- 150 người tham gia với tên và phòng ban ngẫu nhiên
- 4 cấu hình giải thưởng mẫu (1, 5, 10, 20 giải)

## Bước 4: Chạy Frontend

```powershell
cd Frontend
npm install  # Chỉ cần chạy lần đầu
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

## Kiểm tra

1. Mở browser: `http://localhost:3000`
2. Kiểm tra Backend: `http://localhost:3001/swagger`
3. Kiểm tra console không có lỗi

## Troubleshooting

### Database chưa tạo

```powershell
cd Backend
.\scripts\setup-database.ps1
```

### Frontend gọi API liên tục

- Kiểm tra Backend đang chạy
- Kiểm tra không có lỗi trong console
- Restart Frontend: `Ctrl+C` rồi `npm run dev` lại

### Lỗi kết nối SQL Server

Xem file `Backend/CONNECTION_TROUBLESHOOTING.md`

