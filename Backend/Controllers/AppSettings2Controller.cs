using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/v2/AppSettings")] // V2 Endpoint
    [ApiController]
    public class AppSettings2Controller : ControllerBase
    {
        private readonly LotteryDbContext _context;

        public AppSettings2Controller(LotteryDbContext context)
        {
            _context = context;
        }

        // GET: api/v2/AppSettings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAppSettings()
        {
            // Use AppSettings2
            var settings = await _context.AppSettings2.ToListAsync();
            
            var result = settings.Select(s => {
                if ((s.SettingKey == "CompanyLogo" || s.SettingKey == "BackgroundImage" || s.SettingKey == "BackgroundMusic") && !string.IsNullOrEmpty(s.SettingValue))
                {
                    string finalUrl;
                    if (s.SettingValue.StartsWith("/"))
                    {
                        finalUrl = $"{Request.Scheme}://{Request.Host}{s.SettingValue}";
                    }
                    else
                    {
                         finalUrl = $"{Request.Scheme}://{Request.Host}/api/AppSettings/image/{s.SettingKey}"; // Can reuse V1 image logic or duplicate logic if needed, but V2 aims for path based.
                    }

                    return new {
                        s.Id,
                        s.SettingKey,
                        s.SettingType,
                        s.Description,
                        SettingValue = finalUrl, 
                        s.UpdatedAt,
                        s.UpdatedBy
                    };
                }
                return (object)s;
            });
            
            return Ok(result);
        }

        // GET: api/v2/AppSettings/key/{key}
        [HttpGet("key/{key}")]
        public async Task<ActionResult<object>> GetAppSettingByKey(string key)
        {
            var appSetting = await _context.AppSettings2.FirstOrDefaultAsync(s => s.SettingKey == key);

            if (appSetting == null)
            {
                return NotFound();
            }

            if ((appSetting.SettingKey == "CompanyLogo" || appSetting.SettingKey == "BackgroundImage" || appSetting.SettingKey == "BackgroundMusic") && !string.IsNullOrEmpty(appSetting.SettingValue))
            {
                string finalUrl;
                if (appSetting.SettingValue.StartsWith("/"))
                {
                    finalUrl = $"{Request.Scheme}://{Request.Host}{appSetting.SettingValue}";
                }
                else
                {
                    finalUrl = $"{Request.Scheme}://{Request.Host}/api/AppSettings/image/{appSetting.SettingKey}";
                }

                 return new {
                    appSetting.Id,
                    appSetting.SettingKey,
                    appSetting.SettingType,
                    appSetting.Description,
                    SettingValue = finalUrl,
                    appSetting.UpdatedAt,
                    appSetting.UpdatedBy
                };
            }

            return appSetting;
        }

        // POST: api/v2/AppSettings
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AppSetting2>> CreateAppSetting(AppSetting2 appSetting)
        {
            if (await _context.AppSettings2.AnyAsync(s => s.SettingKey == appSetting.SettingKey))
            {
                return BadRequest("Setting key already exists.");
            }

            appSetting.UpdatedAt = DateTime.UtcNow;
            appSetting.UpdatedBy = User.Identity?.Name;

            _context.AppSettings2.Add(appSetting);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAppSettingByKey", new { key = appSetting.SettingKey }, appSetting);
        }

        // PUT: api/v2/AppSettings/key/{key}
        [HttpPut("key/{key}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAppSetting(string key, UpdateSettingDto dto)
        {
            var appSetting = await _context.AppSettings2.FirstOrDefaultAsync(s => s.SettingKey == key);

            if (appSetting == null)
            {
                return NotFound();
            }

            appSetting.SettingValue = dto.Value;
            appSetting.UpdatedAt = DateTime.UtcNow;
            appSetting.UpdatedBy = User.Identity?.Name ?? dto.UpdatedBy;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
               throw;
            }

            return NoContent();
        }

        // POST: api/v2/AppSettings/upload-file
        [HttpPost("upload-file")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<FileUploadResponse>> UploadFile([FromForm] IFormFile file, [FromForm] string key)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            if (string.IsNullOrEmpty(key))
                return BadRequest("Key is required.");
            
            try 
            {
                // Ensure wwwroot/uploads exists (Shared folder for both sites is fine)
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var extension = Path.GetExtension(file.FileName);
                if (string.IsNullOrEmpty(extension)) extension = ".bin";

                // V2 File Naming: Add suffix or keep same? 
                // Using same name means both sites share the file physically if they upload same Key?
                // Actually, if Key is "CompanyLogo", V1 saves "CompanyLogo.png".
                // V2 users uploading "CompanyLogo" will overwrite it?
                // YES if we use the same key.
                // Should we prefix V2 files? e.g. "v2_CompanyLogo.png"?
                // Probably safer.
                
                var fileName = $"v2_{key}{extension}";
                var filePath = Path.Combine(uploadsFolder, fileName);
                
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var relativePath = $"/uploads/{fileName}";
                var mimeType = file.ContentType ?? "application/octet-stream";

                // Save to DB (AppSettings2)
                var appSetting = await _context.AppSettings2.FirstOrDefaultAsync(s => s.SettingKey == key);
                if (appSetting == null)
                {
                   appSetting = new AppSetting2 
                   { 
                       SettingKey = key,
                       SettingValue = relativePath, 
                       SettingType = mimeType.StartsWith("image/") ? "image" : "audio",
                       UpdatedAt = DateTime.UtcNow,
                       UpdatedBy = User.Identity?.Name 
                   };
                   _context.AppSettings2.Add(appSetting);
                }
                else
                {
                    appSetting.SettingValue = relativePath;
                    appSetting.UpdatedAt = DateTime.UtcNow;
                    appSetting.UpdatedBy = User.Identity?.Name;
                }
                
                await _context.SaveChangesAsync();
                
                var url = $"{Request.Scheme}://{Request.Host}{relativePath}";
                
                return Ok(new FileUploadResponse { Success = true, Url = url, Message = "File uploaded successfully (V2)." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error uploading file {key}: {ex.Message}");
                return StatusCode(500, new FileUploadResponse { Success = false, Message = "Server error during upload." });
            }
        }
        
        [HttpPost("init")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> InitializeSettings()
        {
            var defaults = new List<AppSetting2>
            {
                new AppSetting2 { SettingKey = "CompanyName", SettingValue = "Vishipel Lottery V2", SettingType = "text", Description = "Company Name displayed in header" },
                new AppSetting2 { SettingKey = "CompanyLogo", SettingValue = "", SettingType = "image", Description = "Base64 string of Company Logo" },
                new AppSetting2 { SettingKey = "BackgroundImage", SettingValue = "", SettingType = "image", Description = "Base64 string of Background Image" }
            };

            foreach (var setting in defaults)
            {
                if (!await _context.AppSettings2.AnyAsync(s => s.SettingKey == setting.SettingKey))
                {
                    setting.UpdatedAt = DateTime.UtcNow;
                    _context.AppSettings2.Add(setting);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Settings initialized (V2)." });
        }
    }
}
