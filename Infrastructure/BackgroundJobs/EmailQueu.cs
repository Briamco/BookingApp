using System.Threading.Channels;
using BookingApp.Application.Intefaces.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;


namespace BookingApp.Infrastructure.BackgroundJobs;

public class EmailQueue : IEmailQueue
{
  private readonly Channel<(string To, string Subject, string Body)> _queue;

  public EmailQueue()
    => _queue = Channel.CreateUnbounded<(string, string, string)>();

  public void EnqueueEmail(string to, string subject, string body)
    => _queue.Writer.TryWrite((to, subject, body));

  public ChannelReader<(string To, string Subject, string Body)> GetReader()
    => _queue.Reader;
}

public class EmailBackgroundWorker : BackgroundService
{
  private readonly EmailQueue _emailQueue;
  private readonly IServiceProvider _serviceProvider;
  private readonly ILogger<EmailBackgroundWorker> _logger;

  public EmailBackgroundWorker(EmailQueue emailQueue, IServiceProvider serviceProvider, ILogger<EmailBackgroundWorker> logger)
  {
    _emailQueue = emailQueue;
    _serviceProvider = serviceProvider;
    _logger = logger;
  }

  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    await foreach (var email in _emailQueue.GetReader().ReadAllAsync(stoppingToken))
    {
      try
      {
        using var scope = _serviceProvider.CreateScope();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        await emailService.SendEmailAsync(email.To, email.Subject, email.Body);
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, $"[BACKGROUND JOB ERROR] sended email to {email.To}.");
      }
    }
  }

}