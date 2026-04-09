using System.ComponentModel;
using BookingApp.Infrastructure.Services;
using BookingApp.Domain.Interface;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BookingApp.Infrastructure.BackgroundJobs;

public class ReservationCompletionWorker : BackgroundService
{
  private readonly IServiceProvider _serviceProvider;
  private readonly ILogger<ReservationCompletionWorker> _logger;

  public ReservationCompletionWorker(
        IServiceProvider serviceProvider,
        ILogger<ReservationCompletionWorker> logger)
  {
    _serviceProvider = serviceProvider;
    _logger = logger;
  }

  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    _logger.LogInformation("Worker completing reservation started.");

    using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));

    while (await timer.WaitForNextTickAsync(stoppingToken))
      await DoWorkAsync();
  }

  private async Task DoWorkAsync()
  {
    try
    {
      using var scope = _serviceProvider.CreateScope();

      var reservationRepo = scope.ServiceProvider.GetRequiredService<IReservationRepository>();
      var propertyRepo = scope.ServiceProvider.GetRequiredService<IPropertyRepository>();
      var reservationService = scope.ServiceProvider.GetRequiredService<ReservationService>();

      var today = DateOnly.FromDateTime(DateTime.UtcNow);
      var reservationsToComplete = await reservationRepo.GetReservationsToCompleteAsync(today);

      int count = 0;
      foreach (var reservation in reservationsToComplete)
      {
        try
        {
          var property = await propertyRepo.GetByIdAsync(reservation.PropertyId);
          if (property == null)
            continue;

          await reservationService.CompleteReservationAsync(reservation.Id, property.HostId);
          count++;
        }
        catch (Exception ex)
        {
          _logger.LogError(ex, $"Could not complete reservation {reservation.Id}");
        }
      }

      if (count > 0)
        _logger.LogInformation($"{count} reservations completed.");
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, $"Something went wrong completing reservation on background job");
    }
  }
}