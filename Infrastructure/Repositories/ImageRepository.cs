using BookingApp.Domain.Entities;
using BookingApp.Domain.Interface;
using BookingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookingApp.Infrastructure.Repositories;

public class ImageRepository : IImageRepository
{
  private readonly AppDbContext _context;

  public ImageRepository(AppDbContext context)
  {
    _context = context;
  }

  public async Task<Image> AddAsync(Image image)
  {
    await _context.Images.AddAsync(image);
    await _context.SaveChangesAsync();
    return image;
  }

  public async Task<List<Image>> GetByPropertyIdAsync(int propertyId)
  {
    return await _context.Images
      .Where(i => i.PropertyId == propertyId)
      .OrderBy(i => i.Order)
      .ToListAsync();
  }

  public async Task DeleteAsync(Image image)
  {
    _context.Images.Remove(image);
    await _context.SaveChangesAsync();
  }

  public async Task UpdateAsync(Image image)
  {
    _context.Images.Update(image);
    await _context.SaveChangesAsync();
  }
}
