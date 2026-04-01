namespace BookingApp.Application.Intefaces.Services;

public interface IEmailService
{
  Task SendEmailAsync(string to, string subject, string body);
}