using System.Net;
using System.Net.Mail;
using BookingApp.Application.Intefaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BookingApp.Infrastructure.Services;

public class GmailEmailService : IEmailService
{
  private readonly IConfiguration _configuration;
  private readonly ILogger<GmailEmailService> _logger;

  public GmailEmailService(IConfiguration configuration, ILogger<GmailEmailService> logger)
  {
    _configuration = configuration;
    _logger = logger;
  }
  public async Task SendEmailAsync(string to, string subject, string body)
  {
    var emailOrigen = _configuration["SMTP_EMAIL"];
    var passwordApp = _configuration["SMTP_PASSWORD"];

    if (string.IsNullOrEmpty(emailOrigen) || string.IsNullOrEmpty(passwordApp))
    {
      _logger.LogError("Miss Credential of SMTP.");
      return;
    }

    try
    {
      using var smtpClient = new SmtpClient("smtp.gmail.com")
      {
        Port = 587,
        Credentials = new NetworkCredential(emailOrigen, passwordApp),
        EnableSsl = true
      };

      using var mailMessage = new MailMessage
      {
        From = new MailAddress(emailOrigen, "Comit"),
        Subject = subject,
        Body = body,
        IsBodyHtml = true
      };

      mailMessage.To.Add(to);

      await smtpClient.SendMailAsync(mailMessage);

      _logger.LogInformation($"[GMAIL SUCESS] Mail sended to {to}");
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, $"[GMAIL ERROR] Fail sending the mail to {to}");
      throw;
    }
  }
}