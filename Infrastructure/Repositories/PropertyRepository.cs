using BookingApp.Domain.Entities;
using BookingApp.Domain.Enums;
using BookingApp.Domain.Interface;
using BookingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookingApp.Infrastructure.Respositories;

public class PropertyRepository : IPropertyRepository
{
  private readonly AppDbContext _context;

  public PropertyRepository(AppDbContext context) => _context = context;

  public async Task<Property?> GetByIdAsync(int id)
  {
    return await _context.Properties
      .Include(p => p.Images)
      .Include(p => p.Location)
      .Include(p => p.BlockedDates)
      .Include(p => p.Reservations)
      .AsSplitQuery()
      .FirstOrDefaultAsync(p => p.Id == id);
  }

  public async Task<IEnumerable<Property>> SearchAvaibleAsync(string? location, decimal? maxPrice, int? capacity, DateOnly? startDate, DateOnly? endDate)
  {
    var query = _context.Properties
      .Include(p => p.Location)
      .Include(p => p.Images)
      .Include(p => p.Reservations)
      .Include(p => p.BlockedDates)
      .AsQueryable();

    if (!string.IsNullOrEmpty(location))
      query = query.Where(p =>
        p.Location.City.Contains(location) ||
        p.Location.State.Contains(location) ||
        p.Location.Country.Contains(location) ||
        p.Title.Contains(location) ||
        p.Description.Contains(location)
      );

    if (maxPrice.HasValue)
      query = query.Where(p => p.NightPrice <= maxPrice.Value);

    if (capacity.HasValue)
      query = query.Where(p => p.Capacity >= capacity.Value);

    if (startDate.HasValue && endDate.HasValue)
    {
      query = query.Where(p =>
        !p.Reservations.Any(r =>
          r.Status == ReservationStatus.Confimed &&
          r.StartDate < endDate.Value &&
          r.EndDate > startDate.Value
        ) &&
        !p.BlockedDates.Any(b =>
          b.StartDate < endDate.Value &&
          b.EndDate > startDate.Value
        )
      );
    }

    return await query.ToListAsync();
  }

  public async Task AddAsync(Property property)
  {
    await _context.Properties.AddAsync(property);
    await _context.SaveChangesAsync();
  }

  public async Task UpdateAsync(Property property)
  {
    _context.Properties.Update(property);
    await _context.SaveChangesAsync();
  }

  public async Task DeleteAsync(Property property)
  {
    _context.Properties.Remove(property);
    await _context.SaveChangesAsync();
  }
}