using System.Security.Claims;
using BookingApp.Application.Intefaces;
using BookingApp.Domain.Entities;
using BookingApp.Domain.Interface;
using Microsoft.AspNetCore.Http;

namespace BookingApp.Infrastructure.Services;

public class UserService : IUserService
{
  private readonly IHttpContextAccessor _httpContextAccesor;
  private readonly IUserRepository _userRepo;

  public UserService(IHttpContextAccessor httpContextAccessor, IUserRepository userRepo)
  {
    _httpContextAccesor = httpContextAccessor;
    _userRepo = userRepo;
  }

  public async Task<User?> GetUserByIdAsync(Guid id)
  {
    return await _userRepo.GetByIdAsync(id);
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