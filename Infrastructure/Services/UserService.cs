using System.Security.Claims;
using BookingApp.Application.Intefaces;
using Microsoft.AspNetCore.Http;

namespace BookingApp.Infrastructure.Services;

public class UserService : IUserService
{
  private readonly IHttpContextAccessor _httpContextAccesor;

  public UserService(IHttpContextAccessor httpContextAccessor)
  {
    _httpContextAccesor = httpContextAccessor;
  }

  public Guid GetUserId()
  {
    var user = _httpContextAccesor.HttpContext?.User;
    var userIdString = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
      throw new UnauthorizedAccessException("Invalid Token.");

    return userId;
  }
}