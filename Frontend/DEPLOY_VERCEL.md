# Hướng dẫn Deploy Frontend lên Vercel

Hướng dẫn này sẽ giúp bạn deploy phần nội dung Frontend (React/Vite) lên Vercel.

> **Lưu ý quan trọng:** Vercel chỉ host phần Frontend. Backend (.NET API) của bạn cần phải được deploy ở một nơi khác (ví dụ: Azure, AWS, Railway, IIS Public Server) và có địa chỉ Public (ví dụ: `https://api.vishipel.net`) để Frontend có thể gọi được. Nếu Backend chỉ chạy ở `localhost`, Frontend trên Vercel sẽ KHÔNG THỂ kết nối được (trừ khi bạn đang test trên máy tính của mình và cả 2 đều chạy).

## Bước 1: Chuẩn bị Source Code

Đảm bảo code của bạn đã được push lên GitHub (hoặc GitLab/Bitbucket).
Nếu chưa, hãy khởi tạo git và push lên:

```bash
git init
git add .
git commit -m "Initial commit"
# Tạo repo trên GitHub và thêm remote origin
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Bước 2: Tạo Project trên Vercel

1. Truy cập [vercel.com](https://vercel.com) và đăng nhập (bằng GitHub).
2. Nhấn nút **"Add New..."** -> **"Project"**.
3. Chọn Repository chứa code của bạn và nhấn **Import**.

## Bước 3: Cấu hình Project (Quan trọng)

Trong màn hình "Configure Project":

1. **Framework Preset:** Vercel thường tự động nhận diện là **Vite**. Nếu không, hãy chọn **Vite**.
2. **Root Directory:**
   - Vì source code Frontend nằm trong thư mục `Frontend`, bạn **BẮT BUỘC** phải nhấn **Edit** ở mục Root Directory.
   - Chọn thư mục `Frontend`.
3. **Build & Output Settings:** (Thường để mặc định nếu đã chọn Preset Vite)
   - Build Command: `npm run build` (hoặc `vite build`)
   - Output Directory: `dist`
4. **Environment Variables:**
   - Mở rộng phần này.
   - Thêm biến môi trường để trỏ Frontend tới Backend API của bạn.
   - **Key:** `VITE_API_URL`
   - **Value:** Điền URL của Backend thật.
     - Ví dụ (nếu đã deploy backend): `https://api.vishipel.net/api`
     - Ví dụ (nếu chưa có backend public và muốn test giao diện): Bạn có thể để trống hoặc dùng Mock API.
     - **Lưu ý:** Nếu bạn không điền, mặc định code sẽ trỏ về `/api` (nghĩa là nó mong đợi Backend chạy cùng domain với Frontend, điều này không đúng trên Vercel trừ khi bạn cấu hình proxy phức tạp). Vì vậy, hãy điền URL đầy đủ.

## Bước 4: Deploy

- Nhấn nút **Deploy**.
- Chờ Vercel build và deploy. Nếu thành công, bạn sẽ thấy màn hình chúc mừng và nút "Visit".

## Troubleshooting (Sự cố thường gặp)

### 1. Lỗi 404 khi reload trang (Client-side Routing)
Nếu bạn vào trang con (ví dụ `/admin`) và reload bị lỗi 404:
- Tạo file `vercel.json` trong thư mục `Frontend` với nội dung sau để điều hướng tất cả request về `index.html`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 2. Frontend không gọi được API (CORS Error)
Nếu bạn thấy lỗi đỏ trong Console về CORS:
- Bạn cần cấu hình CORS ở phía Backend (.NET) để cho phép domain của Vercel truy cập.
- Mở `Program.cs` hoặc `Startup.cs` ở Backend và thêm domain Vercel (ví dụ `https://lottery-app.vercel.app`) vào `WithOrigins`.

```csharp
app.UseCors(builder => builder
    .WithOrigins("https://your-vercel-domain.vercel.app")
    .AllowAnyMethod()
    .AllowAnyHeader());
```
