using System;

namespace Backend.Models
{
    public class CheckIn
    {
        public int Id { get; set; }
        public int ParticipantId { get; set; }
        public string DeviceFingerprint { get; set; } = string.Empty;
        public DateTime CheckedInAt { get; set; }
        public string? IPAddress { get; set; }
        public string? UserAgent { get; set; }

        // Navigation property
        public Participant? Participant { get; set; }
    }
}
