# Migration Notes

## Cần tạo migration mới sau khi thay đổi models

Sau khi thêm các field mới:
- `DrawConfig.PrizeName`
- `Winner.DrawConfigId`

Chạy lệnh sau để tạo migration:

```powershell
cd Backend
dotnet ef migrations add AddPrizeInfo
dotnet ef database update
```

## Thay đổi Models

1. **DrawConfig**: Thêm `PrizeName` (string)
2. **Winner**: Thêm `DrawConfigId` (int, foreign key)

Migration sẽ tự động được apply khi chạy ứng dụng (xem Program.cs).

