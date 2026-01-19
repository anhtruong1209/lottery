namespace Backend.Dtos
{
    public class CreateWinnersDto
    {
        public List<int> ParticipantIds { get; set; } = new();
        public int DrawConfigId { get; set; }
    }
}
