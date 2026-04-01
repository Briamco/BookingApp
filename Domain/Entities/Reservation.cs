using BookingApp.Domain.Enums;

namespace BookingApp.Domain.Entities;

public class Reservation : Entity
{
  public int PropertyId { get; set; }
  public Guid GuestId { get; set; }
  public DateOnly StartDate { get; set; }
  public DateOnly EndDate { get; set; }
  public ReservationStatus Status { get; set; } = ReservationStatus.Confimed;
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  public Property Property { get; set; } = null!;
  public User Guest { get; set; } = null!;

  public Review? Review { get; set; }
}