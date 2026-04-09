namespace BookingApp.Application.DTOs;

public class ReviewResponse
{
  public int Id { get; set; }
  public int ReservationId { get; set; }
  public int PropertyId { get; set; }
  public Guid GuestId { get; set; }
  public int Rate { get; set; }
  public string Commentary { get; set; } = string.Empty;
  public DateTime CreatedAt { get; set; }
}
