using System.ComponentModel.DataAnnotations.Schema;

namespace BookingApp.Domain.Entities;

public class BlockedDate : Entity
{
  [Column("property_id")]
  public int PropertyId { get; set; }
  public DateOnly StartDate { get; set; }
  public DateOnly EndDate { get; set; }

  [ForeignKey("PropertyId")]
  public Property Property { get; set; } = null!;
}