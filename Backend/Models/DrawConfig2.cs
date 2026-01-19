using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("draw_configs_2")]
    public class DrawConfig2
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("label")]
        public string Label { get; set; } = string.Empty; // e.g., "Giải Nhất", "Giải Đặc Biệt"

        [Required]
        [Column("count")]
        public int Count { get; set; } // Number of winners to draw

        [Column("prize_name")]
        public string? PrizeName { get; set; } // Optional description of the prize

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("order")]
        public int Order { get; set; }
    }
}
