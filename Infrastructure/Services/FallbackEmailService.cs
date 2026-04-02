using BookingApp.Application.Intefaces.Services;
using Microsoft.Extensions.Logging;

namespace BookingApp.Infrastructure.Services;

public class FallbackEmailService : IEmailService
{
  private readonly ResendEmailService _primaryService;
  private readonly GmailEmailService _secondaryService;
  private readonly ILogger<FallbackEmailService> _logger;

  public FallbackEmailService(
      ResendEmailService primaryService,
      GmailEmailService secondaryService,
      ILogger<FallbackEmailService> logger)
  {
    _primaryService = primaryService;
    _secondaryService = secondaryService;
    _logger = logger;
  }

  public async Task SendEmailAsync(string to, string subject, string body)
  {
    try
    {
      _logger.LogInformation($"[FALLBACK MANAGER] Try to using email provider (Resend)...");

      await _primaryService.SendEmailAsync(to, subject, body);
    }
    catch (Exception ex)
    {
      _logger.LogWarning($"[FALLBACK MANAGER] Principal provider fail: {ex.Message}. Change to backup (Gmail)...");

      try
      {
        await _secondaryService.SendEmailAsync(to, subject, body);
      }
      catch (Exception fallbackEx)
      {
        _logger.LogCritical($"[FALLBACK MANAGER FATAL] Both provider fail sending email to {to}. Final Error: {fallbackEx.Message}");
        throw;
      }
    }
  }
}