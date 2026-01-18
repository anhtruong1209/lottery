using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class AppSetting
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string SettingKey { get; set; } = string.Empty;

        public string? SettingValue { get; set; }

        [Required]
        [StringLength(50)]
        public string SettingType { get; set; } = "text"; // text, image, color

        public string? Description { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        public string? UpdatedBy { get; set; }
    }

    // DTO for updating settings
    public class UpdateSettingDto
    {
        [Required]
        public string Value { get; set; } = string.Empty;
        public string? UpdatedBy { get; set; }
    }

    // DTO for file upload response
    public class FileUploadResponse
    {
        public bool Success { get; set; }
        public string? Url { get; set; }
        public string? Message { get; set; }
    }
}
