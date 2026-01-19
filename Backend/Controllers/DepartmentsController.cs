using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentsController : ControllerBase
    {
        private readonly LotteryDbContext _context;

        public DepartmentsController(LotteryDbContext context)
        {
            _context = context;
        }

        // GET: api/Departments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Department>>> GetDepartments()
        {
            return await _context.Departments.OrderBy(d => d.Name).ToListAsync();
        }

        // POST: api/Departments
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Department>> CreateDepartment(Department department)
        {
            if (await _context.Departments.AnyAsync(d => d.Name == department.Name))
            {
                return BadRequest("Department already exists.");
            }

            department.CreatedAt = DateTime.UtcNow;
            _context.Departments.Add(department);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDepartments", new { id = department.Id }, department);
        }

        // DELETE: api/Departments/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound();
            }

            // Check usage? For now, we allow delete. 
            // Ideally should check if participants exist, but keeping it simple for now as per "CRUD" request.
            
            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        
        // POST: api/Departments/seed
        [HttpPost("seed")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SeedDepartments()
        {
            if (await _context.Departments.AnyAsync())
            {
                return Ok(new { message = "Departments already exist." });
            }
            
            var staticList = new List<string> {
                "Ban điều hành",
                "Phòng Điều hành mạng",
                "Phòng Chính sách kinh doanh",
                "Phòng Nghiên cứu phát triển",
                "Phòng Kế hoạch đầu tư",
                "Phòng Tổ chức lao động",
                "Phòng Tài chính kế toán",
                "Phòng Hành chính tổng hợp",
                "Ban Kiểm soát nội bộ",
                "Đài Thông tin vệ tinh mặt đất Inmarsat Hải Phòng (HPLES)",
                "Đài Thông tin vệ tinh Cospas-Sarsat Việt Nam (VNLUT/MCC)",
                "Đài Thông tin Nhận dạng và truy theo tầm xa (LRIT)",
                "Đài Trung tâm Xử lý thông tin Hàng hải Hà Nội",
                "Trung tâm Viễn thông – Công nghệ thông tin",
                "Trung tâm Dịch vụ Khách hàng",
                "Đài TTDH Móng Cái",
                "Đài TTDH Cửa Ông",
                "Đài TTDH Hòn Gai",
                "Đài TTDH Hải Phòng",
                "Đài TTDH Bạch Long Vĩ",
                "Đài TTDH Thanh Hóa",
                "Đài TTDH Bến Thủy",
                "Đài TTDH Hòn La",
                "Đài TTDH Cửa Việt",
                "Đài TTDH Huế",
                "Đài TTDH Đà Nẵng",
                "Đài TTDH Dung Quất",
                "Đài TTDH Lý Sơn",
                "Đài TTDH Quy Nhơn",
                "Đài TTDH Phú Yên",
                "Đài TTDH Nha Trang",
                "Đài TTDH Cam Ranh",
                "Đài TTDH Phan Rang",
                "Đài TTDH Phan Thiết",
                "Đài TTDH Vũng Tàu",
                "Đài TTDH Hồ Chí Minh",
                "Đài TTDH Bạc Liêu",
                "Đài TTDH Cần Thơ",
                "Đài TTDH Côn Đảo",
                "Đài TTDH Cà Mau",
                "Đài TTDH Kiên Giang",
                "Đài TTDH Hà Tiên",
                "Đài TTDH Thổ Chu",
                "Đài TTDH Phú Quốc"
            };
            
            foreach(var name in staticList)
            {
                _context.Departments.Add(new Department { Name = name, CreatedAt = DateTime.UtcNow });
            }
            
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Seeded {staticList.Count} departments." });
        }
    }
}
