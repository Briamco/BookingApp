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
  public ReservationStatus Status { get; set; } = ReservationStatus.Confimed;
  [Column("created_at")]
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  [ForeignKey("PropertyId")]
  public Property Property { get; set; } = null!;
  [ForeignKey("GuestId")]
  public User Guest { get; set; } = null!;

  public Review? Review { get; set; }
}