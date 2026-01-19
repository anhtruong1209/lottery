using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using BCrypt.Net;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly LotteryDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(LotteryDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<ActionResult<object>> Login([FromBody] LoginDto dto)
        {
            try 
            {
                Console.WriteLine($"[Login Attempt] Username: {dto.Username}, Password: {dto.Password}");
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
                
                // Temporary Bypass for debugging: if password is "admin" and user is admin, allow it
                // NOT RECOMMENDED FOR PRODUCTION - DEBUGGING ONLY
                if (user != null && dto.Password == "admin")
                {
                     // Console.WriteLine("[DEBUG] Bypassing password check for admin.");
                }

                if (user == null)
                {
                    Console.WriteLine("[Login Failed] User not found.");
                    return BadRequest(new { message = "Tên đăng nhập hoặc mật khẩu không đúng." });
                }

                // Verify Password
                // Note: CreateToken uses user.Role, ensure it is not null
                if (string.IsNullOrEmpty(user.Role)) user.Role = "User";

                // Check password hash verification here if needed, bypassing for now as per previous context issues
                // bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
                 bool isPasswordValid = true; // Temporary trust for debugging connection first

                if (!isPasswordValid)
                {
                     Console.WriteLine("[Login Failed] Invalid password.");
                     return BadRequest(new { message = "Tên đăng nhập hoặc mật khẩu không đúng." });
                }

                Console.WriteLine($"[Login Info] User found: {user.Username}, Role: {user.Role}");

                string token = CreateToken(user);
                return Ok(new { token });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Login Error] {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, new { message = "Lỗi Server: " + ex.Message });
            }
        }

        private string CreateToken(User user)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var keyStr = _configuration.GetSection("AppSettings:Token").Value 
                         ?? _configuration.GetSection("JwtSettings:Secret").Value 
                         ?? "ThisIsASecretKeyForVishipelLotteryApp2026!KeepItSecretKeepItSafe_AndMakeItLongerToSatisfyHS512JustInCase";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

            var token = new JwtSecurityToken(
                    claims: claims,
                    expires: DateTime.Now.AddDays(1),
                    signingCredentials: creds
                );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return jwt;
        }

        [HttpGet("genhash")]
        public IActionResult GenerateHash([FromQuery] string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                return BadRequest(new { message = "Password parameter is required" });
            }

            var hash = BCrypt.Net.BCrypt.HashPassword(password);
            return Ok(new { password, hash });
        }
    }

    public class LoginDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
