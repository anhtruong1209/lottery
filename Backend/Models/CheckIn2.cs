using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("check_ins_2")]
    public class CheckIn2
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("participant_id")]
        public int ParticipantId { get; set; }

        [Column("check_in_time")]
        public DateTime CheckInTime { get; set; } = DateTime.UtcNow;

        // Device Fingerprint / IP
        [Column("device_id")]
        public string? DeviceId { get; set; }

        [Column("ip_address")]
        public string? IpAddress { get; set; }

        [Column("user_agent")]
        public string? UserAgent { get; set; }

        [Column("is_valid")]
        public bool IsValid { get; set; } = true;

        [Column("note")]
        public string? Note { get; set; }
    }
}
