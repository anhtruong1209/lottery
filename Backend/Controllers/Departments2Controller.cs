using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [Route("api/v2/Departments")]
    [ApiController]
    public class Departments2Controller : ControllerBase
    {
        private readonly LotteryDbContext _context;

        public Departments2Controller(LotteryDbContext context)
        {
            _context = context;
        }

        // GET: api/v2/Departments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Department2>>> GetDepartments()
        {
            return await _context.Departments2.ToListAsync();
        }

        // POST: api/v2/Departments
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Department2>> PostDepartment(Department2 department)
        {
            if (string.IsNullOrEmpty(department.Name)) return BadRequest("Name required");
            _context.Departments2.Add(department);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetDepartments), new { id = department.Id }, department);
        }
        
        // DELETE: api/v2/Departments/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var dept = await _context.Departments2.FindAsync(id);
            if (dept == null) return NotFound();
            _context.Departments2.Remove(dept);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/v2/Departments/seed
        [HttpPost("seed")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> SeedDepartments()
        {
             // Same seed logic as V1
             var departments = new List<Department2>
             {
                 new Department2 { Name = "Khách Mời" },
                 new Department2 { Name = "TTKD" },
                 new Department2 { Name = "Kỹ thuật" }
                 // ... add others if needed
             };
             
             foreach(var d in departments)
             {
                 if (!_context.Departments2.Any(e => e.Name == d.Name))
                 {
                     _context.Departments2.Add(d);
                 }
             }
             await _context.SaveChangesAsync();
             return Ok(new { message = "Seeded V2 Departments" });
        }
    }
}
