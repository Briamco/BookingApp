using System.ComponentModel.DataAnnotations.Schema;

namespace BookingApp.Domain.Entities;

public class Image : Entity
{
  [Column("property_id")]
  public int PropertyId { get; set; }
  public string Url { get; set; } = string.Empty;
  public int Order { get; set; }

  [ForeignKey("PropertyId")]
  public Property Property { get; set; } = null!;
}