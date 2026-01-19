using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("app_settings_2")]
    public class AppSetting2
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("setting_key")]
        public string SettingKey { get; set; } = string.Empty;

        [Column("setting_value", TypeName = "nvarchar(max)")]
        public string? SettingValue { get; set; }

        [Column("setting_type")]
        public string SettingType { get; set; } = "text"; // text, image, json

        [Column("description")]
        public string? Description { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_by")]
        public string? UpdatedBy { get; set; }
    }
}
