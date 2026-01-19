using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WinnersController : ControllerBase
    {
        private readonly LotteryDbContext _context;

        public WinnersController(LotteryDbContext context)
        {
            _context = context;
        }

        // GET: api/winners
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetWinners()
        {
            try
            {
                var winners = await _context.Winners
                    .Include(w => w.Participant)
                    .Include(w => w.DrawConfig)
                    .OrderByDescending(w => w.WonAt)
                    .Select(w => new
                    {
                        id = w.Participant.Id.ToString(),
                        name = w.Participant.Name,
                        department = w.Participant.Department,
                        prizeName = w.DrawConfig.PrizeName,
                        prizeLabel = w.DrawConfig.Label,
                        timestamp = ((DateTimeOffset)w.WonAt).ToUnixTimeMilliseconds()
                    })
                    .ToListAsync();

                return Ok(winners);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database connection error", message = ex.Message });
            }
        }

        // POST: api/winners
        [HttpPost]
        public async Task<ActionResult> CreateWinners([FromBody] CreateWinnersDto dto)
        {
            if (dto.ParticipantIds == null || !dto.ParticipantIds.Any())
            {
                return BadRequest("Danh sách người thắng không được rỗng");
            }

            var participants = await _context.Participants
                .Where(p => dto.ParticipantIds.Contains(p.Id))
                .ToListAsync();

            if (participants.Count != dto.ParticipantIds.Count)
            {
                return BadRequest("Một số người tham gia không tồn tại");
            }

            // Check if already won
            var existingWinners = await _context.Winners
                .Where(w => dto.ParticipantIds.Contains(w.ParticipantId))
                .Select(w => w.ParticipantId)
                .ToListAsync();

            if (existingWinners.Any())
            {
                return Conflict($"Một số người đã trúng thưởng: {string.Join(", ", existingWinners)}");
            }

            // Verify DrawConfig exists
            var drawConfig = await _context.DrawConfigs.FindAsync(dto.DrawConfigId);
            if (drawConfig == null)
            {
                return BadRequest("Cấu hình giải thưởng không tồn tại");
            }

            var winners = dto.ParticipantIds.Select(id => new Winner
            {
                ParticipantId = id,
                DrawConfigId = dto.DrawConfigId,
                WonAt = DateTime.UtcNow
            }).ToList();

            _context.Winners.AddRange(winners);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // DELETE: api/winners
        [HttpDelete]
        public async Task<IActionResult> DeleteAllWinners()
        {
            _context.Winners.RemoveRange(_context.Winners);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class CreateWinnersDto
    {
        public List<int> ParticipantIds { get; set; } = new();
        public int DrawConfigId { get; set; }
    }
}

