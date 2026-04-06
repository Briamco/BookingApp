using System.ComponentModel.DataAnnotations.Schema;

namespace BookingApp.Domain.Entities;

public class Review : Entity
{
  public int ReservationId { get; set; }
  public Guid GuestId { get; set; }
  [Column("property_id")]
  public int PropertyId { get; set; }
  public int Rate { get; set; }
  public string Commentary { get; set; } = string.Empty;
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  public Reservation Reservation { get; set; } = null!;
  public User Guest { get; set; } = null!;
  [ForeignKey("PropertyId")]
  public Property Property { get; set; } = null!;
}