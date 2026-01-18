# Hướng dẫn Deploy ứng dụng Quay thưởng VISHIPEL lên IIS

## Yêu cầu hệ thống

- Windows Server hoặc Windows 10/11 Pro với IIS đã được cài đặt
- URL Rewrite Module cho IIS (tải tại: https://www.iis.net/downloads/microsoft/url-rewrite)
- Node.js và npm (để build ứng dụng)

## Các bước thực hiện

### Bước 1: Build ứng dụng

Mở PowerShell hoặc Command Prompt trong thư mục dự án và chạy:

```bash
npm install
npm run build
```

Sau khi build thành công, thư mục `dist` sẽ được tạo ra chứa các file tĩnh đã được build.

### Bước 2: Cài đặt URL Rewrite Module (nếu chưa có)

1. Tải URL Rewrite Module từ: https://www.iis.net/downloads/microsoft/url-rewrite
2. Cài đặt file `.msi` vừa tải về
3. Khởi động lại IIS sau khi cài đặt

### Bước 3: Tạo Website mới trong IIS

1. Mở **IIS Manager** (tìm kiếm "Internet Information Services (IIS) Manager" trong Windows)

2. Click chuột phải vào **Sites** → **Add Website**

3. Điền thông tin:
   - **Site name**: `QuayThuongVishipel` (hoặc tên bạn muốn)
   - **Physical path**: Chọn thư mục `dist` trong dự án (ví dụ: `C:\inetpub\wwwroot\quaythuong-vishipel\dist`)
   - **Binding**:
     - **Type**: `http` hoặc `https`
     - **IP address**: `All Unassigned` hoặc chọn IP cụ thể
     - **Port**: `8061` (hoặc port bạn muốn)
     - **Host name**: `demo.vishipel.net` (hoặc để trống)

4. Click **OK**

### Bước 4: Copy file web.config

File `web.config` đã được tạo sẵn trong dự án. Đảm bảo file này nằm trong thư mục `dist` sau khi build. Nếu chưa có, copy file `web.config` từ thư mục gốc vào thư mục `dist`.

### Bước 5: Cấu hình Application Pool

1. Trong IIS Manager, chọn **Application Pools**
2. Tìm Application Pool của website vừa tạo
3. Click chuột phải → **Basic Settings**
4. Đảm bảo:
   - **.NET CLR version**: `No Managed Code` (vì đây là ứng dụng React tĩnh)
   - **Managed pipeline mode**: `Integrated`

### Bước 6: Cấu hình quyền truy cập

1. Click chuột phải vào website → **Edit Permissions**
2. Tab **Security** → Click **Edit** → **Add**
3. Nhập `IIS_IUSRS` và click **Check Names** → **OK**
4. Cấp quyền **Read & Execute** và **List folder contents**
5. Click **OK**

### Bước 7: Test và kiểm tra

1. Mở trình duyệt và truy cập: `http://demo.vishipel.net:8061` (hoặc URL bạn đã cấu hình)
2. Kiểm tra:
   - Trang web hiển thị đúng
   - Background image (`img.png`) hiển thị
   - QR code hiển thị với URL động (tự động lấy URL hiện tại)
   - Các chức năng hoạt động bình thường

### Bước 8: Cấu hình Firewall (nếu cần)

Nếu không truy cập được từ máy khác, mở port trong Windows Firewall:

```powershell
New-NetFirewallRule -DisplayName "IIS Quay Thuong Vishipel" -Direction Inbound -Protocol TCP -LocalPort 8061 -Action Allow
```

## Lưu ý quan trọng

1. **QR Code**: QR code sẽ tự động sử dụng URL hiện tại của website (ví dụ: `http://demo.vishipel.net:8061/`)

2. **Background Image**: File `img.png` nằm trong thư mục `public` và sẽ tự động được copy vào thư mục `dist` khi build. Sau khi build, file sẽ có tại `dist/img.png`.

3. **Update sau khi build**: Mỗi lần build lại ứng dụng, cần copy nội dung thư mục `dist` lên server IIS

4. **HTTPS**: Để sử dụng HTTPS, bạn cần:
   - Cài đặt SSL Certificate
   - Thay đổi binding trong IIS từ `http` sang `https`
   - Port mặc định cho HTTPS là `443`

## Script tự động build và copy (tùy chọn)

Bạn có thể tạo script PowerShell để tự động build và copy file:

```powershell
# build-and-deploy.ps1
npm run build
$source = "dist\*"
$destination = "\\server\path\to\iis\website\"
Copy-Item -Path $source -Destination $destination -Recurse -Force
Write-Host "Deployment completed!"
```

## Khắc phục sự cố

### Lỗi 404 khi refresh trang
- Đảm bảo URL Rewrite Module đã được cài đặt
- Kiểm tra file `web.config` có trong thư mục `dist`

### Background image không hiển thị
- Kiểm tra file `img.png` có trong thư mục `dist`
- Kiểm tra đường dẫn trong `index.html` là `./img.png`

### QR Code không hiển thị đúng URL
- Kiểm tra console trình duyệt có lỗi JavaScript không
- Đảm bảo `window.location.origin` trả về đúng URL

## Hỗ trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
- Event Viewer trong Windows để xem lỗi IIS
- Logs trong thư mục `C:\inetpub\logs\LogFiles`

