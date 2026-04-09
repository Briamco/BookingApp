using BookingApp.Domain.Entities;
using BookingApp.Domain.Enums;
using BookingApp.Domain.Interface;
using BookingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookingApp.Infrastructure.Respositories;

public class ReservationRepository : IReservationRepository
{
  private readonly AppDbContext _context;

  public ReservationRepository(AppDbContext context) => _context = context;

  public async Task<Reservation?> GetByIdAsync(int id)
  {
    return await _context.Reservations.FirstOrDefaultAsync(r => r.Id == id);
  }

  public async Task<bool> HasOverlappingAsync(int propertyId, DateOnly startDate, DateOnly endDate)
  {
    return await _context.Reservations.AnyAsync(r =>
      r.PropertyId == propertyId &&
      r.Status == ReservationStatus.Confimed &&
      r.StartDate < endDate &&
      r.EndDate > startDate
    ) || await _context.BlockedDates.AnyAsync(b =>
      b.PropertyId == propertyId &&
      b.StartDate < endDate &&
      b.EndDate > startDate
    );
  }

  public async Task<IEnumerable<Reservation>> GetReservationsToCompleteAsync(DateOnly currentDate)
  {
    return await _context.Reservations
            .Where(r => r.Status == ReservationStatus.Confimed && r.EndDate < currentDate)
            .ToListAsync();
  }

  public async Task AddAsync(Reservation reservation)
  {
    await _context.Reservations.AddAsync(reservation);
    await _context.SaveChangesAsync();
  }

  public async Task UpdateAsync(Reservation reservation)
  {
    _context.Reservations.Update(reservation);
    await _context.SaveChangesAsync();
  }
}