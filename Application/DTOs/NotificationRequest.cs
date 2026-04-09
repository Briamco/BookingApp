namespace BookingApp.Application.DTOs;

public class CreateNotificationRequest
{
  public string Title { get; set; } = string.Empty;
  public string Message { get; set; } = string.Empty;
  public int Type { get; set; } // 0: Email, 1: Push, 2: Both
}

public class MarkNotificationAsReadRequest
{
  public int NotificationId { get; set; }
}
