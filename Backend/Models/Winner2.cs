using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("winners_2")]
    public class Winner2
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("participant_id")]
        // [ForeignKey("Participant")] - Removed strict FK for simplicity in V2 or keep it? Keeping it simple.
        public int ParticipantId { get; set; }
        
        // Navigation property could be added if we duplicate Participant2 too
        public virtual Participant2? Participant { get; set; }

        [Required]
        [Column("draw_config_id")]
        public int DrawConfigId { get; set; }
        
        public virtual DrawConfig2? DrawConfig { get; set; }

        [Column("won_at")]
        public DateTime WonAt { get; set; } = DateTime.UtcNow;
    }
}
