namespace BookingApp.Application.DTOs;

public class PublicUserResponse
{
  public Guid Id { get; set; }
  public string FirstName { get; set; } = string.Empty;
  public string LastName { get; set; } = string.Empty;
  public string Phone { get; set; } = string.Empty;
}