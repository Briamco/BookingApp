namespace BookingApp.Domain.Entities;

public class Image : Entity
{
  public int PropertyId { get; set; }
  public string Url { get; set; } = string.Empty;
  public int Order { get; set; }

  public Property Property { get; set; } = null!;
}