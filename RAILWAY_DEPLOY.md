# Railway Deployment Guide

## 🚀 Deploy Backend lên Railway.app

### Bước 1: Tạo Tài Khoản Railway

1. Truy cập: https://railway.app
2. Click **"Start a New Project"**
3. Login bằng GitHub

### Bước 2: Push Code Lên GitHub

```powershell
# Trong thư mục project
cd c:\Users\Truong NCPT Vishipel\Documents\Vishipel\CODE\vishipel_lottery

# Init git (nếu chưa có)
git init
git add .
git commit -m "Initial commit - Vishipel Lottery with Supabase"

# Tạo repo trên GitHub và push
git remote add origin https://github.com/YOUR_USERNAME/vishipel_lottery.git
git branch -M main
git push -u origin main
```

### Bước 3: Deploy trên Railway

1. Trên Railway Dashboard, click **"New Project"**
2. Chọn **"Deploy from GitHub repo"**
3. Chọn repo `vishipel_lottery`
4. Railway sẽ tự động detect .NET project

### Bước 4: Thêm Environment Variables

Trong Railway project settings, thêm biến môi trường:

```
ConnectionStrings__DefaultConnection=Host=db.epaymegrarddyuipbbhy.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=Truong1209@2000;

Supabase__Url=https://epaymegrarddyuipbbhy.supabase.co

Supabase__AnonKey=sb_publishable_0m1v4H6m0fNC9c8Mm3Efyw_4nnbt_IZ

JWT__Secret=vishipel-super-secret-key-2024-quay-thuong-vsp-jwt-token-security

JWT__Issuer=VishipelLotteryAPI

JWT__Audience=VishipelLotteryClient

ASPNETCORE_URLS=http://0.0.0.0:$PORT
```

### Bước 5: Deploy!

Railway sẽ tự động build và deploy. Sau vài phút, bạn sẽ có URL:
```
https://your-app.railway.app
```

### Bước 6: Update Frontend

Update file `Frontend/.env`:
```
VITE_API_URL=https://your-app.railway.app
```

Build frontend:
```powershell
cd Frontend
npm run build
```

Deploy frontend lên **Vercel** hoặc **Netlify** (free):
- Vercel: https://vercel.com
- Netlify: https://netlify.com

## ✅ Xong!

Bây giờ:
- ✅ Backend chạy trên Railway (kết nối Supabase OK)
- ✅ Frontend chạy trên Vercel/Netlify
- ✅ Database trên Supabase
- ✅ Không còn network issues!

## 🎯 Alternative: Render.com

Nếu không thích Railway, dùng Render.com:

1. https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Build Command: `cd Backend && dotnet publish -c Release -o out`
5. Start Command: `cd Backend/out && dotnet Backend.dll`
6. Add Environment Variables (giống Railway)

## 💡 Tips

- Railway free tier: 500 hours/month
- Render free tier: Unlimited (nhưng sleep sau 15 phút inactive)
- Vercel/Netlify: Unlimited cho static sites
