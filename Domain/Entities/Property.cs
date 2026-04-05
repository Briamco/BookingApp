namespace BookingApp.Domain.Entities;

public class Property : Entity
{
  public Guid HostId { get; set; }
  public string Title { get; set; } = string.Empty;
  public string Description { get; set; } = string.Empty;
  public decimal Latitude { get; set; }
  public decimal Longitude { get; set; }
  public decimal LocationId { get; set; }
  public double NightPrice { get; set; }
  public int Capacity { get; set; }

  public User Host { get; set; } = null!;
  public Location Location { get; set; } = null!;
  public ICollection<Image> Images { get; set; } = [];
  public ICollection<Reservation> Reservations { get; set; } = [];
  public ICollection<BlockedDate> BlockedDates { get; set; } = [];
  public ICollection<Review> Reviews { get; set; } = [];
}