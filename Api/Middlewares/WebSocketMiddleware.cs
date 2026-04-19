using BookingApp.Application.Intefaces.Services;
using System.Security.Claims;
using System.Net;
using System.IdentityModel.Tokens.Jwt;

namespace BookingApp.Api.Middlewares;

public class WebSocketMiddleware
{
  private readonly RequestDelegate _next;
  private readonly ILogger<WebSocketMiddleware> _logger;

  public WebSocketMiddleware(RequestDelegate next, ILogger<WebSocketMiddleware> logger)
  {
    _next = next;
    _logger = logger;
  }

  public async Task InvokeAsync(HttpContext context, IWebSocketConnectionManager webSocketManager)
  {
    if (context.Request.Path.StartsWithSegments("/api/notification/ws"))
    {
      if (context.User?.Identity?.IsAuthenticated != true)
      {
        context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
        return;
      }

      if (context.WebSockets.IsWebSocketRequest)
      {
        // Extract userId from the path
        var pathSegments = context.Request.Path.Value?.Split('/') ?? Array.Empty<string>();
        if (pathSegments.Length > 0 && Guid.TryParse(pathSegments[^1], out var userId))
        {
          var authenticatedUserId =
            context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            context.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

          if (!string.IsNullOrWhiteSpace(authenticatedUserId) &&
              Guid.TryParse(authenticatedUserId, out var currentUserId) &&
              currentUserId != userId)
          {
            context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
            return;
          }

          try
          {
            using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            webSocketManager.AddConnection(userId, webSocket);
            _logger.LogInformation($"WebSocket connected for user: {userId}");

            var buffer = new byte[1024 * 4];
            var result = await webSocket.ReceiveAsync(
                new ArraySegment<byte>(buffer),
                CancellationToken.None
            );

            while (!result.CloseStatus.HasValue)
            {
              result = await webSocket.ReceiveAsync(
                  new ArraySegment<byte>(buffer),
                  CancellationToken.None
              );
            }

            await webSocket.CloseAsync(
                result.CloseStatus.Value,
                result.CloseStatusDescription,
                CancellationToken.None
            );

            webSocketManager.RemoveConnection(userId);
            _logger.LogInformation($"WebSocket disconnected for user: {userId}");
          }
          catch (Exception ex)
          {
            _logger.LogError(ex, $"WebSocket error for user: {userId}");
            webSocketManager.RemoveConnection(userId);
          }

          return;
        }
      }

      context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
      return;
    }

    await _next(context);
  }
}
