using BookingApp.Domain.Entities;
using BookingApp.Domain.Interface;
using BookingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookingApp.Infrastructure.Respositories;

public class ReviewRepository : IReviewRepository
{
  private readonly AppDbContext _context;

  public ReviewRepository(AppDbContext context) => _context = context;

  public async Task AddAsync(Review review)
  {
    await _context.Reviews.AddAsync(review);
    await _context.SaveChangesAsync();
  }

  public async Task<double> GetAverageRatingAsync(int propertyId)
  {
    var reviews = _context.Reviews.Where(r => r.PropertyId == propertyId);
    if (!await reviews.AnyAsync()) return 0;

    return await reviews.AverageAsync(r => r.Rate);
  }
}