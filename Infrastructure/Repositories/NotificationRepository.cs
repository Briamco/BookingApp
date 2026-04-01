using BookingApp.Domain.Entities;
using BookingApp.Domain.Interface;
using BookingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookingApp.Infrastructure.Respositories;

public class NotificationRepository : INotificationRepository
{
  private readonly AppDbContext _context;

  public NotificationRepository(AppDbContext context) => _context = context;

  public async Task<Notification?> GetByIdAsync(int id)
  {
    return await _context.Notifications.FirstOrDefaultAsync(n => n.Id == id);
  }

  public async Task<IEnumerable<Notification>> GetByUserIdAsync(Guid userId, bool onlyUnread)
  {
    var query = _context.Notifications.Where(n => n.UserId == userId);

    if (onlyUnread)
      query = query.Where(n => !n.IsRead);

    return await query.OrderByDescending(n => n.CreatedAt).ToListAsync();
  }

  public async Task AddAsync(Notification notification)
  {
    await _context.Notifications.AddAsync(notification);
    await _context.SaveChangesAsync();
  }

  public async Task UpdateAsync(Notification notification)
  {
    _context.Notifications.Update(notification);
    await _context.SaveChangesAsync();
  }
}