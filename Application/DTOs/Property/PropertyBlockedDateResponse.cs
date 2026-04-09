namespace BookingApp.Application.DTOs.Property;

public class PropertyBlockedDateResponse
{
  public int Id { get; set; }
  public DateOnly StartDate { get; set; }
  public DateOnly EndDate { get; set; }
}