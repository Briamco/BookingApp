namespace BookingApp.Application.DTOs;

public class LoginResponse
{
  public string Token { get; set; } = string.Empty;
  public UserResponse User { get; set; } = new();
}