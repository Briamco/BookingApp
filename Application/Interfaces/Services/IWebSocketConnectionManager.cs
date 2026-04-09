using System.Net.WebSockets;

namespace BookingApp.Application.Intefaces.Services;

public interface IWebSocketConnectionManager
{
  void AddConnection(Guid userId, WebSocket webSocket);
  void RemoveConnection(Guid userId);
  WebSocket? GetConnection(Guid userId);
  IEnumerable<Guid> GetConnectedUsers();
  Task SendMessageToUserAsync(Guid userId, string message);
  Task BroadcastMessageAsync(string message);
}
