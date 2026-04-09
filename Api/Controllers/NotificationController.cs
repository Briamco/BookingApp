using System.Net;
using System.Net.WebSockets;
using BookingApp.Application.DTOs;
using BookingApp.Application.Intefaces.Services;
using BookingApp.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookingApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
  private readonly INotificationService _notificationService;
  private readonly IWebSocketConnectionManager _webSocketManager;
  private readonly ILogger<NotificationController> _logger;

  public NotificationController(
      INotificationService notificationService,
      IWebSocketConnectionManager webSocketManager,
      ILogger<NotificationController> logger
  )
  {
    _notificationService = notificationService;
    _webSocketManager = webSocketManager;
    _logger = logger;
  }

  [HttpGet("user/{userId}")]
  public async Task<ActionResult<IEnumerable<NotificationResponse>>> GetUserNotifications(
      [FromRoute] Guid userId,
      [FromQuery] bool onlyUnread = false
  )
  {
    var notifications = await _notificationService.GetNotificationsByUserAsync(userId, onlyUnread);
    var responses = notifications.Select(n => new NotificationResponse
    {
      Id = n.Id,
      UserId = n.UserId,
      Title = n.Title,
      Message = n.Message,
      IsRead = n.IsRead,
      Type = (int)n.Type,
      CreatedAt = n.CreatedAt
    });

    return Ok(responses);
  }

  [HttpGet("{id}")]
  public async Task<ActionResult<NotificationResponse>> GetNotification([FromRoute] int id)
  {
    var notification = await _notificationService.GetNotificationByIdAsync(id);
    if (notification == null)
      return NotFound("Notification not found");

    return Ok(new NotificationResponse
    {
      Id = notification.Id,
      UserId = notification.UserId,
      Title = notification.Title,
      Message = notification.Message,
      IsRead = notification.IsRead,
      Type = (int)notification.Type,
      CreatedAt = notification.CreatedAt
    });
  }

  [HttpPost]
  public async Task<ActionResult<NotificationResponse>> CreateNotification(
      [FromBody] CreateNotificationRequest request
  )
  {
    if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Message))
      return BadRequest("Title and message are required");

    var type = (NotificationType)request.Type;
    var notification = await _notificationService.CreateNotificationAsync(
        request.UserId,
        request.Title,
        request.Message,
        type
    );

    return CreatedAtAction(
        nameof(GetNotification),
        new { id = notification.Id },
        new NotificationResponse
        {
          Id = notification.Id,
          UserId = notification.UserId,
          Title = notification.Title,
          Message = notification.Message,
          IsRead = notification.IsRead,
          Type = (int)notification.Type,
          CreatedAt = notification.CreatedAt
        }
    );
  }

  [HttpPut("{id}/read")]
  public async Task<ActionResult> MarkAsRead([FromRoute] int id)
  {
    var notification = await _notificationService.GetNotificationByIdAsync(id);
    if (notification == null)
      return NotFound("Notification not found");

    await _notificationService.MarkAsReadAsync(id);
    return NoContent();
  }

  [HttpGet("ws/{userId}")]
  public async Task WebSocketConnection([FromRoute] Guid userId)
  {
    if (HttpContext.WebSockets.IsWebSocketRequest)
    {
      try
      {
        using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
        _webSocketManager.AddConnection(userId, webSocket);

        // Keep the connection open and listen for messages
        var buffer = new byte[1024 * 4];
        WebSocketReceiveResult result = await webSocket.ReceiveAsync(
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

        _webSocketManager.RemoveConnection(userId);
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, $"WebSocket error for user {userId}");
        _webSocketManager.RemoveConnection(userId);
      }
    }
    else
    {
      HttpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;
    }
  }
}
