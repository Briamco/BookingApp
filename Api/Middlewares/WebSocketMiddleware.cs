using BookingApp.Application.Intefaces.Services;
using Microsoft.AspNetCore.Connections;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.WebSockets;
using System.Security.Claims;

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

  public async Task InvokeAsync(
    HttpContext context,
    IWebSocketConnectionManager webSocketManager,
    IHostApplicationLifetime applicationLifetime
  )
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
            _logger.LogInformation("WebSocket connected for user: {UserId}", userId);

            using var shutdownLinkedCts = CancellationTokenSource.CreateLinkedTokenSource(
              context.RequestAborted,
              applicationLifetime.ApplicationStopping
            );
            var cancellationToken = shutdownLinkedCts.Token;

            var buffer = new byte[1024 * 4];
            while (webSocket.State == WebSocketState.Open)
            {
              var result = await webSocket.ReceiveAsync(
                new ArraySegment<byte>(buffer),
                cancellationToken
              );

              if (result.CloseStatus.HasValue)
              {
                break;
              }
            }

            if (webSocket.State == WebSocketState.Open || webSocket.State == WebSocketState.CloseReceived)
            {
              await webSocket.CloseAsync(
                WebSocketCloseStatus.NormalClosure,
                "Connection closed",
                CancellationToken.None
              );
            }
          }
          catch (OperationCanceledException) when (
            context.RequestAborted.IsCancellationRequested || applicationLifetime.ApplicationStopping.IsCancellationRequested
          )
          {
            _logger.LogInformation("WebSocket closed during cancellation/shutdown for user: {UserId}", userId);
          }
          catch (WebSocketException ex) when (
            context.RequestAborted.IsCancellationRequested ||
            applicationLifetime.ApplicationStopping.IsCancellationRequested ||
            ex.WebSocketErrorCode == WebSocketError.ConnectionClosedPrematurely ||
            ex.InnerException is ConnectionAbortedException
          )
          {
            _logger.LogInformation(ex, "WebSocket closed by remote peer for user: {UserId}", userId);
          }
          catch (Exception ex)
          {
            _logger.LogError(ex, "WebSocket error for user: {UserId}", userId);
          }
          finally
          {
            webSocketManager.RemoveConnection(userId);
            _logger.LogInformation("WebSocket disconnected for user: {UserId}", userId);
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
