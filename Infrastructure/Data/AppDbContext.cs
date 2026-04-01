using BookingApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookingApp.Infrastructure.Data;

public class AppDbContext : DbContext
{
  public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

  public DbSet<User> Users { get; set; }
  public DbSet<Property> Properties { get; set; }
  public DbSet<Image> Images { get; set; }
  public DbSet<Reservation> Reservations { get; set; }
  public DbSet<BlockedDate> BlockedDates { get; set; }
  public DbSet<Review> Reviews { get; set; }
  public DbSet<Notification> Notifications { get; set; }

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<User>()
      .HasIndex(u => u.Email)
      .IsUnique();

    modelBuilder.Entity<Reservation>()
      .HasOne(r => r.Guest)
      .WithMany(u => u.Reservations)
      .HasForeignKey(r => r.GuestId)
      .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Review>()
      .HasIndex(r => r.ReservationId)
      .IsUnique();
  }
}