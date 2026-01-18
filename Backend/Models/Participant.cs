using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Participant
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Department { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }
    }

    public class DrawConfig
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Label { get; set; } = string.Empty;

        [Required]
        public int Count { get; set; }

        [StringLength(200)]
        public string PrizeName { get; set; } = string.Empty;

        public int DisplayOrder { get; set; }
    }

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

        public DateTime WonAt { get; set; } = DateTime.Now;
    }
}

