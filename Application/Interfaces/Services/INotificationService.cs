using BookingApp.Domain.Entities;
using BookingApp.Domain.Enums;

namespace BookingApp.Application.Intefaces.Services;

public interface INotificationService
{
  Task<Notification> CreateNotificationAsync(Guid userId, string title, string message, NotificationType type);
  Task<IEnumerable<Notification>> GetNotificationsByUserAsync(Guid userId, bool onlyUnread = false);
  Task<Notification?> GetNotificationByIdAsync(int id);
  Task MarkAsReadAsync(int notificationId);
  Task SendPushNotificationAsync(Guid userId, string title, string message);
  Task SendEmailNotificationAsync(Guid userId, string title, string message, string userEmail);
}
