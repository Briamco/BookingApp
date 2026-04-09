using BookingApp.Application.DTOs;
using BookingApp.Domain.Entities;
using BookingApp.Domain.Enums;
using BookingApp.Domain.Interface;

namespace BookingApp.Infrastructure.Services;

public class ReviewService
{
  private readonly IReviewRepository _reviewRepo;
  private readonly IReservationRepository _reservationRepo;

  public ReviewService(IReviewRepository reviewRepo, IReservationRepository reservationRepo)
  {
    _reviewRepo = reviewRepo;
    _reservationRepo = reservationRepo;
  }

  public async Task<ReviewResponse> CreateReviewAsync(int reservationId, Guid currentUserId, CreateReviewRequest request)
  {
    if (request.Rate < 1 || request.Rate > 5)
      throw new InvalidOperationException("Rate must be between 1 and 5.");

    var reservation = await _reservationRepo.GetByIdAsync(reservationId)
      ?? throw new Exception("Reservation not found.");

    if (reservation.GuestId != currentUserId)
      throw new UnauthorizedAccessException("You can only review your own reservation.");

    if (reservation.Status != ReservationStatus.Completed)
      throw new InvalidOperationException("Only completed reservations can be reviewed.");

    var existingReview = await _reviewRepo.GetByReservationIdAsync(reservationId);
    if (existingReview is not null)
      throw new InvalidOperationException("This reservation already has a review.");

    var review = new Review
    {
      ReservationId = reservationId,
      GuestId = currentUserId,
      Rate = request.Rate,
      Commentary = request.Commentary.Trim()
    };

    await _reviewRepo.AddAsync(review);

    return new ReviewResponse
    {
      Id = review.Id,
      ReservationId = review.ReservationId,
      PropertyId = reservation.PropertyId,
      GuestId = review.GuestId,
      Rate = review.Rate,
      Commentary = review.Commentary,
      CreatedAt = review.CreatedAt
    };
  }
}
