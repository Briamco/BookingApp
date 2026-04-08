namespace BookingApp.Application.DTOs;

public class CreateReservationRequest
{
  public DateOnly StartDate { get; set; }
  public DateOnly EndDate { get; set; }
}