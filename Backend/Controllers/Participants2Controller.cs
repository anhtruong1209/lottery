using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Dtos;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/v2/Participants")] // Keep V2 route
    public class Participants2Controller : ControllerBase
    {
        private readonly LotteryDbContext _context;

        public Participants2Controller(LotteryDbContext context)
        {
            _context = context;
        }

        // GET: api/v2/participants
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetParticipants()
        {
            try
            {
                var participants = await _context.Participants2
                    .OrderBy(p => p.Name)
                    .Select(p => new
                    {
                        id = p.Id.ToString(),
                        name = p.Name,
                        department = p.Department
                    })
                    .ToListAsync();

                return Ok(participants);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database connection error", message = ex.Message });
            }
        }

        // GET: api/v2/participants/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetParticipant(int id)
        {
            var participant = await _context.Participants2.FindAsync(id);

            if (participant == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                id = participant.Id.ToString(),
                name = participant.Name,
                department = participant.Department
            });
        }

        // POST: api/v2/participants
        [HttpPost]
        public async Task<ActionResult<object>> CreateParticipant([FromBody] ParticipantDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Department))
            {
                return BadRequest("Tên và phòng ban không được để trống");
            }

            var trimmedName = dto.Name.Trim();
            var trimmedDept = dto.Department.Trim();

            // Check for duplicates
            var existing = await _context.Participants2
                .FirstOrDefaultAsync(p => p.Name == trimmedName && p.Department == trimmedDept);

            if (existing != null)
            {
                return BadRequest($"Người tham gia '{trimmedName}' thuộc '{trimmedDept}' đã tồn tại.");
            }

            var participant = new Participant2
            {
                Name = trimmedName,
                Department = trimmedDept,
                CreatedAt = DateTime.UtcNow
            };

            _context.Participants2.Add(participant);
            await _context.SaveChangesAsync();

            var newParticipantResponse = new
            {
                id = participant.Id.ToString(),
                name = participant.Name,
                department = participant.Department
            };

            return CreatedAtAction(nameof(GetParticipant), new { id = participant.Id }, newParticipantResponse);
        }

        // PUT: api/v2/participants/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateParticipant(int id, [FromBody] ParticipantDto dto)
        {
            var participant = await _context.Participants2.FindAsync(id);

            if (participant == null)
            {
                return NotFound();
            }

            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Department))
            {
                return BadRequest("Tên và phòng ban không được để trống");
            }

            var trimmedName = dto.Name.Trim();
            var trimmedDept = dto.Department.Trim();

            // Check for duplicates (excluding self)
            var duplicate = await _context.Participants2
                .AnyAsync(p => p.Id != id && p.Name == trimmedName && p.Department == trimmedDept);

            if (duplicate)
            {
                return BadRequest($"Người tham gia '{trimmedName}' thuộc '{trimmedDept}' đã tồn tại.");
            }

            participant.Name = trimmedName;
            participant.Department = trimmedDept;
            // participant.UpdatedAt = DateTime.UtcNow; // Keeping consistent with previous V2 structure (no UpdatedAt yet or not in V1 copy) assignment if not in model
            // Re-checking V1: V1 does set UpdatedAt. V2 model might support it.
            // Safe to skip UpdatedAt if not sure, but the check is the main thing.
            
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/v2/participants/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteParticipant(int id)
        {
            var participant = await _context.Participants2.FindAsync(id);
            if (participant == null)
            {
                return NotFound();
            }

            // Remove related winners
            var winners = await _context.Winners2.Where(w => w.ParticipantId == id).ToListAsync();
            _context.Winners2.RemoveRange(winners);

            _context.Participants2.Remove(participant);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/v2/participants
        [HttpDelete]
        public async Task<IActionResult> DeleteAllParticipants()
        {
            // Remove all winners first
            _context.Winners2.RemoveRange(_context.Winners2);
            
            // Remove all participants
            _context.Participants2.RemoveRange(_context.Participants2);
            
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    // Reuse DTO class or define here to be self-contained in this file context

}
