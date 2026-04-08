using System.ComponentModel.DataAnnotations.Schema;
using BookingApp.Domain.Enums;

namespace BookingApp.Domain.Entities;

public class Reservation : Entity
{
  [Column("property_id")]
  public int PropertyId { get; set; }
  [Column("guest_id")]
  public Guid GuestId { get; set; }
  [Column("start_date")]
  public DateOnly StartDate { get; set; }
  [Column("end_date")]
  public DateOnly EndDate { get; set; }
  public string Status { get; set; } = ReservationStatus.Confimed;
  [Column("created_at")]
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  [ForeignKey("PropertyId")]
  public Property Property { get; set; } = null!;
  [ForeignKey("GuestId")]
  public User Guest { get; set; } = null!;
  public Review? Review { get; set; }

  public void Cancel()
  {
    if (Status == ReservationStatus.Completed)
      throw new InvalidOperationException("Reservation is completed");

    if (Status == ReservationStatus.Canceled)
      throw new InvalidOperationException("Reservation was canceled");

    Status = ReservationStatus.Canceled;
  }

  public void Complete()
  {
    if (Status == ReservationStatus.Canceled)
      throw new InvalidCastException("Reservation is canceled");

    if (Status == ReservationStatus.Completed)
      throw new InvalidCastException("Reservation was completed");

    Status = ReservationStatus.Completed;
  }
}