# Hướng dẫn Chạy Development

## Yêu cầu

- Node.js 18+ (cho Frontend)
- .NET 8.0 SDK (cho Backend)
- SQL Server (LocalDB hoặc SQL Server)

## Cách chạy

### Bước 1: Chạy Backend (Terminal 1)

```bash
cd Backend
dotnet restore
dotnet run
```

Backend sẽ chạy tại:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:7000`
- Swagger: `http://localhost:5000/swagger` hoặc `https://localhost:7000/swagger`

⚠️ **Lưu ý**: Backend phải chạy trước khi chạy Frontend!

### Bước 2: Chạy Frontend (Terminal 2)

```bash
cd Frontend
npm install  # Chỉ cần chạy lần đầu
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

## Cấu hình

### Backend - Connection String

Mở `Backend/appsettings.json` và cập nhật connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=LotteryDb;..."
  }
}
```

### Frontend - API URL

Mặc định Frontend sẽ proxy đến `http://localhost:5000` (HTTP port của backend).

Nếu muốn thay đổi, tạo file `.env` trong thư mục `Frontend`:

```
VITE_API_URL=http://localhost:5000
```

## Troubleshooting

### Lỗi: `ECONNREFUSED` khi chạy Frontend

**Nguyên nhân**: Backend chưa chạy hoặc chạy sai port.

**Giải pháp**:
1. Đảm bảo Backend đang chạy (xem Terminal 1)
2. Kiểm tra Backend chạy ở port nào (xem console output)
3. Cập nhật `VITE_API_URL` trong `.env` nếu backend chạy port khác

### Lỗi: Database connection

**Nguyên nhân**: SQL Server chưa chạy hoặc connection string sai.

**Giải pháp**:
1. Kiểm tra SQL Server đang chạy
2. Kiểm tra connection string trong `appsettings.json`
3. Chạy migrations: `cd Backend && dotnet ef database update`

### Lỗi: Port đã được sử dụng

**Giải pháp**:
- Frontend (port 3000): Đổi trong `vite.config.ts`
- Backend (port 5000/7000): Đổi trong `Properties/launchSettings.json`

### Frontend không kết nối được API

1. Kiểm tra Backend đang chạy: Mở `http://localhost:5000/swagger`
2. Kiểm tra proxy config trong `vite.config.ts`
3. Xem console của Frontend để biết lỗi chi tiết

## Workflow Development

1. **Khởi động Backend** → Chờ cho đến khi thấy "Now listening on..."
2. **Khởi động Frontend** → Tự động kết nối đến Backend
3. **Code và test** → Cả hai sẽ tự động reload khi có thay đổi

## Scripts tiện lợi

### Build Frontend và copy vào Backend

```bash
cd Frontend
npm run build:copy
```

### Tạo Migration mới

```bash
cd Backend
dotnet ef migrations add <MigrationName>
```

### Apply Migrations

```bash
cd Backend
dotnet ef database update
```

