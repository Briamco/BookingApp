using BookingApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookingApp.Infrastructure.Data;

public class AppDbContext : DbContext
{
  public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

  public DbSet<User> Users { get; set; }
  public DbSet<Location> Locations { get; set; }
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
      .ToTable("Users");

    modelBuilder.Entity<User>()
      .Property(u => u.FirstName)
      .HasColumnName("first_name");

    modelBuilder.Entity<User>()
      .Property(u => u.LastName)
      .HasColumnName("last_name");

    modelBuilder.Entity<User>()
      .Property(u => u.Password)
      .HasColumnName("password_hash");

    modelBuilder.Entity<User>()
      .Property(u => u.IsConfirmed)
      .HasColumnName("is_confirmed");

    modelBuilder.Entity<User>()
      .Property(u => u.ConfirmationToken)
      .HasColumnName("confirmation_token");

    modelBuilder.Entity<User>()
      .Property(u => u.TokenExpiresAt)
      .HasColumnName("token_expires_at");

    modelBuilder.Entity<User>()
      .HasIndex(u => u.Email)
      .IsUnique();

    modelBuilder.Entity<Reservation>()
      .HasOne(r => r.Guest)
      .WithMany(u => u.Reservations)
      .HasForeignKey(r => r.GuestId)
      .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Review>()
      .ToTable("Review");

    modelBuilder.Entity<Review>()
      .HasOne(r => r.Reservation)
      .WithOne(r => r.Review)
      .HasForeignKey<Review>(r => r.ReservationId);

    modelBuilder.Entity<Review>()
      .HasIndex(r => r.ReservationId)
      .IsUnique();
  }
}