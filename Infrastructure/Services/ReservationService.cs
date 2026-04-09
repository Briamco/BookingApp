using BookingApp.Application.DTOs;
using BookingApp.Application.Intefaces.Services;
using BookingApp.Domain.Entities;
using BookingApp.Domain.Enums;
using BookingApp.Domain.Interface;

namespace BookingApp.Infrastructure.Services;

public class ReservationService
{
  private readonly IReservationRepository _reservationRepo;
  private readonly IPropertyRepository _propertyRepository;
  private readonly INotificationService _notificationService;

  public ReservationService(
    IReservationRepository reservationRepo,
    IPropertyRepository propertyRepository,
    INotificationService notificationService
  )
  {
    _reservationRepo = reservationRepo;
    _propertyRepository = propertyRepository;
    _notificationService = notificationService;
  }

  public async Task<Reservation?> GetReservationByIdAsync(int id)
    => await _reservationRepo.GetByIdAsync(id);

  public async Task CancelReservationAsync(int reservationId, Guid currentUser)
  {
    var reservation = await _reservationRepo.GetByIdAsync(reservationId)
      ?? throw new Exception("Reservation not found");

    if (reservation.GuestId != currentUser)
      throw new UnauthorizedAccessException("Just the guest can cancel the reservation.");

    var property = await _propertyRepository.GetByIdAsync(reservation.PropertyId)
      ?? throw new Exception("Property not found.");

    reservation.Cancel();

    await _reservationRepo.UpdateAsync(reservation);

    await _notificationService.CreateNotificationAsync(
      reservation.GuestId,
      "Reservation Cancelled",
      $"Your reservation for {property.Title} has been cancelled.",
      NotificationType.Both
    );

    await _notificationService.CreateNotificationAsync(
      property.HostId,
      "Reservation Cancelled",
      $"The reservation for {property.Title} has been cancelled.",
      NotificationType.Email
    );
  }

  public async Task<Reservation> CreateReservationAsync(int propertyId, Guid guestId, CreateReservationRequest request)
  {
    if (request.StartDate < DateOnly.FromDateTime(DateTime.UtcNow))
      throw new Exception("Cant reserve at the past.");

    if (request.EndDate <= request.StartDate)
      throw new Exception("End date have to be before the start date.");

    var property = await _propertyRepository.GetByIdAsync(propertyId)
      ?? throw new Exception("Property not found.");

    if (property.HostId == guestId)
      throw new UnauthorizedAccessException("You cant reservate your own property.");

    bool isBooked = await _reservationRepo.HasOverlappingAsync(propertyId, request.StartDate, request.EndDate);

    if (isBooked)
      throw new InvalidOperationException("The property is reserved to this date.");

    var newReservation = new Reservation
    {
      GuestId = guestId,
      PropertyId = propertyId,
      StartDate = request.StartDate,
      EndDate = request.EndDate
    };

    await _reservationRepo.AddAsync(newReservation);

    await _notificationService.CreateNotificationAsync(
      guestId,
      "Reservation Confirmed",
      $"Your reservation for {property.Title} from {request.StartDate} to {request.EndDate} has been confirmed.",
      NotificationType.Both
    );

    await _notificationService.CreateNotificationAsync(
      property.HostId,
      "New Reservation",
      $"You have a new reservation for {property.Title} from {request.StartDate} to {request.EndDate}.",
      NotificationType.Both
    );

    return newReservation;
  }

  public async Task UpdateReservationAsync(int reservationId, Guid currentUser, CreateReservationRequest request)
  {
    var reservation = await _reservationRepo.GetByIdAsync(reservationId)
      ?? throw new Exception("Reservation not found.");

    if (reservation.GuestId != currentUser)
      throw new UnauthorizedAccessException("Dont allow for edit this property.");

    if (reservation.Status == ReservationStatus.Canceled)
      throw new Exception("Reservation is Canceled.");

    if (reservation.Status == ReservationStatus.Completed)
      throw new Exception("Reservation is completed");

    reservation.StartDate = request.StartDate;
    reservation.EndDate = request.EndDate;

    await _reservationRepo.UpdateAsync(reservation);
  }
}