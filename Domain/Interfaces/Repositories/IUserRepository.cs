using BookingApp.Domain.Entities;

namespace BookingApp.Domain.Interface;

public interface IUserRepository
{
  Task<User?> GetByIdAsync(Guid id);
  Task<User?> GetByEmailAsync(string email);
  Task<User?> GetByConfirmationToken(string token);
  Task AddAsync(User user);
  Task UpdateAsync(User user);
}