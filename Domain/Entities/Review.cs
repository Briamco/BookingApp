using System.ComponentModel.DataAnnotations.Schema;

namespace BookingApp.Domain.Entities;

public class Review : Entity
{
  [Column("reservation_id")]
  public int ReservationId { get; set; }
  [Column("guest_id")]
  public Guid GuestId { get; set; }
  public int Rate { get; set; }
  public string Commentary { get; set; } = string.Empty;
  [Column("created_at")]
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  [ForeignKey("ReservationId")]
  public Reservation Reservation { get; set; } = null!;
  [ForeignKey("GuestId")]
  public User Guest { get; set; } = null!;
}