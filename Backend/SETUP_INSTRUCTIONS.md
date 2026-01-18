# Hướng dẫn Setup và Seed Data

## ⚠️ QUAN TRỌNG: Dừng Backend trước khi chạy migration

Backend đang chạy sẽ lock file .exe, không thể build được.

## Bước 1: Dừng Backend

Trong terminal đang chạy Backend, nhấn `Ctrl+C` để dừng.

## Bước 2: Chạy Migration

```powershell
cd Backend
dotnet ef database update
```

## Bước 3: Chạy lại Backend

```powershell
dotnet run
```

Backend sẽ chạy tại: `http://localhost:3001`

## Bước 4: Seed Data

### Cách 1: Dùng Script (Sau khi Backend đã chạy)

```powershell
.\scripts\seed-data.ps1
```

### Cách 2: Dùng Swagger

1. Mở `http://localhost:3001/swagger`
2. Tìm `POST /api/seeddata`
3. Click "Try it out" → "Execute"

### Cách 3: Dùng Postman/curl

```bash
POST http://localhost:3001/api/seeddata
```

## Kiểm tra

Kiểm tra seed đã thành công:

```bash
GET http://localhost:3001/api/seeddata/info
```

Hoặc trong Swagger: `GET /api/seeddata/info`

## Dữ liệu sẽ được tạo

- **150 người tham gia** với tên và phòng ban ngẫu nhiên
- **7 cấu hình giải thưởng**:
  1. Giải An khang (80 giải) - Tai nghe bluetooth, sấy tóc
  2. Giải Thịnh Vượng (30 giải) - Tăm nước, bàn chải điện
  3. Giải con Ngựa (1 giải) - Tivi 55 inches
  4. Giải con Rắn (1 giải) - Robot lau nhà
  5. Giải con Mùi, Thân (2 giải) - Nồi chiên không dầu, quạt, máy lọc không khí
  6. Giải con Gà, Tuất (2 giải) - Nồi chiên không dầu, quạt, máy lọc không khí
  7. Giải Hợi, Tý, Sửu, Dần, Mẹo, Thìn (6 giải) - Bếp lẩu, bếp hồng ngoại, massage cổ

## Lưu ý

- Seed data sẽ **XÓA** tất cả Participants và Winners hiện có
- DrawConfigs sẽ được tạo lại hoàn toàn mới
- Có thể seed lại nhiều lần bằng cách chạy lại script/API

