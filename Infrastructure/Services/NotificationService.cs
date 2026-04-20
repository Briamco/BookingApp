using System.Text.Json;
using BookingApp.Application.Intefaces.Services;
using BookingApp.Domain.Entities;
using BookingApp.Domain.Enums;
using BookingApp.Domain.Interface;
using Microsoft.Extensions.Logging;
using System.Net;

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
      var emailBody = BuildEmailBody(title, message);

      _emailQueue.EnqueueEmail(userEmail, title, emailBody);
      _logger.LogInformation($"Email notification queued for user {userId} ({userEmail})");
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, $"Error queueing email notification for user {userId}");
    }
  }

  private static string BuildEmailBody(string title, string message)
  {
    if (IsHtmlContent(message))
      return message;

    var safeTitle = WebUtility.HtmlEncode(title);
    var safeMessage = WebUtility.HtmlEncode(message);

    return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"" />
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
  <title>{safeTitle}</title>
</head>
<body style=""margin:0;padding:0;background:#f4f8fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;"">
  <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""padding:24px 12px;"">
    <tr>
      <td align=""center"">
        <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""max-width:620px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #dbe7f2;"">
          <tr>
            <td style=""background:#1a5276;padding:20px 24px;color:#ffffff;"">
              <h2 style=""margin:0;font-size:21px;line-height:1.25;"">{safeTitle}</h2>
            </td>
          </tr>
          <tr>
            <td style=""padding:24px;"">
              <p style=""margin:0 0 16px 0;font-size:15px;line-height:1.7;"">{safeMessage}</p>
              <p style=""margin:0;font-size:12px;color:#6b7280;"">Sent on {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC</p>
            </td>
          </tr>
          <tr>
            <td style=""padding:16px 24px;background:#f8fbff;border-top:1px solid #e6edf4;font-size:12px;color:#6b7280;line-height:1.6;"">
              Comit • Smart stays, seamless reservations
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";
  }

  private static bool IsHtmlContent(string message)
  {
    if (string.IsNullOrWhiteSpace(message)) return false;

    return message.Contains("<html", StringComparison.OrdinalIgnoreCase)
      || message.Contains("<body", StringComparison.OrdinalIgnoreCase)
      || message.Contains("<table", StringComparison.OrdinalIgnoreCase)
      || message.Contains("<p", StringComparison.OrdinalIgnoreCase)
      || message.Contains("<a ", StringComparison.OrdinalIgnoreCase);
  }
}
