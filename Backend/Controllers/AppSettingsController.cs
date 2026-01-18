using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppSettingsController : ControllerBase
    {
        private readonly LotteryDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<AppSettingsController> _logger;

        public AppSettingsController(
            LotteryDbContext context,
            IWebHostEnvironment environment,
            ILogger<AppSettingsController> logger)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
        }

        // GET: api/appsettings
        // Public endpoint - anyone can read settings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppSetting>>> GetAllSettings()
        {
            try
            {
                var settings = await _context.AppSettings.ToListAsync();
                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all settings");
                return StatusCode(500, "Error retrieving settings");
            }
        }

        // GET: api/appsettings/{key}
        // Public endpoint - anyone can read a specific setting
        [HttpGet("{key}")]
        public async Task<ActionResult<AppSetting>> GetSetting(string key)
        {
            try
            {
                var setting = await _context.AppSettings
                    .FirstOrDefaultAsync(s => s.SettingKey == key);

                if (setting == null)
                {
                    return NotFound(new { message = $"Setting '{key}' not found" });
                }

                return Ok(setting);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting setting: {Key}", key);
                return StatusCode(500, "Error retrieving setting");
            }
        }

        // PUT: api/appsettings/{key}
        // Admin only - update a setting
        [HttpPut("{key}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSetting(string key, [FromBody] UpdateSettingDto dto)
        {
            try
            {
                var setting = await _context.AppSettings
                    .FirstOrDefaultAsync(s => s.SettingKey == key);

                if (setting == null)
                {
                    return NotFound(new { message = $"Setting '{key}' not found" });
                }

                setting.SettingValue = dto.Value;
                setting.UpdatedAt = DateTime.Now;
                setting.UpdatedBy = dto.UpdatedBy ?? User.Identity?.Name ?? "admin";

                await _context.SaveChangesAsync();

                _logger.LogInformation("Setting '{Key}' updated to '{Value}' by {User}",
                    key, dto.Value, setting.UpdatedBy);

                return Ok(new { success = true, setting });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating setting: {Key}", key);
                return StatusCode(500, "Error updating setting");
            }
        }

        // POST: api/appsettings/upload-logo
        // Admin only - upload logo image
        [HttpPost("upload-logo")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<FileUploadResponse>> UploadLogo(IFormFile file)
        {
            return await UploadImage(file, "logo", "logo_url");
        }

        // POST: api/appsettings/upload-background
        // Admin only - upload background image
        [HttpPost("upload-background")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<FileUploadResponse>> UploadBackground(IFormFile file)
        {
            return await UploadImage(file, "background", "background_url");
        }

        // Helper method for image upload
        private async Task<ActionResult<FileUploadResponse>> UploadImage(
            IFormFile file,
            string folder,
            string settingKey)
        {
            try
            {
                // Validate file
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new FileUploadResponse
                    {
                        Success = false,
                        Message = "No file uploaded"
                    });
                }

                // Validate file size (max 5MB)
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new FileUploadResponse
                    {
                        Success = false,
                        Message = "File size exceeds 5MB limit"
                    });
                }

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new FileUploadResponse
                    {
                        Success = false,
                        Message = "Invalid file type. Only images are allowed (jpg, png, gif, webp)"
                    });
                }

                // Create uploads directory if it doesn't exist
                var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", folder);
                Directory.CreateDirectory(uploadsPath);

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Update setting in database
                var url = $"/uploads/{folder}/{fileName}";
                var setting = await _context.AppSettings
                    .FirstOrDefaultAsync(s => s.SettingKey == settingKey);

                if (setting != null)
                {
                    // Delete old file if exists
                    if (!string.IsNullOrEmpty(setting.SettingValue) &&
                        !setting.SettingValue.Contains("default"))
                    {
                        var oldFilePath = Path.Combine(_environment.WebRootPath,
                            setting.SettingValue.TrimStart('/'));
                        if (System.IO.File.Exists(oldFilePath))
                        {
                            System.IO.File.Delete(oldFilePath);
                        }
                    }

                    setting.SettingValue = url;
                    setting.UpdatedAt = DateTime.Now;
                    setting.UpdatedBy = User.Identity?.Name ?? "admin";
                    await _context.SaveChangesAsync();
                }

                _logger.LogInformation("Image uploaded: {Url} by {User}",
                    url, User.Identity?.Name);

                return Ok(new FileUploadResponse
                {
                    Success = true,
                    Url = url,
                    Message = "File uploaded successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image");
                return StatusCode(500, new FileUploadResponse
                {
                    Success = false,
                    Message = "Error uploading file"
                });
            }
        }

        // GET: api/appsettings/dictionary
        // Helper endpoint to get settings as key-value dictionary
        [HttpGet("dictionary")]
        public async Task<ActionResult<Dictionary<string, string>>> GetSettingsDictionary()
        {
            try
            {
                var settings = await _context.AppSettings
                    .ToDictionaryAsync(s => s.SettingKey, s => s.SettingValue ?? "");
                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting settings dictionary");
                return StatusCode(500, "Error retrieving settings");
            }
        }
    }
}
