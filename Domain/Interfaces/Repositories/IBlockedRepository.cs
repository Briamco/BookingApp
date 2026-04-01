using BookingApp.Domain.Entities;

namespace BookingApp.Domain.Interface;

public interface IBlockedRepository
{
  Task<bool> HasOverlappingAsync(int propertyId, DateOnly startDate, DateOnly endDate);
  Task AddAsync(BlockedDate blockedDate);
  Task UpdateAsync(BlockedDate blockedDate);
}