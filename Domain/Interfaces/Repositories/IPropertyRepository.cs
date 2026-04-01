using BookingApp.Domain.Entities;

namespace BookingApp.Domain.Interface;

public interface IPropertyRepository
{
  Task<Property?> GetByIdAsync(int id);
  Task<IEnumerable<Property>> SearchAvaibleAsync(string? location, DateOnly startDate, DateOnly endDate, int capacity, double? maxPrice);
  Task AddAsync(Property property);
  Task UpdateAsync(Property property);
  Task DeleteAsync(Property property);
}