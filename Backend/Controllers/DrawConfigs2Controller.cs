using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [Route("api/v2/DrawConfigs")]
    [ApiController]
    public class DrawConfigs2Controller : ControllerBase
    {
        private readonly LotteryDbContext _context;

        public DrawConfigs2Controller(LotteryDbContext context)
        {
            _context = context;
        }

        // GET: api/v2/DrawConfigs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DrawConfig2>>> GetDrawConfigs()
        {
            return await _context.DrawConfigs2.OrderBy(x => x.Order).ToListAsync();
        }

        // GET: api/v2/DrawConfigs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DrawConfig2>> GetDrawConfig(int id)
        {
            var drawConfig = await _context.DrawConfigs2.FindAsync(id);

            if (drawConfig == null)
            {
                return NotFound();
            }

            return drawConfig;
        }

        // PUT: api/v2/DrawConfigs/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutDrawConfig(int id, DrawConfig2 drawConfig)
        {
            if (id != drawConfig.Id)
            {
                return BadRequest();
            }

            _context.Entry(drawConfig).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DrawConfigExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/v2/DrawConfigs
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<DrawConfig2>> PostDrawConfig(DrawConfig2 drawConfig)
        {
            _context.DrawConfigs2.Add(drawConfig);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDrawConfig", new { id = drawConfig.Id }, drawConfig);
        }

        // DELETE: api/v2/DrawConfigs/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDrawConfig(int id)
        {
            var drawConfig = await _context.DrawConfigs2.FindAsync(id);
            if (drawConfig == null)
            {
                return NotFound();
            }

            _context.DrawConfigs2.Remove(drawConfig);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DrawConfigExists(int id)
        {
            return _context.DrawConfigs2.Any(e => e.Id == id);
        }
    }
}
