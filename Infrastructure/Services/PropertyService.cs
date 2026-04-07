using BookingApp.Application.DTOs;
using BookingApp.Application.DTOs.Property;
using BookingApp.Domain.Entities;
using BookingApp.Domain.Interface;

namespace BookingApp.Infrastructure.Services;

public class PropertyService
{
  private readonly IPropertyRepository _propertyRepo;

  public PropertyService(IPropertyRepository propertyRepo) => _propertyRepo = propertyRepo;

  public async Task<IEnumerable<PropertyResponse>> SearchPropertiesAsync(string? location, decimal? maxPrice, int? minCapacity, DateOnly? startDate, DateOnly? endDate)
  {
    var properties = await _propertyRepo.SearchAvaibleAsync(location, maxPrice, minCapacity, startDate, endDate);

    return properties.Select(p => new PropertyResponse
    {
      Id = p.Id,
      HostId = p.HostId,
      Title = p.Title,
      Description = p.Description,
      NightPrice = p.NightPrice,
      Capacity = p.Capacity,
      Latitude = p.Latitude,
      Longitude = p.Longitude,
      City = p.Location.City,
      State = p.Location.State,
      Country = p.Location.Country
    });
  }

  public async Task<Property?> GetPropertyByIdAsync(int id) => await _propertyRepo.GetByIdAsync(id);

  public async Task<Property> CreatePropertyAsync(Guid hostId, CreatePropertyRequest request)
  {
    var newProperty = new Property
    {
      HostId = hostId,
      Title = request.Title,
      Description = request.Description,
      NightPrice = request.NightPrice,
      Latitude = request.Latitude,
      Longitude = request.Longitude,
      Capacity = request.Capacity,
      Location = new Location
      {
        City = request.City,
        State = request.State,
        Country = request.Country
      }
    };

    await _propertyRepo.AddAsync(newProperty);
    return newProperty;
  }

  public async Task UpdatePropertyAsync(int propertyId, Guid currentUser, CreatePropertyRequest request)
  {
    var property = await _propertyRepo.GetByIdAsync(propertyId)
      ?? throw new Exception("Property not found.");

    if (property.HostId != currentUser)
      throw new UnauthorizedAccessException("Dont allow for edit this property.");

    property.Title = request.Title;
    property.Description = request.Description;
    property.NightPrice = request.NightPrice;
    property.Latitude = request.Latitude;
    property.Longitude = request.Longitude;
    property.Capacity = request.Capacity;
    property.Location.City = request.City;
    property.Location.State = request.State;
    property.Location.Country = request.Country;

    await _propertyRepo.UpdateAsync(property);
  }

  public async Task DeletePropertyAsync(int propertyId, Guid currentUser)
  {
    var property = await _propertyRepo.GetByIdAsync(propertyId)
      ?? throw new Exception("Property not found.");

    if (property.HostId != currentUser)
      throw new UnauthorizedAccessException("Dont allow for edit this property.");

    await _propertyRepo.DeleteAsync(property);
  }
}