using BookingApp.Domain.Entities;

namespace BookingApp.Domain.Interface;

public interface IReservationRepository
{
  Task<Reservation?> GetByIdAsync(int id);
  Task<bool> HasOverlappingAsync(int propertyId, DateOnly startDate, DateOnly endDate);
  Task AddAsync(Reservation reservation);
  Task UpdateAsync(Reservation reservation);
}