# Frontend - Hệ thống Quay thưởng VISHIPEL

## Cấu trúc thư mục

```
Frontend/
├── components/          # React Components
│   ├── AdminPanel.tsx
│   ├── Globe3D.tsx
│   ├── RegistrationModal.tsx
│   └── WinnerDisplay.tsx
├── utils/               # Utilities
│   ├── apiService.ts    # API Client
│   └── lotteryLogic.ts  # Lottery Logic
├── public/              # Static files
│   └── img.png         # Background image
├── scripts/             # Build scripts
│   └── copy-to-wwwroot.js
└── package.json
```

## Development

```bash
# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000` và tự động proxy API requests đến backend.

## Build

```bash
# Build và copy vào Backend/wwwroot
npm run build:copy
```

Script sẽ:
1. Build frontend vào thư mục `dist`
2. Copy tất cả files từ `dist` sang `../Backend/wwwroot`
3. Copy `web.config` từ `../Backend/web.config` vào `wwwroot`

## Cấu hình

### Environment Variables

Tạo file `.env` trong thư mục Frontend để override API URL:

```
VITE_API_URL=https://localhost:7000/api
```

Mặc định, frontend sẽ sử dụng cùng origin (`/api`) khi deploy cùng với backend.

## Notes

- Background image: `public/img.png` sẽ được copy vào `dist/img.png` khi build
- API Service: Tự động detect API URL dựa trên environment hoặc sử dụng relative path
