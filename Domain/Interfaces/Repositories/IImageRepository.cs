using BookingApp.Domain.Entities;

namespace BookingApp.Domain.Interface;

public interface IImageRepository
{
  Task<Image> AddAsync(Image image);
  Task<List<Image>> GetByPropertyIdAsync(int propertyId);
  Task DeleteAsync(Image image);
  Task UpdateAsync(Image image);
}
