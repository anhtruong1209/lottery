using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ParticipantsController : ControllerBase
    {
        private readonly LotteryDbContext _context;

        public ParticipantsController(LotteryDbContext context)
        {
            _context = context;
        }

        // GET: api/participants
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetParticipants()
        {
            try
            {
                var participants = await _context.Participants
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

        // GET: api/participants/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetParticipant(int id)
        {
            var participant = await _context.Participants.FindAsync(id);

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

        // POST: api/participants
        [HttpPost]
        public async Task<ActionResult<object>> CreateParticipant([FromBody] ParticipantDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Department))
            {
                return BadRequest("Tên và phòng ban không được để trống");
            }

            var participant = new Participant
            {
                Name = dto.Name.Trim(),
                Department = dto.Department.Trim(),
                CreatedAt = DateTime.Now
            };

            _context.Participants.Add(participant);
            await _context.SaveChangesAsync();

            var newParticipantResponse = new
            {
                id = participant.Id.ToString(),
                name = participant.Name,
                department = participant.Department
            };

            return CreatedAtAction(nameof(GetParticipant), new { id = participant.Id }, newParticipantResponse);
        }

        // PUT: api/participants/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateParticipant(int id, [FromBody] ParticipantDto dto)
        {
            var participant = await _context.Participants.FindAsync(id);

            if (participant == null)
            {
                return NotFound();
            }

            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Department))
            {
                return BadRequest("Tên và phòng ban không được để trống");
            }

            participant.Name = dto.Name.Trim();
            participant.Department = dto.Department.Trim();
            participant.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/participants/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteParticipant(int id)
        {
            var participant = await _context.Participants.FindAsync(id);
            if (participant == null)
            {
                return NotFound();
            }

            // Remove related winners
            var winners = await _context.Winners.Where(w => w.ParticipantId == id).ToListAsync();
            _context.Winners.RemoveRange(winners);

            _context.Participants.Remove(participant);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/participants
        [HttpDelete]
        public async Task<IActionResult> DeleteAllParticipants()
        {
            // Remove all winners first
            _context.Winners.RemoveRange(_context.Winners);
            
            // Remove all participants
            _context.Participants.RemoveRange(_context.Participants);
            
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class ParticipantDto
    {
        public string Name { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
    }
}

