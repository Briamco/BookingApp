namespace BookingApp.Application.DTOs;

public class CreateReviewRequest
{
  public int Rate { get; set; }
  public string Commentary { get; set; } = string.Empty;
}
