using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using BookingApp.Application.Intefaces.Services;
using Microsoft.Extensions.Logging;

namespace BookingApp.Infrastructure.Services;

public class WebSocketConnectionManager : IWebSocketConnectionManager
{
  private readonly Dictionary<Guid, WebSocket> _connections = new();
  private readonly ILogger<WebSocketConnectionManager> _logger;

  public WebSocketConnectionManager(ILogger<WebSocketConnectionManager> logger)
  {
    _logger = logger;
  }

  public void AddConnection(Guid userId, WebSocket webSocket)
  {
    lock (_connections)
    {
      _connections[userId] = webSocket;
      _logger.LogInformation($"WebSocket connection established for user: {userId}");
    }
  }

  public void RemoveConnection(Guid userId)
  {
    lock (_connections)
    {
      if (_connections.Remove(userId))
      {
        _logger.LogInformation($"WebSocket connection removed for user: {userId}");
      }
    }
  }

  public WebSocket? GetConnection(Guid userId)
  {
    lock (_connections)
    {
      _connections.TryGetValue(userId, out var connection);
      return connection?.State == WebSocketState.Open ? connection : null;
    }
  }

  public IEnumerable<Guid> GetConnectedUsers()
  {
    lock (_connections)
    {
      return _connections.Where(c => c.Value.State == WebSocketState.Open).Select(c => c.Key).ToList();
    }
  }

  public async Task SendMessageToUserAsync(Guid userId, string message)
  {
    var connection = GetConnection(userId);
    if (connection == null)
    {
      _logger.LogWarning($"No active WebSocket connection for user: {userId}");
      return;
    }

    try
    {
      var bytes = Encoding.UTF8.GetBytes(message);
      await connection.SendAsync(
          new ArraySegment<byte>(bytes),
          WebSocketMessageType.Text,
          true,
          CancellationToken.None
      );
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, $"Error sending WebSocket message to user {userId}");
      RemoveConnection(userId);
    }
  }

  public async Task BroadcastMessageAsync(string message)
  {
    var users = GetConnectedUsers().ToList();
    var tasks = users.Select(userId => SendMessageToUserAsync(userId, message));
    await Task.WhenAll(tasks);
  }
}
