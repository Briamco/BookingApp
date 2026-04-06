using BookingApp.Domain.Entities;

namespace BookingApp.Domain.Interface;

public interface IPropertyRepository
{
  Task<Property?> GetByIdAsync(int id);
  Task<IEnumerable<Property>> SearchAvaibleAsync(string? location, decimal? maxPrice, int? capacity);
  Task AddAsync(Property property);
  Task UpdateAsync(Property property);
  Task DeleteAsync(Property property);
}