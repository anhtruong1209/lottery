using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Winner
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ParticipantId { get; set; }

        [ForeignKey("ParticipantId")]
        public Participant Participant { get; set; } = null!;

        [Required]
        public int DrawConfigId { get; set; }

        [ForeignKey("DrawConfigId")]
        public DrawConfig DrawConfig { get; set; } = null!;

        public DateTime WonAt { get; set; } = DateTime.UtcNow;
    }
}
