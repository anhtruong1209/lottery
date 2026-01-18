# Hướng dẫn Seed Dữ liệu Mẫu

## Cách 1: Sử dụng Script PowerShell (Khuyến nghị)

```powershell
cd Backend
.\scripts\seed-data.ps1
```

## Cách 2: Sử dụng API Endpoint

### Seed dữ liệu:
```bash
POST http://localhost:3001/api/seeddata
```

### Xem thông tin dữ liệu:
```bash
GET http://localhost:3001/api/seeddata/info
```

## Cách 3: Sử dụng Swagger

1. Mở `http://localhost:3001/swagger`
2. Tìm endpoint `POST /api/seeddata`
3. Click "Try it out" → "Execute"

## Dữ liệu được tạo

### Participants (150 người)
- Tên: Ngẫu nhiên từ danh sách họ tên Việt Nam
- Phòng ban: CNTT, Kế Toán, Nhân sự, Kinh doanh, Vận hành, Ban Giám Đốc, Marketing, Sản xuất, Chất lượng, Kho vận

### DrawConfigs (4 cấu hình)
- 1 Giải
- 5 Giải  
- 10 Giải
- 20 Giải

## Lưu ý

⚠️ **Seed data sẽ XÓA toàn bộ dữ liệu hiện có** (Participants và Winners) và tạo dữ liệu mới.

Nếu muốn seed lại, chỉ cần chạy lại script hoặc gọi API.

