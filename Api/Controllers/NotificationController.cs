using BookingApp.Application.DTOs;
using BookingApp.Application.Intefaces;
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
  private readonly IUserService _userService;

  public NotificationController(
      INotificationService notificationService,
      IUserService userService
  )
  {
    _notificationService = notificationService;
    _userService = userService;
  }

  [HttpGet("user/me")]
  public async Task<ActionResult<IEnumerable<NotificationResponse>>> GetUserNotifications(
      [FromQuery] bool onlyUnread = false
  )
  {
    var userId = _userService.GetUserId();
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
    var userId = _userService.GetUserId();
    var notification = await _notificationService.GetNotificationByIdAsync(id);
    if (notification == null || notification.UserId != userId)
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

  [HttpPut("{id}/read")]
  public async Task<ActionResult> MarkAsRead([FromRoute] int id)
  {
    var userId = _userService.GetUserId();
    var notification = await _notificationService.GetNotificationByIdAsync(id);
    if (notification == null || notification.UserId != userId)
      return NotFound("Notification not found");

    await _notificationService.MarkAsReadAsync(id);
    return NoContent();
  }
}
