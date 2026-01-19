using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [Route("api/v2/Winners")]
    [ApiController]
    public class Winners2Controller : ControllerBase
    {
        private readonly LotteryDbContext _context;

        public Winners2Controller(LotteryDbContext context)
        {
            _context = context;
        }

        // GET: api/v2/Winners
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Winner2>>> GetWinners()
        {
            return await _context.Winners2
                .Include(w => w.Participant)
                .Include(w => w.DrawConfig)
                .ToListAsync();
        }

        // POST: api/v2/Winners
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<Winner2>>> PostWinners(CreateWinnersDto resultDto)
        {
            var winners = new List<Winner2>();
            
            foreach(var pId in resultDto.ParticipantIds)
            {
                var winner = new Winner2
                {
                    ParticipantId = pId,
                    DrawConfigId = resultDto.DrawConfigId,
                    WonAt = DateTime.UtcNow
                };
                
                _context.Winners2.Add(winner);
                winners.Add(winner);
                
                // Mark participant as winner if we want to exclude them from future draws
                var participant = await _context.Participants2.FindAsync(pId);
                if (participant != null)
                {
                    participant.IsWinner = true;
                }
            }
            
            await _context.SaveChangesAsync();

            return Ok(winners);
        }

        // DELETE: api/v2/Winners
        [HttpDelete]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAllWinners()
        {
             var winners = await _context.Winners2.ToListAsync();
             _context.Winners2.RemoveRange(winners);
             
             // Reset IsWinner flag on participants?
             // Ideally yes, but keeping it simple for now as per V1 logic
             var participants = await _context.Participants2.Where(p => p.IsWinner).ToListAsync();
             foreach(var p in participants) p.IsWinner = false;

             await _context.SaveChangesAsync();
             return NoContent();
        }
    }
}
