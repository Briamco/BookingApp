namespace BookingApp.Application.Intefaces.Services;

public interface IEmailQueue
{
  void EnqueueEmail(string to, string subject, string body);
}