# 🚀 Hướng Dẫn Chạy Migration Trên Supabase

## 📸 Hiện Tại

Tôi thấy project Supabase của bạn đang trống (0 Tables). Bây giờ chúng ta sẽ tạo database schema.

![Current Supabase Status](C:/Users/Truong NCPT Vishipel/.gemini/antigravity/brain/45afa91a-7a35-44a7-ac21-ff0e406a3d83/uploaded_image_1768700845661.png)

---

## 🎯 Các Bước Thực Hiện

### Bước 1: Mở SQL Editor

1. Trong Supabase Dashboard, click vào **SQL Editor** ở menu bên trái
2. Click nút **New Query** (hoặc dấu `+`)

### Bước 2: Copy Migration Script

Mở file này và copy toàn bộ nội dung:
- **File**: `Backend/Data/supabase_migration.sql`
- **Đường dẫn đầy đủ**: [supabase_migration.sql](file:///c:/Users/Truong%20NCPT%20Vishipel/Documents/Vishipel/CODE/vishipel_lottery/Backend/Data/supabase_migration.sql)

### Bước 3: Paste và Run

1. Paste toàn bộ script vào SQL Editor
2. Click nút **Run** (hoặc nhấn `Ctrl + Enter`)
3. Đợi khoảng 2-3 giây

### Bước 4: Verify

Sau khi chạy xong, bạn sẽ thấy:

✅ **5 Tables được tạo:**
- `check_ins`
- `draw_configs`
- `participants`
- `users`
- `winners`

✅ **7 Draw Configs được seed:**
- Giải An khang (80 giải)
- Giải Thịnh Vượng (30 giải)
- Giải con Ngựa (1 giải - Tivi 55")
- Giải con Rắn (1 giải - Robot lau nhà)
- Giải con Mùi, Thân (2 giải)
- Giải con Gà, Tuất (2 giải)
- Giải Hợi, Tý, Sửu, Dần, Mẹo, Thìn (6 giải)

---

## 🔍 Kiểm Tra Kết Quả

### Cách 1: Qua Table Editor

1. Click **Table Editor** ở menu bên trái
2. Bạn sẽ thấy 5 tables
3. Click vào `draw_configs` → sẽ thấy 7 rows

### Cách 2: Qua SQL Query

Chạy query này trong SQL Editor:

```sql
-- Kiểm tra tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Kiểm tra seed data
SELECT * FROM draw_configs ORDER BY display_order;
```

---

## 🔑 Bước 5: Lấy Database Password

Sau khi tạo tables xong, bạn cần lấy password để kết nối từ Backend:

1. Vào **Settings** → **Database** (ở menu bên trái)
2. Scroll xuống phần **Connection string**
3. Tìm dòng có format: `postgresql://postgres:[YOUR-PASSWORD]@...`
4. Click **Show** hoặc copy icon để lấy password
5. Copy password này

---

## ⚙️ Bước 6: Cập Nhật Backend Config

Mở file `Backend/appsettings.json` và thay `YOUR_SUPABASE_PASSWORD`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.epaymegrarddyuipbbhy.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=PASTE_YOUR_PASSWORD_HERE;SSL Mode=Require;Trust Server Certificate=true;"
  }
}
```

> [!WARNING]
> **Quan trọng:** Không commit file này lên Git với password thật!

---

## ✅ Bước 7: Test Kết Nối

### Test Backend

```powershell
cd Backend
dotnet build
dotnet run
```

Kiểm tra console log - bạn sẽ thấy:
- ✅ Kết nối database thành công
- ✅ "Seeded Admin user" (nếu chưa có)
- ✅ Application started

### Test API

Mở browser và truy cập:
- `http://localhost:5000/api/drawconfigs` → Sẽ thấy 7 giải thưởng
- `http://localhost:5000/api/participants` → Sẽ thấy array rỗng `[]`

---

## 🎉 Hoàn Thành!

Sau khi làm xong các bước trên, bạn sẽ có:

✅ Database schema hoàn chỉnh trên Supabase  
✅ Seed data cho draw_configs  
✅ Backend kết nối thành công  
✅ Sẵn sàng để test ứng dụng  

---

## 🐛 Troubleshooting

### Lỗi: "relation does not exist"
**Nguyên nhân:** Chưa chạy migration script  
**Giải pháp:** Quay lại Bước 1-3

### Lỗi: "password authentication failed"
**Nguyên nhân:** Password trong appsettings.json không đúng  
**Giải pháp:** Lấy lại password từ Supabase Dashboard (Bước 5)

### Lỗi: "SSL connection error"
**Nguyên nhân:** Thiếu SSL config  
**Giải pháp:** Đảm bảo connection string có `SSL Mode=Require;Trust Server Certificate=true;`

---

## 📚 Tài Liệu Liên Quan

- [supabase_migration.sql](file:///c:/Users/Truong%20NCPT%20Vishipel/Documents/Vishipel/CODE/vishipel_lottery/Backend/Data/supabase_migration.sql) - Migration script
- [appsettings.json](file:///c:/Users/Truong%20NCPT%20Vishipel/Documents/Vishipel/CODE/vishipel_lottery/Backend/appsettings.json) - Backend config
- [SUPABASE_MIGRATION.md](file:///c:/Users/Truong%20NCPT%20Vishipel/Documents/Vishipel/CODE/vishipel_lottery/SUPABASE_MIGRATION.md) - Hướng dẫn chi tiết
