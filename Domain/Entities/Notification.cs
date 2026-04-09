using System.ComponentModel.DataAnnotations.Schema;
using BookingApp.Domain.Enums;

namespace BookingApp.Domain.Entities;

public class Notification : Entity
{
  [Column("user_id")]
  public Guid UserId { get; set; }
  public string Title { get; set; } = string.Empty;
  public string Message { get; set; } = string.Empty;
  [Column("is_read")]
  public bool IsRead { get; set; } = false;
  [Column("notification_type")]
  public NotificationType Type { get; set; } = NotificationType.Both;
  [Column("created_at")]
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  [ForeignKey("UserId")]
  public User User { get; set; } = null!;
}