using BookingApp.Domain.Entities;

namespace BookingApp.Domain.Interface;

public interface IReviewRepository
{
  Task<Review?> GetByReservationIdAsync(int reservationId);
  Task AddAsync(Review review);
  Task<double> GetAverageRatingAsync(int propertyId);
}