using BookingApp.Domain.Entities;

namespace BookingApp.Application.DTOs.Property;

public class PropertyResponse
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
  public ICollection<Image> Images { get; set; } = [];
}