using Microsoft.AspNetCore.SignalR;

namespace Backend.Hubs
{
    public class ParticipantHub : Hub
    {
        // Broadcast when a participant is added
        public async Task NotifyParticipantAdded(object participant)
        {
            await Clients.All.SendAsync("ParticipantAdded", participant);
        }

        // Broadcast when a participant is deleted
        public async Task NotifyParticipantDeleted(string participantId)
        {
            await Clients.All.SendAsync("ParticipantDeleted", participantId);
        }

        // Broadcast when all participants are reset
        public async Task NotifyParticipantsReset()
        {
            await Clients.All.SendAsync("ParticipantsReset");
        }

        // Connection lifecycle
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
            Console.WriteLine($"Client connected: {Context.ConnectionId}");
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
            Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
        }
    }
}
