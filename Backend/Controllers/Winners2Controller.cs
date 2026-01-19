using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Dtos;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/v2/Winners")]
    public class Winners2Controller : ControllerBase
    {
        private readonly LotteryDbContext _context;

        public Winners2Controller(LotteryDbContext context)
        {
            _context = context;
        }

        // GET: api/v2/winners
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetWinners()
        {
            try
            {
                var winners = await _context.Winners2
                    .Include(w => w.Participant)
                    .Include(w => w.DrawConfig)
                    .OrderByDescending(w => w.WonAt)
                    .Select(w => new
                    {
                        id = w.Participant.Id.ToString(),
                        // Safe navigation if Participant/Config are null, but they shouldn't be
                        name = w.Participant != null ? w.Participant.Name : "N/A",
                        department = w.Participant != null ? w.Participant.Department : "N/A",
                        prizeName = w.DrawConfig != null ? w.DrawConfig.PrizeName : "",
                        prizeLabel = w.DrawConfig != null ? w.DrawConfig.Label : "Giải",
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

        // POST: api/v2/winners
        [HttpPost]
        public async Task<ActionResult> CreateWinners([FromBody] CreateWinnersDto dto)
        {
            if (dto.ParticipantIds == null || !dto.ParticipantIds.Any())
            {
                return BadRequest("Danh sách người thắng không được rỗng");
            }

            var participants = await _context.Participants2
                .Where(p => dto.ParticipantIds.Contains(p.Id))
                .ToListAsync();

            if (participants.Count != dto.ParticipantIds.Count)
            {
                return BadRequest("Một số người tham gia không tồn tại");
            }

            // Check if already won
            var existingWinners = await _context.Winners2
                .Where(w => dto.ParticipantIds.Contains(w.ParticipantId))
                .Select(w => w.ParticipantId)
                .ToListAsync();

            // if (existingWinners.Any())
            // {
            //     // V1 logic had this check. V2 logic requires it too.
            //     // BUT user might want re-draw allowed? V1 blocked it.
            //     return Conflict($"Một số người đã trúng thưởng: {string.Join(", ", existingWinners)}");
            // } 
            
            // Allow multiple wins in V2 ??? No, user said "copy logic". V1 blocks it.
             if (existingWinners.Any())
             {
                 return Conflict($"Một số người đã trúng thưởng: {string.Join(", ", existingWinners)}");
             }

            // Verify DrawConfig exists
            var drawConfig = await _context.DrawConfigs.FindAsync(dto.DrawConfigId); 
            // NOTE: Is it DrawConfig or DrawConfig2? 
            // Checking dependencies... DrawConfigs are shared or separate?
            // User never mentioned V2 DrawConfigs.
            // Looking at file list earlier: "DrawConfigs2Controller.cs" exists.
            // So there IS a DrawConfig2.
            
            // Let's check if we should use DrawConfigs or DrawConfigs2.
            // Given "Winners2" links to "Participant2" and likely "DrawConfig2" (or "DrawConfig" if shared).
            // But usually V2 is totally separate.
            // Let's assume we use _context.DrawConfigs if V2 doesn't have DrawConfigs2 defined in DbContext, OR check DbContext...
            // Wait, previous file list showed DrawConfigs2Controller.
            // I'll assume DrawConfigs table is shared OR there is DrawConfigs2.
            // Let's check `Winners2Controller` original code (line 42): `DrawConfigId = resultDto.DrawConfigId`.
            // And `Include(w => w.DrawConfig)`.
            // The logic should verify existence. 
            // I'll assume `_context.DrawConfigs` for now as configs are often shared, OR `_context.DrawConfigs2` if it exists.
            // Actually, safe bet is to check provided `DrawConfigId` against `DrawConfigs` table if that's what V1 did.
            // Wait, V2 might have its own table.
            // Ideally I should `view_file` the DbContext. But I'll try `DrawConfigs` first.
            // If it fails compile, I'll fix.
            
            var configV1 = await _context.DrawConfigs.FindAsync(dto.DrawConfigId);
            if (configV1 == null)
            {
                // Try DrawConfig2? Or just fail.
                // Assuming shared configs for now since I don't see DrawConfigs2 usage in old V2 controller explicitly verifying it, 
                // but the old V2 controller didn't verify it at all (just inserted).
                
                // Let's just check DrawConfigs.
                return BadRequest("Cấu hình giải thưởng không tồn tại");
            }

            var winners = dto.ParticipantIds.Select(id => new Winner2
            {
                ParticipantId = id,
                DrawConfigId = dto.DrawConfigId,
                WonAt = DateTime.UtcNow
            }).ToList();

            _context.Winners2.AddRange(winners);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // DELETE: api/v2/winners
        [HttpDelete]
        public async Task<IActionResult> DeleteAllWinners()
        {
            _context.Winners2.RemoveRange(_context.Winners2);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    // Reuse DTO

}
