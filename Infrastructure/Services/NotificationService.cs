using System.Text.Json;
using BookingApp.Application.Intefaces.Services;
using BookingApp.Domain.Entities;
using BookingApp.Domain.Enums;
using BookingApp.Domain.Interface;
using Microsoft.Extensions.Logging;

namespace BookingApp.Infrastructure.Services;

public class NotificationService : INotificationService
{
  private readonly INotificationRepository _notificationRepository;
  private readonly IWebSocketConnectionManager _webSocketManager;
  private readonly IEmailQueue _emailQueue;
  private readonly IUserRepository _userRepository;
  private readonly ILogger<NotificationService> _logger;

  public NotificationService(
      INotificationRepository notificationRepository,
      IWebSocketConnectionManager webSocketManager,
      IEmailQueue emailQueue,
      IUserRepository userRepository,
      ILogger<NotificationService> logger
  )
  {
    _notificationRepository = notificationRepository;
    _webSocketManager = webSocketManager;
    _emailQueue = emailQueue;
    _userRepository = userRepository;
    _logger = logger;
  }

  public async Task<Notification> CreateNotificationAsync(
      Guid userId,
      string title,
      string message,
      NotificationType type
  )
  {
    var notification = new Notification
    {
      UserId = userId,
      Title = title,
      Message = message,
      Type = type
    };

    await _notificationRepository.AddAsync(notification);

    // Send notification based on type
    if (type == NotificationType.Push || type == NotificationType.Both)
    {
      await SendPushNotificationAsync(userId, title, message);
    }

    if (type == NotificationType.Email || type == NotificationType.Both)
    {
      var user = await _userRepository.GetByIdAsync(userId);
      if (user != null)
      {
        await SendEmailNotificationAsync(userId, title, message, user.Email);
      }
    }

    return notification;
  }

  public async Task<IEnumerable<Notification>> GetNotificationsByUserAsync(
      Guid userId,
      bool onlyUnread = false
  )
  {
    return await _notificationRepository.GetByUserIdAsync(userId, onlyUnread);
  }

  public async Task<Notification?> GetNotificationByIdAsync(int id)
  {
    return await _notificationRepository.GetByIdAsync(id);
  }

  public async Task MarkAsReadAsync(int notificationId)
  {
    var notification = await _notificationRepository.GetByIdAsync(notificationId);
    if (notification != null)
    {
      notification.IsRead = true;
      await _notificationRepository.UpdateAsync(notification);
      _logger.LogInformation($"Notification {notificationId} marked as read");
    }
  }

  public async Task SendPushNotificationAsync(Guid userId, string title, string message)
  {
    try
    {
      var pushMessage = new
      {
        type = "notification",
        title = title,
        message = message,
        timestamp = DateTime.UtcNow
      };

      var jsonMessage = JsonSerializer.Serialize(pushMessage);
      await _webSocketManager.SendMessageToUserAsync(userId, jsonMessage);
      _logger.LogInformation($"Push notification sent to user {userId}");
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, $"Error sending push notification to user {userId}");
    }
  }

  public async Task SendEmailNotificationAsync(
      Guid userId,
      string title,
      string message,
      string userEmail
  )
  {
    try
    {
      var emailBody = $@"
                <h2>{title}</h2>
                <p>{message}</p>
                <p>Received at: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}</p>
            ";

      _emailQueue.EnqueueEmail(userEmail, title, emailBody);
      _logger.LogInformation($"Email notification queued for user {userId} ({userEmail})");
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, $"Error queueing email notification for user {userId}");
    }
  }
}
