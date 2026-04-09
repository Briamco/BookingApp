using BookingApp.Domain.Entities;
using BookingApp.Domain.Interface;
using BookingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookingApp.Infrastructure.Respositories;

public class UserRepository : IUserRepository
{
  private readonly AppDbContext _context;

  public UserRepository(AppDbContext context) => _context = context;

  public async Task<User?> GetByConfirmationToken(string token)
  {
    return await _context.Users.FirstOrDefaultAsync(u => u.ConfirmationToken == token);
  }

  public async Task<User?> GetByEmailAsync(string email)
  {
    return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
  }

  public async Task AddAsync(User user)
  {
    try
    {
      await _context.Users.AddAsync(user);
      await _context.SaveChangesAsync();
    }
    catch (DbUpdateException ex)
    {
      throw new Exception(ex.InnerException?.Message ?? ex.Message, ex);
    }
  }

  public async Task UpdateAsync(User user)
  {
    try
    {
      _context.Users.Update(user);
      await _context.SaveChangesAsync();
    }
    catch (DbUpdateException ex)
    {
      throw new Exception(ex.InnerException?.Message ?? ex.Message, ex);
    }
  }

  public async Task<User?> GetByIdAsync(Guid id)
  {
    return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
  }
}