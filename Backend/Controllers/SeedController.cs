using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using BCrypt.Net;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SeedController : ControllerBase
    {
        private readonly LotteryDbContext _context;

        public SeedController(LotteryDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Seed()
        {
            try
            {
                // Ensure helper tables are empty/migrated
                // Check if admin user exists
                if (_context.Users.Any(u => u.Username == "admin"))
                {
                    return Ok(new { message = "Admin user already exists." });
                }

                var adminUser = new User
                {
                    Username = "admin",
                    Role = "Admin",
                    // Using simple password "admin" as per recent change
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin")
                };

                _context.Users.Add(adminUser);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Admin user seeded successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new 
                { 
                    message = "Seeding failed.", 
                    error = ex.Message, 
                    inner = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace 
                });
            }
        }
    }
}
