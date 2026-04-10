using BookingApp.Application.DTOs;
using BookingApp.Application.Intefaces;
using BookingApp.Application.Intefaces.Services;
using BookingApp.Domain.Entities;
using BookingApp.Domain.Interface;
using Microsoft.Extensions.Configuration;
using System.Text.RegularExpressions;

namespace BookingApp.Infrastructure.Services;

public class AuthService
{
  private readonly IUserRepository _userRepository;
  private readonly IPasswordHasher _passwordHasher;
  private readonly IJwtProvider _jwtProvider;
  private readonly INotificationService _notificationService;
  private readonly IConfiguration _configuration;

  public AuthService(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IJwtProvider jwtProvider,
    INotificationService notificationService,
    IConfiguration configuration)
  {
    _userRepository = userRepository;
    _passwordHasher = passwordHasher;
    _jwtProvider = jwtProvider;
    _notificationService = notificationService;
    _configuration = configuration;
  }

  public async Task<string> RegisterAsync(RegisterRequest request)
  {
    if (!Regex.IsMatch(request.Phone, @"^8\d9-\d{3}-\d{4}$"))
      throw new Exception("Invalid phone format. Use 8X9-XXX-XXXX (example: 819-123-4567).");

    var existingUser = await _userRepository.GetByEmailAsync(request.Email);
    if (existingUser != null)
      throw new Exception("This email is register.");

    var confirmToken = Guid.NewGuid().ToString();

    var newUser = new User
    {
      Id = Guid.NewGuid(),
      FirstName = request.FirstName,
      LastName = request.LastName,
      Email = request.Email,
      Phone = request.Phone,
      Password = _passwordHasher.Hash(request.Password),
      ConfirmationToken = confirmToken,
      TokenExpiresAt = DateTime.UtcNow.AddMinutes(10)
    };

    await _userRepository.AddAsync(newUser);

    var frontendUrl = _configuration["FRONTEND_URL"] ?? "http://localhost:3000";

    var confirmLink = $"{frontendUrl}/auth/confirm?token={confirmToken}";

    await _notificationService.CreateNotificationAsync(
      newUser.Id,
      "Confirm your account",
      $"Click the next link for confirm your account: {confirmLink}",
      BookingApp.Domain.Enums.NotificationType.Email
    );

    return "User register. Please check your mail for confirm your account.";
  }

  public async Task<string> LoginAsync(LoginRequest request)
  {
    var user =
      await _userRepository.GetByEmailAsync(request.Email)
      ?? throw new Exception("Incorrect credentials.");

    if (!user.IsConfirmed)
      throw new Exception("This user is not confirmed. Please check your email.");

    if (!_passwordHasher.Verify(request.Password, user.Password))
      throw new Exception("Incorrect credentials");

    return _jwtProvider.GenerateToken(user);
  }

  public async Task<bool> ConfirmEmailAsync(string token)
  {
    var user =
      await _userRepository.GetByConfirmationToken(token)
      ?? throw new Exception("Invalid token");

    if (user.TokenExpiresAt < DateTime.UtcNow)
      throw new Exception("Token expired.");

    user.IsConfirmed = true;
    user.ConfirmationToken = null;
    user.TokenExpiresAt = null;

    await _userRepository.UpdateAsync(user);

    return true;
  }

  public async Task<UserResponse> GetUserInfoAsync(Guid userId)
  {
    var user = await _userRepository.GetByIdAsync(userId)
      ?? throw new Exception("User not found.");

    return new UserResponse
    {
      Id = user.Id,
      FirstName = user.FirstName,
      LastName = user.LastName,
      Email = user.Email,
      Phone = user.Phone,
      IsConfirmed = user.IsConfirmed
    };
  }
}