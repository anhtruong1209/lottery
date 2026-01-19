using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [Route("api/v2/Participants")]
    [ApiController]
    public class Participants2Controller : ControllerBase
    {
        private readonly LotteryDbContext _context;

        public Participants2Controller(LotteryDbContext context)
        {
            _context = context;
        }

        // GET: api/v2/Participants
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Participant2>>> GetParticipants()
        {
            return await _context.Participants2.ToListAsync();
        }

        // GET: api/v2/Participants/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Participant2>> GetParticipant(int id)
        {
            var participant = await _context.Participants2.FindAsync(id);

            if (participant == null)
            {
                return NotFound();
            }

            return participant;
        }

        // PUT: api/v2/Participants/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutParticipant(int id, Participant2 participant)
        {
            if (id != participant.Id)
            {
                return BadRequest();
            }

            _context.Entry(participant).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ParticipantExists(id))
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

        // POST: api/v2/Participants
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Participant2>> PostParticipant(Participant2 participant)
        {
            participant.CreatedAt = DateTime.UtcNow;
            _context.Participants2.Add(participant);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetParticipant", new { id = participant.Id }, participant);
        }

        // DELETE: api/v2/Participants/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteParticipant(int id)
        {
            var participant = await _context.Participants2.FindAsync(id);
            if (participant == null)
            {
                return NotFound();
            }

            _context.Participants2.Remove(participant);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/v2/Participants
        [HttpDelete]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAllParticipants()
        {
            // Truncate logic via EF execution strategy if needed, or simple implementation
            _context.Participants2.RemoveRange(_context.Participants2);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool ParticipantExists(int id)
        {
            return _context.Participants2.Any(e => e.Id == id);
        }
    }
}
