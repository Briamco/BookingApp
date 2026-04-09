namespace BookingApp.Application.DTOs.Property;

public class PropertyDetailResponse
{
  public int Id { get; set; }
  public Guid HostId { get; set; }
  public string Title { get; set; } = string.Empty;
  public string Description { get; set; } = string.Empty;
  public decimal NightPrice { get; set; }
  public int Capacity { get; set; }
  public decimal Latitude { get; set; }
  public decimal Longitude { get; set; }
  public string City { get; set; } = string.Empty;
  public string State { get; set; } = string.Empty;
  public string Country { get; set; } = string.Empty;
  public double AverageRating { get; set; }
  public ICollection<PropertyReservationResponse> Reservations { get; set; } = [];
  public ICollection<PropertyBlockedDateResponse> BlockedDates { get; set; } = [];
  public ICollection<Domain.Entities.Image> Images { get; set; } = [];
}