using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DrawConfigsController : ControllerBase
    {
        private readonly LotteryDbContext _context;

        public DrawConfigsController(LotteryDbContext context)
        {
            _context = context;
        }

        // GET: api/drawconfigs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetDrawConfigs()
        {
            try
            {
                var configs = await _context.DrawConfigs
                    .OrderBy(c => c.DisplayOrder)
                    .Select(c => new
                    {
                        id = c.Id.ToString(),
                        label = c.Label,
                        count = c.Count,
                        prizeName = c.PrizeName
                    })
                    .ToListAsync();

                return Ok(configs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database connection error", message = ex.Message });
            }
        }

        // PUT: api/drawconfigs/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDrawConfig(int id, [FromBody] DrawConfigDto dto)
        {
            var config = await _context.DrawConfigs.FindAsync(id);

            if (config == null)
            {
                return NotFound();
            }

            config.Label = dto.Label;
            config.Count = dto.Count;
            if (dto.PrizeName != null) 
            {
                config.PrizeName = dto.PrizeName;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/drawconfigs
        [HttpPost]
        public async Task<ActionResult<object>> CreateDrawConfig([FromBody] DrawConfigDto dto)
        {
            var configs = await _context.DrawConfigs.ToListAsync();
            var maxOrder = configs.Count > 0 ? configs.Max(c => c.DisplayOrder) : 0;

            var config = new DrawConfig
            {
                Label = dto.Label,
                Count = dto.Count,
                PrizeName = dto.PrizeName ?? string.Empty,
                DisplayOrder = maxOrder + 1
            };

            _context.DrawConfigs.Add(config);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = config.Id.ToString(),
                label = config.Label,
                count = config.Count
            });
        }

        // DELETE: api/drawconfigs/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDrawConfig(int id)
        {
            var config = await _context.DrawConfigs.FindAsync(id);
            if (config == null)
            {
                return NotFound();
            }

            _context.DrawConfigs.Remove(config);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class DrawConfigDto
    {
        public string Label { get; set; } = string.Empty;
        public int Count { get; set; }
        public string? PrizeName { get; set; }
    }
}

