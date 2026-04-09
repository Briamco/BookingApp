// Example: How to integrate NotificationService into existing services
// Add this to your service constructor and use it to send notifications on events

// ============================================================================
// EXAMPLE 1: Integration in ReservationService
// ============================================================================

/*
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
  private readonly INotificationService _notificationService;  // ADD THIS

  public ReservationService(
    IReservationRepository reservationRepo,
    IPropertyRepository propertyRepository,
    INotificationService notificationService  // ADD THIS
  )
  {
    _reservationRepo = reservationRepo;
    _propertyRepository = propertyRepository;
    _notificationService = notificationService;  // ADD THIS
  }

  public async Task<Reservation> CreateReservationAsync(
    int propertyId,
    Guid guestId,
    CreateReservationRequest request
  )
  {
    // ... existing validation code ...

    var reservation = new Reservation { /* ... */ };
    await _reservationRepo.AddAsync(reservation);

    // SEND NOTIFICATION TO GUEST
    await _notificationService.CreateNotificationAsync(
      guestId,
      "Reservation Confirmed",
      $"Your reservation for {property.Title} from {request.StartDate} to {request.EndDate} has been confirmed.",
      NotificationType.Both  // or NotificationType.Push, NotificationType.Email
    );

    // SEND NOTIFICATION TO HOST
    await _notificationService.CreateNotificationAsync(
      property.HostId,
      "New Reservation",
      $"You have a new reservation for {property.Title} from {request.StartDate} to {request.EndDate}.",
      NotificationType.Both
    );

    return reservation;
  }

  public async Task CancelReservationAsync(int reservationId, Guid currentUser)
  {
    var reservation = await _reservationRepo.GetByIdAsync(reservationId)
      ?? throw new Exception("Reservation not found");

    reservation.Cancel();
    await _reservationRepo.UpdateAsync(reservation);

    // SEND NOTIFICATION TO GUEST
    var property = await _propertyRepository.GetByIdAsync(reservation.PropertyId);
    await _notificationService.CreateNotificationAsync(
      reservation.GuestId,
      "Reservation Cancelled",
      $"Your reservation for {property?.Title} has been cancelled.",
      NotificationType.Both
    );

    // SEND NOTIFICATION TO HOST
    await _notificationService.CreateNotificationAsync(
      property!.HostId,
      "Reservation Cancelled",
      $"The reservation for {property.Title} has been cancelled.",
      NotificationType.Email
    );
  }
}
*/

// ============================================================================
// EXAMPLE 2: Integration in ReviewService
// ============================================================================

/*
public async Task<Review> CreateReviewAsync(Guid userId, CreateReviewRequest request)
{
  var reservation = await _reservationRepo.GetByIdAsync(request.ReservationId);
  var review = new Review { /* ... */ };
  
  await _reviewRepo.AddAsync(review);

  // SEND NOTIFICATION TO HOST ABOUT NEW REVIEW
  await _notificationService.CreateNotificationAsync(
    reservation.Property.HostId,
    "New Review",
    $"You have received a new {request.Rating}-star review",
    NotificationType.Push  // Push only for immediate notification
  );

  return review;
}
*/

// ============================================================================
// EXAMPLE 3: Integration in AuthService (Email Confirmation)
// ============================================================================

/*
public async Task RegisterAsync(RegisterRequest request)
{
  var user = new User { /* ... */ };
  // ... generate confirmation token ...
  
  await _userRepository.AddAsync(user);

  // SEND EMAIL CONFIRMATION NOTIFICATION
  await _notificationService.CreateNotificationAsync(
    user.Id,
    "Confirm Your Email",
    $"Please confirm your email by clicking: [confirmation-link]",
    NotificationType.Email  // Email only for confirmation
  );
}
*/

// ============================================================================
// NOTIFICATION TYPES USAGE GUIDE
// ============================================================================

/*
NotificationType.Push (1)
  - Used for time-sensitive notifications
  - Sent via WebSocket to connected clients
  - Example: Reservation confirmed, new review received

NotificationType.Email (0)
  - Used for important events the user might not see immediately
  - Sent to user's email via Resend/Gmail
  - Example: Account verification, password reset

NotificationType.Both (2)
  - Used for critical notifications
  - Sent via both WebSocket and Email
  - Example: Reservation cancelled, important account updates
*/

// ============================================================================
// CLIENT-SIDE: WEBSOCKET USAGE (JavaScript/TypeScript)
// ============================================================================

/*
const userId = "550e8400-e29b-41d4-a716-446655440000";
const webSocket = new WebSocket(`wss://localhost:5001/api/notification/ws/${userId}`);

webSocket.onopen = () => {
  console.log("Connected to notifications");
};

webSocket.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log("Notification received:", notification);
  
  // Handle notification
  showNotificationToUser(notification.title, notification.message);
};

webSocket.onerror = (error) => {
  console.error("WebSocket error:", error);
};

webSocket.onclose = () => {
  console.log("Disconnected from notifications");
  // Attempt to reconnect
};
*/
