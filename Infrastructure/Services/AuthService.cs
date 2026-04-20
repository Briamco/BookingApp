using BookingApp.Application.DTOs;
using BookingApp.Application.Intefaces;
using BookingApp.Application.Intefaces.Services;
using BookingApp.Domain.Entities;
using BookingApp.Domain.Interface;
using Microsoft.Extensions.Configuration;
using System.Net;
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

    await SendConfirmationEmailAsync(newUser, confirmToken);

    return "User registered. Please check your email to confirm your Comit account.";
  }

  public async Task<string> ResendConfirmationEmailAsync(string email)
  {
    if (string.IsNullOrWhiteSpace(email))
      throw new Exception("Email is required.");

    var user = await _userRepository.GetByEmailAsync(email)
      ?? throw new Exception("User not found.");

    if (user.IsConfirmed)
      throw new Exception("This user is already confirmed.");

    var confirmToken = Guid.NewGuid().ToString();
    user.ConfirmationToken = confirmToken;
    user.TokenExpiresAt = DateTime.UtcNow.AddMinutes(10);

    await _userRepository.UpdateAsync(user);
    await SendConfirmationEmailAsync(user, confirmToken);

    return "A new confirmation email has been sent.";
  }

  private async Task SendConfirmationEmailAsync(User user, string confirmToken)
  {
    var frontendUrl = _configuration["FRONTEND_URL"] ?? "http://localhost:3000";
    var confirmLink = BuildConfirmationLink(frontendUrl, confirmToken);
    var confirmationEmail = BuildConfirmationEmail(user.FirstName, confirmLink);

    await _notificationService.CreateNotificationAsync(
      user.Id,
      "Confirm your Comit account",
      confirmationEmail,
      BookingApp.Domain.Enums.NotificationType.Email
    );
  }

  private static string BuildConfirmationLink(string frontendUrl, string confirmToken)
  {
    return $"{frontendUrl}/auth/confirm?token={confirmToken}";
  }

  private static string BuildConfirmationEmail(string firstName, string confirmLink)
  {
    var safeName = WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(firstName) ? "there" : firstName);
    var safeLink = WebUtility.HtmlEncode(confirmLink);

    return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"" />
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
  <title>Confirm your Comit account</title>
</head>
<body style=""margin:0;padding:0;background:#f4f8fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;"">
  <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""padding:24px 12px;"">
    <tr>
      <td align=""center"">
        <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""max-width:620px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #dbe7f2;"">
          <tr>
            <td style=""background:#1a5276;padding:20px 24px;color:#ffffff;"">
              <h1 style=""margin:0;font-size:22px;line-height:1.25;"">Welcome to Comit</h1>
              <p style=""margin:8px 0 0 0;font-size:14px;opacity:0.95;"">Confirm your email to activate your account.</p>
            </td>
          </tr>
          <tr>
            <td style=""padding:24px;"">
              <p style=""margin:0 0 14px 0;font-size:15px;line-height:1.6;"">Hi {safeName},</p>
              <p style=""margin:0 0 18px 0;font-size:15px;line-height:1.6;"">Thanks for creating your Comit account. Please confirm your email address to complete your registration and start using the platform.</p>

              <table role=""presentation"" cellspacing=""0"" cellpadding=""0"" style=""margin:0 0 18px 0;"">
                <tr>
                  <td style=""border-radius:10px;background:#1a5276;"">
                    <a href=""{safeLink}"" style=""display:inline-block;padding:12px 20px;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;"">Confirm My Account</a>
                  </td>
                </tr>
              </table>

              <p style=""margin:0 0 8px 0;font-size:13px;color:#4b5563;line-height:1.6;"">This confirmation link expires in 10 minutes.</p>
              <p style=""margin:0;font-size:13px;color:#4b5563;line-height:1.6;"">If you did not create this account, you can safely ignore this message.</p>
            </td>
          </tr>
          <tr>
            <td style=""padding:16px 24px;background:#f8fbff;border-top:1px solid #e6edf4;font-size:12px;color:#6b7280;line-height:1.6;"">
              Comit • Smart stays, seamless reservations
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";
  }

  public async Task<LoginResponse> LoginAsync(LoginRequest request)
  {
    var user =
      await _userRepository.GetByEmailAsync(request.Email)
      ?? throw new Exception("Incorrect credentials.");

    if (!user.IsConfirmed)
      throw new Exception("This user is not confirmed. Please check your email.");

    if (!_passwordHasher.Verify(request.Password, user.Password))
      throw new Exception("Incorrect credentials");

    return new LoginResponse
    {
      Token = _jwtProvider.GenerateToken(user),
      User = new UserResponse
      {
        Id = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email,
        Phone = user.Phone,
        IsConfirmed = user.IsConfirmed
      }
    };
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

  public async Task<PublicUserResponse> GetPublicUserInfoAsync(Guid userId)
  {
    var user = await _userRepository.GetByIdAsync(userId)
      ?? throw new Exception("User not found.");

    return new PublicUserResponse
    {
      Id = user.Id,
      FirstName = user.FirstName,
      LastName = user.LastName,
      Phone = user.Phone
    };
  }
}