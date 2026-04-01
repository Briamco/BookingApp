using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using BookingApp.Infrastructure.Services;
using Moq;
using Resend;

namespace BookingApp.Tests;

public class ResendEmailServiceTests
{
  [Fact]
  public async Task SendEmailAsync()
  {
    var mockResendClient = new Mock<IResend>();

    var mockConfig = new Mock<IConfiguration>();
    mockConfig.Setup(c => c["RESEND_FROM_EMAIL"]).Returns("onboarding@resend.dev");

    var mockLogger = new Mock<ILogger<ResendEmailService>>();

    var emailService = new ResendEmailService(
      mockResendClient.Object,
      mockConfig.Object,
      mockLogger.Object
      );

    string to = "user@test.com";
    string subject = "This is a test";
    string body = "This is a text of testing email sending";

    await emailService.SendEmailAsync(to, subject, body);

    mockResendClient.Verify(resend => resend.EmailSendAsync(
      It.Is<EmailMessage>(msg =>
          msg.To.Contains(to) &&
          msg.Subject == subject &&
          msg.HtmlBody == body &&
          msg.From.Email == "onboarding@resend.dev"
      ),
      default
    ));

  }
}