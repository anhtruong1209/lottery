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
            Console.WriteLine($"[Login Attempt] Username: {dto.Username}, Password: {dto.Password}");
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
            if (user == null)
            {
                Console.WriteLine("[Login Failed] User not found.");
                return BadRequest(new { message = "Tên đăng nhập hoặc mật khẩu không đúng." });
            }

            Console.WriteLine($"[Login Info] User found: {user.Username}, Role: {user.Role}, Hash: {user.PasswordHash}");

            string token = CreateToken(user);

            return Ok(new { token });
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var keyStr = _configuration.GetSection("AppSettings:Token").Value ?? "ThisIsASecretKeyForVishipelLotteryApp2026!KeepItSecretKeepItSafe";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
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
