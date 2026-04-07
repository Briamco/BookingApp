using System.ComponentModel.DataAnnotations.Schema;

namespace BookingApp.Domain.Entities;

public class BlockedDate : Entity
{
  [Column("property_id")]
  public int PropertyId { get; set; }
  [Column("start_date")]
  public DateOnly StartDate { get; set; }
  [Column("end_date")]
  public DateOnly EndDate { get; set; }

  [ForeignKey("PropertyId")]
  public Property Property { get; set; } = null!;
}