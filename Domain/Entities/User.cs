using System.ComponentModel.DataAnnotations.Schema;

namespace BookingApp.Domain.Entities;

public class User
{
  public Guid Id { get; set; }
  [Column("first_name")]
  public string FirstName { get; set; } = string.Empty;
  [Column("last_name")]
  public string LastName { get; set; } = string.Empty;
  public string Email { get; set; } = string.Empty;
  public string Phone { get; set; } = string.Empty;
  public string Password { get; set; } = string.Empty;
  [Column("is_confirmed")]
  public bool IsConfirmed { get; set; } = false;
  [Column("confirmation_token")]
  public string? ConfirmationToken { get; set; }
  [Column("token_expires_at")]
  public DateTime? TokenExpiresAt { get; set; }

  public ICollection<Property> Properties { get; set; } = [];
  public ICollection<Reservation> Reservations { get; set; } = [];
  public ICollection<Review> Reviews { get; set; } = [];
  public ICollection<Notification> Notifications { get; set; } = [];
}