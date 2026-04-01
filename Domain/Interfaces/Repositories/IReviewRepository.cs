using BookingApp.Domain.Entities;

namespace BookingApp.Domain.Interface;

public interface IReviewRepository
{
  Task AddAsync(Review review);
  Task<double> GetAverageRatingAsync(int propertyId);
}