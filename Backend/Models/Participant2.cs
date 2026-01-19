using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("participants_2")]
    public class Participant2
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("department")]
        public string Department { get; set; } = string.Empty; // Store Department Name directly for simplicity or link to Department table

        [Column("is_winner")]
        public bool IsWinner { get; set; } = false; // Flag to exclude from future pools if needed

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("check_in_status")]
        public bool CheckInStatus { get; set; } = false; // Has checked in?
    }
}
