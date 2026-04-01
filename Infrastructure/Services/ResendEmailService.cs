using BookingApp.Application.Intefaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Resend;

namespace BookingApp.Infrastructure.Services;

public class ResendEmailService : IEmailService
{
  private readonly IResend _resend;
  private readonly IConfiguration _configuration;
  private readonly ILogger<ResendEmailService> _logger;

  public ResendEmailService(IResend resend, IConfiguration configuration, ILogger<ResendEmailService> logger)
  {
    _resend = resend;
    _configuration = configuration;
    _logger = logger;
  }

  public async Task SendEmailAsync(string to, string subject, string body)
  {
    var fromEmail = _configuration["RESEND_FROM_EMAIL"]!;

    var message = new EmailMessage
    {
      From = fromEmail,
      To = to,
      Subject = subject,
      HtmlBody = body
    };

    try
    {
      var response = await _resend.EmailSendAsync(message);

      if (response != null && response.Content != Guid.Empty)
        _logger.LogInformation($"[RESEND SUCESS] Email sended to {to}. ID of Resend: {response.Content}");
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, $"[RESEND ERROR] Email not sended to {to}.");
    }
  }
}