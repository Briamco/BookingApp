using BookingApp.Domain.Entities;
using BookingApp.Domain.Interface;
using BookingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookingApp.Infrastructure.Respositories;

public class BlockedDateRepository : IBlockedRepository
{
  private readonly AppDbContext _context;

  public BlockedDateRepository(AppDbContext context) => _context = context;

  public async Task<bool> HasOverlappingAsync(int propertyId, DateOnly startDate, DateOnly endDate)
  {
    return await _context.BlockedDates.AnyAsync(b =>
      b.PropertyId == propertyId &&
      b.StartDate < endDate &&
      b.EndDate > startDate
    );
  }

  public async Task AddAsync(BlockedDate blockedDate)
  {
    await _context.BlockedDates.AddAsync(blockedDate);
    await _context.SaveChangesAsync();
  }

  public async Task UpdateAsync(BlockedDate blockedDate)
  {
    _context.BlockedDates.Remove(blockedDate);
    await _context.SaveChangesAsync();
  }
}