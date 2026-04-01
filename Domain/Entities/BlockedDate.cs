namespace BookingApp.Domain.Entities;

public class BlockedDate : Entity
{
  public int PropertyId { get; set; }
  public DateOnly StartDate { get; set; }
  public DateOnly EndDate { get; set; }

  public Property Property { get; set; } = null!;
}