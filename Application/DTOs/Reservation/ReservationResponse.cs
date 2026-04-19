using BookingApp.Application.DTOs;

namespace BookingApp.Application.DTOs.Reservation;

public class ReservationResponse
{
  public int Id { get; set; }
  public int PropertyId { get; set; }
  public string PropertyTitle { get; set; } = string.Empty;
  public Guid GuestId { get; set; }
  public DateOnly StartDate { get; set; }
  public DateOnly EndDate { get; set; }
  public string Status { get; set; } = string.Empty;
  public DateTime CreatedAt { get; set; }
  public ReviewResponse? Review { get; set; }
}