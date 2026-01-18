# Hướng dẫn Setup Database lần đầu

## Bước 1: Cấu hình Connection String

Mở file `appsettings.json` và cập nhật connection string phù hợp với SQL Server của bạn:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=LotteryDb;User ID=USER;Password=PASSWORD;TrustServerCertificate=True;"
  }
}
```

## Bước 2: Tạo Migration ban đầu

Chạy lệnh sau để tạo migration đầu tiên:

```bash
cd Backend
dotnet ef migrations add InitialCreate
```

Lệnh này sẽ tạo các file migration trong thư mục `Migrations/`:
- `[timestamp]_InitialCreate.cs` - Migration file
- `LotteryDbContextModelSnapshot.cs` - Model snapshot

## Bước 3: Áp dụng Migration vào Database

### Cách 1: Tự động (khuyến nghị)
Khi bạn chạy ứng dụng, migrations sẽ tự động được áp dụng (xem `Program.cs`).

```bash
dotnet run
```

### Cách 2: Thủ công
Chạy lệnh sau để apply migrations:

```bash
dotnet ef database update
```

Hoặc sử dụng script PowerShell:

```powershell
.\scripts\migrate.ps1
```

## Kiểm tra

Sau khi migration thành công, kiểm tra database có các bảng sau:
- `Participants` - Danh sách người tham gia
- `Winners` - Danh sách người trúng thưởng  
- `DrawConfigs` - Cấu hình giải thưởng
- `__EFMigrationsHistory` - Lịch sử migrations

## Xử lý lỗi

### Lỗi: "Unable to create an object of type 'LotteryDbContext'"
Đảm bảo bạn đã cài đặt package:
```bash
dotnet add package Microsoft.EntityFrameworkCore.Design
```

### Lỗi connection
- Kiểm tra SQL Server đang chạy
- Kiểm tra connection string đúng format
- Kiểm tra username/password có quyền tạo database

### Migration đã tồn tại
Nếu migration `InitialCreate` đã tồn tại và muốn tạo lại:
```bash
dotnet ef migrations remove
dotnet ef migrations add InitialCreate
```

## Lưu ý quan trọng

⚠️ **Trên Production**: 
- Luôn backup database trước khi chạy migrations
- Test migrations trên staging trước
- Xem xét việc tắt auto-migration và chạy thủ công

