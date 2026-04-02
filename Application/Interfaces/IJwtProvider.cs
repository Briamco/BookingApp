using BookingApp.Domain.Entities;

namespace BookingApp.Application.Intefaces;

public interface IJwtProvider
{
  string GenerateToken(User user);
}