namespace BookingApp.Application.DTOs.Property;

public class PropertyReservationResponse
{
  public int Id { get; set; }
  public Guid GuestId { get; set; }
  public DateOnly StartDate { get; set; }
  public DateOnly EndDate { get; set; }
  public string Status { get; set; } = string.Empty;
  public DateTime CreatedAt { get; set; }
}