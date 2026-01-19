using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CheckInsController : ControllerBase
    {
        private readonly LotteryDbContext _context;

        public CheckInsController(LotteryDbContext context)
        {
            _context = context;
        }

        // POST: api/checkins
        [HttpPost]
        public async Task<ActionResult<object>> CheckIn([FromBody] CheckInDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.DeviceFingerprint))
            {
                return BadRequest("Tên và device fingerprint không được để trống");
            }

            // Find participant by name
            var participant = await _context.Participants
                .FirstOrDefaultAsync(p => p.Name.ToLower() == dto.Name.ToLower().Trim());

            if (participant == null)
            {
                return NotFound(new { message = "Không tìm thấy tên trong danh sách" });
            }

            // Check if already checked in from this device
            var existingCheckIn = await _context.CheckIns
                .FirstOrDefaultAsync(c => c.ParticipantId == participant.Id && 
                                         c.DeviceFingerprint == dto.DeviceFingerprint);

            if (existingCheckIn != null)
            {
                return Ok(new
                {
                    success = false,
                    alreadyCheckedIn = true,
                    message = "Bạn đã xác nhận tham dự rồi",
                    checkedInAt = existingCheckIn.CheckedInAt,
                    participant = new
                    {
                        id = participant.Id.ToString(),
                        name = participant.Name,
                        department = participant.Department
                    }
                });
            }

            // Check if checked in from other devices
            var otherDeviceCheckIns = await _context.CheckIns
                .Where(c => c.ParticipantId == participant.Id)
                .ToListAsync();

            // Create new check-in
            var checkIn = new CheckIn
            {
                ParticipantId = participant.Id,
                DeviceFingerprint = dto.DeviceFingerprint,
                CheckedInAt = DateTime.UtcNow,
                IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = Request.Headers["User-Agent"].ToString()
            };

            _context.CheckIns.Add(checkIn);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                alreadyCheckedIn = false,
                message = "Xác nhận tham dự thành công!",
                checkedInAt = checkIn.CheckedInAt,
                hasOtherDevices = otherDeviceCheckIns.Count > 0,
                participant = new
                {
                    id = participant.Id.ToString(),
                    name = participant.Name,
                    department = participant.Department
                }
            });
        }

        // GET: api/checkins/status/{name}
        [HttpGet("status/{name}")]
        public async Task<ActionResult<object>> GetCheckInStatus(string name, [FromQuery] string deviceFingerprint)
        {
            if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(deviceFingerprint))
            {
                return BadRequest("Tên và device fingerprint không được để trống");
            }

            var participant = await _context.Participants
                .FirstOrDefaultAsync(p => p.Name.ToLower() == name.ToLower().Trim());

            if (participant == null)
            {
                return NotFound(new { message = "Không tìm thấy tên trong danh sách" });
            }

            var checkIn = await _context.CheckIns
                .FirstOrDefaultAsync(c => c.ParticipantId == participant.Id && 
                                         c.DeviceFingerprint == deviceFingerprint);

            return Ok(new
            {
                isCheckedIn = checkIn != null,
                checkedInAt = checkIn?.CheckedInAt,
                participant = new
                {
                    id = participant.Id.ToString(),
                    name = participant.Name,
                    department = participant.Department
                }
            });
        }

        // GET: api/checkins/stats
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetStats()
        {
            var totalParticipants = await _context.Participants.CountAsync();
            var checkedInCount = await _context.CheckIns
                .Select(c => c.ParticipantId)
                .Distinct()
                .CountAsync();

            var recentCheckIns = await _context.CheckIns
                .Include(c => c.Participant)
                .OrderByDescending(c => c.CheckedInAt)
                .Take(10)
                .Select(c => new
                {
                    name = c.Participant!.Name,
                    department = c.Participant.Department,
                    checkedInAt = c.CheckedInAt
                })
                .ToListAsync();

            return Ok(new
            {
                totalParticipants,
                checkedInCount,
                notCheckedInCount = totalParticipants - checkedInCount,
                percentage = totalParticipants > 0 ? (double)checkedInCount / totalParticipants * 100 : 0,
                recentCheckIns
            });
        }
    }

    public class CheckInDto
    {
        public string Name { get; set; } = string.Empty;
        public string DeviceFingerprint { get; set; } = string.Empty;
    }
}
