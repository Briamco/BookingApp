namespace BookingApp.Application.DTOs;

public class NotificationResponse
{
  public int Id { get; set; }
  public Guid UserId { get; set; }
  public string Title { get; set; } = string.Empty;
  public string Message { get; set; } = string.Empty;
  public bool IsRead { get; set; }
  public int Type { get; set; }
  public DateTime CreatedAt { get; set; }
}
