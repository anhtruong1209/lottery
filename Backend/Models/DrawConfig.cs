using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class DrawConfig
    {
        public int Id { get; set; }

        [Required]
        public string Label { get; set; } = string.Empty;

        public int Count { get; set; }
        
        public string PrizeName { get; set; } = string.Empty;
        
        public int DisplayOrder { get; set; }
    }
}
