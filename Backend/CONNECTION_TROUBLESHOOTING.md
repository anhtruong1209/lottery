# Khắc phục lỗi kết nối SQL Server

## Lỗi thường gặp

### 1. Lỗi: "A network-related or instance-specific error occurred"

**Nguyên nhân có thể:**
- SQL Server chưa chạy
- Firewall chặn kết nối
- Connection string sai
- Server không thể truy cập từ máy này

**Cách kiểm tra:**

#### a) Kiểm tra SQL Server đang chạy
```powershell
Get-Service -Name "*SQL*"
```

#### b) Kiểm tra kết nối bằng SQL Server Management Studio (SSMS)
Thử kết nối với:
- Server: `10.0.0.50,1434`
- Database: `Vishipel_Dashboard`
- Username: `thunghiem2`
- Password: `thunghiem4416`

#### c) Kiểm tra firewall
```powershell
Test-NetConnection -ComputerName 10.0.0.50 -Port 1434
```

#### d) Kiểm tra SQL Server Browser
Nếu dùng named instance, đảm bảo SQL Server Browser service đang chạy.

### 2. Connection String

**Format đúng:**
```
Server=IP,Port;Database=DatabaseName;User ID=Username;Password=Password;TrustServerCertificate=True;Connection Timeout=30;
```

**Ví dụ:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=10.0.0.50,1434;Database=Vishipel_Dashboard;User ID=thunghiem2;Password=thunghiem4416;TrustServerCertificate=True;Connection Timeout=30;"
  }
}
```

**Lưu ý:**
- Port mặc định SQL Server là `1433`, nếu dùng port khác phải chỉ định `IP,Port`
- `TrustServerCertificate=True` để bỏ qua SSL certificate validation (development)
- `Connection Timeout=30` để đợi kết nối 30 giây

### 3. Các cách sửa

#### Option 1: Kiểm tra lại connection string
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=10.0.0.50,1434;Database=Vishipel_Dashboard;User ID=thunghiem2;Password=thunghiem4416;TrustServerCertificate=True;Connection Timeout=60;"
  }
}
```

#### Option 2: Dùng LocalDB (development)
Nếu không kết nối được server remote, dùng LocalDB:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=LotteryDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

#### Option 3: Kiểm tra SQL Server Configuration
1. Mở SQL Server Configuration Manager
2. Kiểm tra SQL Server service đang chạy
3. Kiểm tra TCP/IP protocol đã enable
4. Kiểm tra port đúng (mặc định 1433)

#### Option 4: Enable Remote Connections
Trong SQL Server Management Studio:
1. Right-click server → Properties
2. Connections → Allow remote connections to this server
3. Security → SQL Server and Windows Authentication mode

## Test Connection

Tạo file test connection:

```csharp
// TestConnection.cs
using Microsoft.Data.SqlClient;

var connectionString = "Server=10.0.0.50,1434;Database=Vishipel_Dashboard;User ID=thunghiem2;Password=thunghiem4416;TrustServerCertificate=True;Connection Timeout=30;";

try
{
    using var connection = new SqlConnection(connectionString);
    connection.Open();
    Console.WriteLine("✓ Kết nối thành công!");
}
catch (Exception ex)
{
    Console.WriteLine($"✗ Lỗi: {ex.Message}");
}
```

## Lưu ý

⚠️ **Production:**
- Không dùng `TrustServerCertificate=True` trong production
- Sử dụng connection string từ Azure Key Vault hoặc secure configuration
- Setup proper firewall rules

