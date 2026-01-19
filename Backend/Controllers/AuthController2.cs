using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [Route("api/v2/Auth")]
    [ApiController]
    public class AuthController2 : ControllerBase
    {
        private readonly LotteryDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController2(LotteryDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<ActionResult<object>> Login(LoginDto request)
        {
            try 
            {
                // Login against Users2
                var user = await _context.Users2.FirstOrDefaultAsync(u => u.Username == request.Username);
                
                // Special case: Seed default admin if table is empty
                if (user == null && request.Username == "admin" && !_context.Users2.Any())
                {
                     // Auto-seed admin for V2
                     var hash = BCrypt.Net.BCrypt.HashPassword("admin123");
                     user = new User2 { Username = "admin", Role = "Admin", PasswordHash = hash };
                     _context.Users2.Add(user);
                     await _context.SaveChangesAsync();
                }

                if (user == null)
                {
                    return BadRequest($"User not found. (Checked Users2 table)");
                }

                if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    return BadRequest("Wrong password.");
                }

                string token = CreateToken(user);

                return Ok(new { token });
            }
            catch (Exception ex)
            {
                // Return detailed error for debugging
                return StatusCode(500, new { error = "Server Error", message = ex.Message, stack = ex.StackTrace });
            }
        }

        private string CreateToken(User2 user)
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
    }
}
