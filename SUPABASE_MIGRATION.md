# Hướng Dẫn Migration sang Supabase

## 📋 Tổng Quan

Hướng dẫn này sẽ giúp bạn migrate dự án Vishipel Lottery từ SQL Server sang Supabase (PostgreSQL).

## 🔧 Bước 1: Cài Đặt Packages

### Backend (ASP.NET Core)

Mở terminal trong thư mục `Backend` và chạy:

```powershell
# Gỡ SQL Server package (nếu có)
dotnet remove package Microsoft.EntityFrameworkCore.SqlServer

# Cài PostgreSQL package
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 8.0.0
```

### Frontend (React + Vite)

Mở terminal trong thư mục `Frontend` và chạy:

```powershell
# Cài Supabase client
npm install @supabase/supabase-js
```

## 🗄️ Bước 2: Tạo Database trên Supabase

### 2.1. Truy cập Supabase SQL Editor

1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn: `epaymegrarddyuipbbhy`
3. Vào **SQL Editor** từ menu bên trái
4. Click **New Query**

### 2.2. Chạy Migration Script

1. Mở file `Backend/Data/supabase_migration.sql`
2. Copy toàn bộ nội dung
3. Paste vào SQL Editor trên Supabase
4. Click **Run** hoặc nhấn `Ctrl + Enter`

### 2.3. Xác Nhận Migration Thành Công

Chạy query sau để kiểm tra:

```sql
-- Kiểm tra tất cả tables đã được tạo
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Kiểm tra seed data
SELECT * FROM draw_configs ORDER BY display_order;
```

Bạn sẽ thấy 5 tables: `check_ins`, `draw_configs`, `participants`, `users`, `winners`

## 🔑 Bước 3: Lấy Database Password

### 3.1. Tìm Database Password

1. Trong Supabase Dashboard, vào **Settings** → **Database**
2. Scroll xuống phần **Connection string**
3. Click **Show** để hiển thị password
4. Copy password này

### 3.2. Cập Nhật Connection String

Mở file `Backend/appsettings.json` và thay thế `YOUR_SUPABASE_PASSWORD` bằng password vừa copy:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.epaymegrarddyuipbbhy.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=YOUR_ACTUAL_PASSWORD_HERE;SSL Mode=Require;Trust Server Certificate=true;"
  }
}
```

**⚠️ LƯU Ý BẢO MẬT:**
- Không commit password vào Git
- Nên dùng User Secrets hoặc Environment Variables cho production

## 🔄 Bước 4: Cập Nhật Program.cs (Backend)

Mở file `Backend/Program.cs` và tìm dòng config database. Thay đổi từ:

```csharp
// SQL Server (CŨ)
builder.Services.AddDbContext<LotteryDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
```

Thành:

```csharp
// PostgreSQL (MỚI)
builder.Services.AddDbContext<LotteryDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
```

## ✅ Bước 5: Test Kết Nối

### 5.1. Test Backend

```powershell
cd Backend
dotnet build
dotnet run
```

Kiểm tra console log, bạn sẽ thấy:
- ✅ Kết nối database thành công
- ✅ Không có lỗi migration

### 5.2. Test Frontend

```powershell
cd Frontend
npm install
npm run dev
```

Mở browser và test các chức năng:
- ✅ Thêm participants
- ✅ Quay số trúng thưởng
- ✅ Check-in
- ✅ Login/Logout

## 🎯 Bước 6: Tạo User Admin Đầu Tiên

Sau khi backend chạy thành công, bạn cần tạo user admin:

### Option 1: Qua Supabase SQL Editor

```sql
-- Tạo user admin với password: admin123
-- Password hash này được tạo bằng BCrypt
INSERT INTO users (username, password_hash, role, created_at)
VALUES (
    'admin',
    '$2a$11$YourBCryptHashHere',  -- Bạn cần generate BCrypt hash
    'Admin',
    NOW()
);
```

### Option 2: Qua API (Recommended)

Tạo một endpoint registration tạm thời hoặc dùng tool như Postman:

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123",
  "role": "Admin"
}
```

## 📊 Bước 7: Enable Row Level Security (Optional)

Nếu bạn muốn bảo mật tốt hơn, enable RLS trên Supabase:

```sql
-- Enable RLS cho tất cả tables
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho authenticated users
CREATE POLICY "Allow all for authenticated users" ON participants
    FOR ALL USING (auth.role() = 'authenticated');

-- Lặp lại cho các tables khác...
```

## 🚀 Bước 8: Deploy lên Production

### 8.1. Cập Nhật Environment Variables

**Backend:**
- Thêm connection string vào environment variables
- Không hardcode password trong appsettings.json

**Frontend:**
- Cập nhật `.env.production`:

```env
VITE_API_URL=https://your-production-api.com/api
VITE_SUPABASE_URL=https://epaymegrarddyuipbbhy.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_0m1v4H6m0fNC9c8Mm3Efyw_4nnbt_IZ
```

### 8.2. Build và Deploy

```powershell
# Backend
cd Backend
dotnet publish -c Release

# Frontend
cd Frontend
npm run build
```

## 🔍 Troubleshooting

### Lỗi: "Password authentication failed"

**Nguyên nhân:** Password trong connection string không đúng

**Giải pháp:**
1. Vào Supabase Dashboard → Settings → Database
2. Copy lại password chính xác
3. Cập nhật trong `appsettings.json`

### Lỗi: "SSL connection error"

**Nguyên nhân:** SSL configuration không đúng

**Giải pháp:** Thêm `SSL Mode=Require;Trust Server Certificate=true;` vào connection string

### Lỗi: "Table does not exist"

**Nguyên nhân:** Chưa chạy migration script

**Giải pháp:**
1. Vào Supabase SQL Editor
2. Chạy lại file `supabase_migration.sql`

### Lỗi: "Column names don't match"

**Nguyên nhân:** DbContext chưa được cập nhật với lowercase column names

**Giải pháp:** Đảm bảo file `LotteryDbContext.cs` đã được cập nhật với `.HasColumnName("lowercase_name")`

## 📝 Checklist Hoàn Thành

- [ ] Cài đặt `Npgsql.EntityFrameworkCore.PostgreSQL` package
- [ ] Chạy migration script trên Supabase SQL Editor
- [ ] Lấy database password từ Supabase Dashboard
- [ ] Cập nhật `appsettings.json` với connection string đúng
- [ ] Cập nhật `Program.cs` để dùng `UseNpgsql`
- [ ] Cài đặt `@supabase/supabase-js` cho frontend
- [ ] Test backend kết nối database thành công
- [ ] Test frontend các chức năng CRUD
- [ ] Tạo user admin đầu tiên
- [ ] Deploy lên production

## 🎉 Hoàn Thành!

Chúc mừng! Bạn đã migrate thành công sang Supabase. Giờ bạn có:

✅ Database PostgreSQL mạnh mẽ và scalable  
✅ Real-time subscriptions (nếu cần)  
✅ Automatic backups  
✅ Free tier rất generous  
✅ Dashboard quản lý database trực quan

## 📚 Tài Liệu Tham Khảo

- [Supabase Documentation](https://supabase.com/docs)
- [Npgsql Entity Framework Core Provider](https://www.npgsql.org/efcore/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
