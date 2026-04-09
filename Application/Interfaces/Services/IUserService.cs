using BookingApp.Domain.Entities;

namespace BookingApp.Application.Intefaces;

public interface IUserService
{
  Guid GetUserId();
  Task<User?> GetUserByIdAsync(Guid id);
}