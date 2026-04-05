namespace BookingApp.Domain.Entities;

public class Location : Entity
{
  public string City { get; set; } = string.Empty;
  public string State { get; set; } = string.Empty;
  public string Country { get; set; } = string.Empty;
}