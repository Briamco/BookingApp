using BookingApp.Domain.Entities;

namespace BookingApp.Domain.Interface;

public interface INotificationRepository
{
  Task<Notification?> GetByIdAsync(int id);
  Task<IEnumerable<Notification>> GetByUserIdAsync(Guid userId, bool onlyUnread);
  Task AddAsync(Notification notification);
  Task UpdateAsync(Notification notification);
}