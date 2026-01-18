using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeedDataController : ControllerBase
    {
        private readonly LotteryDbContext _context;

        public SeedDataController(LotteryDbContext context)
        {
            _context = context;
        }

        // POST: api/seeddata
        [HttpPost]
        public async Task<ActionResult> SeedData()
        {
            try
            {
                // Clear existing data
                _context.Winners.RemoveRange(_context.Winners);
                await _context.SaveChangesAsync();
                
                _context.Participants.RemoveRange(_context.Participants);
                await _context.SaveChangesAsync();

                // Seed Participants - Tạo 150 người
                var departments = new[] { "CNTT", "Kế Toán", "Nhân sự", "Kinh doanh", "Vận hành", "Ban Giám Đốc", "Marketing", "Sản xuất", "Chất lượng", "Kho vận" };
                
                // Danh sách tên đệm và tên phổ biến ở Việt Nam
                var firstNames = new[] { 
                    "Anh", "Bình", "Châu", "Dũng", "Giang", "Hùng", "Hương", "Khánh", "Lan", "Minh", 
                    "Nam", "Oanh", "Phúc", "Quân", "Sơn", "Tú", "Uyên", "Vinh", "Yến", "Đức", 
                    "Hạnh", "Kiên", "Linh", "Mai", "Nga", "Phong", "Quỳnh", "Thành", "Trang", "Việt",
                    "Hà", "Hải", "Hiếu", "Hoài", "Huy", "Khoa", "Long", "Lộc", "Nhung", "Như",
                    "Phương", "Thảo", "Thắng", "Thiện", "Thu", "Thúy", "Tiến", "Trâm", "Trinh", "Trúc",
                    "Tùng", "Tuấn", "Vân", "Xuân", "Đạt", "Đan", "Điệp", "Hằng", "Hòa", "Hồng",
                    "Khang", "Lâm", "Ly", "Mỹ", "Ngọc", "Nhật", "Nhi", "Phát", "Quang", "Quyên",
                    "Sang", "Tâm", "Tân", "Thư", "Thy", "Trí", "Trung", "Vũ", "Vy", "An"
                };
                
                // Danh sách họ phổ biến ở Việt Nam
                var lastNames = new[] { 
                    "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", 
                    "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "Đinh", "Trương", "Đào", "Lưu",
                    "Tô", "Cao", "Tạ", "Hà", "Chu", "Mai", "La", "Lương", "Vương", "Tôn"
                };

                var participants = new List<Participant>();
                var random = new Random();

                for (int i = 0; i < 150; i++)
                {
                    var dept = departments[random.Next(departments.Length)];
                    var firstName = firstNames[random.Next(firstNames.Length)];
                    var lastName = lastNames[random.Next(lastNames.Length)];
                    var name = $"{lastName} {firstName}";

                    participants.Add(new Participant
                    {
                        Name = name,
                        Department = dept,
                        CreatedAt = DateTime.Now.AddDays(-random.Next(1, 30))
                    });
                }

                // Seed Participants
                _context.Participants.AddRange(participants);
                await _context.SaveChangesAsync();
                
                var savedParticipantsCount = await _context.Participants.CountAsync();
                
                if (savedParticipantsCount == 0)
                {
                    return StatusCode(500, new { error = "Không thể seed participants. Kiểm tra database connection." });
                }

                // Seed DrawConfigs (xóa và tạo lại để đảm bảo có đủ)
                _context.DrawConfigs.RemoveRange(_context.DrawConfigs);
                await _context.SaveChangesAsync();
                
                var configs = new List<DrawConfig>
                {
                    new DrawConfig { Label = "Giải An khang", Count = 80, PrizeName = "Tai nghe bluetooth, sấy tóc", DisplayOrder = 1 },
                    new DrawConfig { Label = "Giải Thịnh Vượng", Count = 30, PrizeName = "Tăm nước, bàn chải điện", DisplayOrder = 2 },
                    new DrawConfig { Label = "Giải con Ngựa", Count = 1, PrizeName = "Tivi 55 inches", DisplayOrder = 3 },
                    new DrawConfig { Label = "Giải con Rắn", Count = 1, PrizeName = "Robot lau nhà", DisplayOrder = 4 },
                    new DrawConfig { Label = "Giải con Mùi, Thân", Count = 2, PrizeName = "Nồi chiên không dầu, quạt, máy lọc không khí", DisplayOrder = 5 },
                    new DrawConfig { Label = "Giải con Gà, Tuất", Count = 2, PrizeName = "Nồi chiên không dầu, quạt, máy lọc không khí", DisplayOrder = 6 },
                    new DrawConfig { Label = "Giải Hợi, Tý, Sửu, Dần, Mẹo, Thìn", Count = 6, PrizeName = "Bếp lẩu, bếp hồng ngoại, massage cổ", DisplayOrder = 7 }
                };
                
                _context.DrawConfigs.AddRange(configs);
                await _context.SaveChangesAsync();

                // Verify data was saved
                var actualParticipantsCount = await _context.Participants.CountAsync();
                var actualConfigsCount = await _context.DrawConfigs.CountAsync();

                return Ok(new
                {
                    message = "Đã seed dữ liệu mẫu thành công!",
                    participants = new
                    {
                        created = participants.Count,
                        inDatabase = actualParticipantsCount,
                        status = actualParticipantsCount > 0 ? "✓ Thành công" : "✗ Thất bại"
                    },
                    drawConfigs = new
                    {
                        created = configs.Count,
                        inDatabase = actualConfigsCount,
                        status = actualConfigsCount > 0 ? "✓ Thành công" : "✗ Thất bại"
                    },
                    departmentsCount = departments.Length
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Lỗi khi seed dữ liệu", message = ex.Message });
            }
        }

        // GET: api/seeddata/info
        [HttpGet("info")]
        public async Task<ActionResult> GetSeedInfo()
        {
            try
            {
                var participantsCount = await _context.Participants.CountAsync();
                var winnersCount = await _context.Winners.CountAsync();
                var configsCount = await _context.DrawConfigs.CountAsync();

                var departments = await _context.Participants
                    .GroupBy(p => p.Department)
                    .Select(g => new { Department = g.Key, Count = g.Count() })
                    .ToListAsync();

                return Ok(new
                {
                    participants = participantsCount,
                    winners = winnersCount,
                    configs = configsCount,
                    departments = departments
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Lỗi khi lấy thông tin", message = ex.Message });
            }
        }
    }
}

