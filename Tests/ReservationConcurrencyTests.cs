using BookingApp.Application.DTOs;
using BookingApp.Application.Intefaces.Services;
using BookingApp.Domain.Entities;
using BookingApp.Domain.Interface;
using BookingApp.Infrastructure.Data;
using BookingApp.Infrastructure.Respositories;
using BookingApp.Infrastructure.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace BookingApp.Tests;

public class ReservationConcurrencyTests
{
  [Fact]
  public async Task ConcurrentReservationRequests_ShouldCreateOnlyOneReservation()
  {
    var connection = new SqliteConnection("Data Source=file:booking_concurrency?mode=memory&cache=shared");
    await connection.OpenAsync();

    var services = BuildServiceProvider(connection);
    await SeedDatabaseAsync(services);

    var startGate = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);

    async Task<ReservationResult> TryReserveAsync()
    {
      await startGate.Task;

      using var scope = services.CreateScope();
      var reservationService = scope.ServiceProvider.GetRequiredService<ReservationService>();
      var guestId = TestData.GuestId;

      try
      {
        var reservation = await reservationService.CreateReservationAsync(
          TestData.PropertyId,
          guestId,
          new CreateReservationRequest
          {
            StartDate = new DateOnly(2026, 5, 10),
            EndDate = new DateOnly(2026, 5, 14)
          }
        );

        return ReservationResult.Success(reservation.Id);
      }
      catch (Exception ex)
      {
        return ReservationResult.Failure(ex.Message);
      }
    }

    var first = TryReserveAsync();
    var second = TryReserveAsync();

    startGate.SetResult();

    var results = await Task.WhenAll(first, second);

    Assert.Equal(1, results.Count(r => r.Succeeded));
    Assert.Equal(1, results.Count(r => !r.Succeeded));
    Assert.Contains(results, r => !r.Succeeded && r.Error.Contains("no longer available", StringComparison.OrdinalIgnoreCase));

    using (var scope = services.CreateScope())
    {
      var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
      Assert.Equal(1, await db.Reservations.CountAsync());
    }

    await connection.DisposeAsync();
  }

  private static ServiceProvider BuildServiceProvider(SqliteConnection connection)
  {
    var services = new ServiceCollection();
    services.AddLogging();
    services.AddSingleton(connection);
    services.AddDbContext<AppDbContext>((provider, options) => options.UseSqlite(provider.GetRequiredService<SqliteConnection>()));
    services.AddScoped<IUserRepository, UserRepository>();
    services.AddScoped<IPropertyRepository, PropertyRepository>();
    services.AddScoped<IReservationRepository, ReservationRepository>();
    services.AddScoped<IBlockedRepository, BlockedDateRepository>();
    services.AddScoped<IReviewRepository, ReviewRepository>();
    services.AddScoped<INotificationRepository, NotificationRepository>();

    var emailQueue = new Mock<IEmailQueue>();
    emailQueue.Setup(q => q.EnqueueEmail(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()));
    services.AddSingleton(emailQueue.Object);

    var webSocketManager = new Mock<IWebSocketConnectionManager>();
    webSocketManager.Setup(m => m.SendMessageToUserAsync(It.IsAny<Guid>(), It.IsAny<string>())).Returns(Task.CompletedTask);
    webSocketManager.Setup(m => m.AddConnection(It.IsAny<Guid>(), It.IsAny<System.Net.WebSockets.WebSocket>()));
    webSocketManager.Setup(m => m.RemoveConnection(It.IsAny<Guid>()));
    services.AddSingleton(webSocketManager.Object);

    services.AddScoped<INotificationService, NotificationService>();
    services.AddScoped<ReservationService>();
    services.AddScoped<PropertyService>();

    return services.BuildServiceProvider();
  }

  private static async Task SeedDatabaseAsync(ServiceProvider services)
  {
    using var scope = services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();

    db.Users.AddRange(
      new User { Id = TestData.HostId, Email = "host@test.com", FirstName = "Host", LastName = "User", Password = "hash", IsConfirmed = true },
      new User { Id = TestData.GuestId, Email = "guest@test.com", FirstName = "Guest", LastName = "User", Password = "hash", IsConfirmed = true }
    );

    db.Properties.Add(new Property
    {
      Id = TestData.PropertyId,
      HostId = TestData.HostId,
      Title = "Cabin",
      Description = "Test property",
      NightPrice = 100,
      Latitude = 10,
      Longitude = 20,
      Capacity = 4,
      Location = new Location
      {
        City = "Santo Domingo",
        State = "N/A",
        Country = "DO"
      }
    });

    await db.SaveChangesAsync();
  }

  private static class TestData
  {
    public static readonly Guid HostId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid GuestId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly int PropertyId = 1;
  }

  private sealed record ReservationResult(bool Succeeded, int? ReservationId, string Error)
  {
    public static ReservationResult Success(int reservationId) => new(true, reservationId, string.Empty);
    public static ReservationResult Failure(string error) => new(false, null, error);
  }
}