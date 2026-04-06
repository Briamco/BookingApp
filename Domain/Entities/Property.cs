using System.ComponentModel.DataAnnotations.Schema;

namespace BookingApp.Domain.Entities;

public class Property : Entity
{
  [Column("host_id")]
  public Guid HostId { get; set; }
  public string Title { get; set; } = string.Empty;
  public string Description { get; set; } = string.Empty;
  public decimal Latitude { get; set; }
  public decimal Longitude { get; set; }
  [Column("location_id")]
  public int LocationId { get; set; }
  [Column("night_price")]
  public decimal NightPrice { get; set; }
  public int Capacity { get; set; }

  [ForeignKey("HostId")]
  public User Host { get; set; } = null!;
  [ForeignKey("LocationId")]
  public Location Location { get; set; } = null!;
  public ICollection<Image> Images { get; set; } = [];
  public ICollection<Reservation> Reservations { get; set; } = [];
  public ICollection<BlockedDate> BlockedDates { get; set; } = [];
  public ICollection<Review> Reviews { get; set; } = [];
}