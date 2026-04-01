namespace BookingApp.Domain.Entities;

public class User
{
  public Guid Id { get; set; }
  public string FirstName { get; set; } = string.Empty;
  public string LastName { get; set; } = string.Empty;
  public string Email { get; set; } = string.Empty;
  public string Phone { get; set; } = string.Empty;
  public string Password { get; set; } = string.Empty;
  public bool IsConfirmed { get; set; } = false;
  public string? ConfirmationToken { get; set; }
  public DateTime? TokenExpiresAt { get; set; }

  public ICollection<Property> Properties { get; set; } = [];
  public ICollection<Reservation> Reservations { get; set; } = [];
  public ICollection<Review> Reviews { get; set; } = [];
  public ICollection<Notification> Notifications { get; set; } = [];
}