using BookingApp.Application.DTOs;
using BookingApp.Application.DTOs.Property;
using BookingApp.Application.Intefaces.Services;
using BookingApp.Domain.Entities;
using BookingApp.Domain.Interface;
using Microsoft.AspNetCore.Http;

namespace BookingApp.Infrastructure.Services;

public class PropertyService
{
  private readonly IPropertyRepository _propertyRepo;
  private readonly IReviewRepository _reviewRepo;
  private readonly IImageRepository _imageRepo;
  private readonly IImageStorageService _imageStorageService;

  public PropertyService(
    IPropertyRepository propertyRepo,
    IReviewRepository reviewRepo,
    IImageRepository imageRepo,
    IImageStorageService imageStorageService)
  {
    _propertyRepo = propertyRepo;
    _reviewRepo = reviewRepo;
    _imageRepo = imageRepo;
    _imageStorageService = imageStorageService;
  }

  public async Task<IEnumerable<PropertyResponse>> SearchPropertiesAsync(string? location, decimal? maxPrice, int? minCapacity, DateOnly? startDate, DateOnly? endDate)
  {
    var properties = await _propertyRepo.SearchAvaibleAsync(location, maxPrice, minCapacity, startDate, endDate);
    var responses = new List<PropertyResponse>();

    foreach (var property in properties)
    {
      responses.Add(await MapToPropertyResponseAsync(property));
    }

    return responses;
  }

  public async Task<PropertyDetailResponse?> GetPropertyByIdAsync(int id)
  {
    var property = await _propertyRepo.GetByIdAsync(id);
    if (property is null)
      return null;

    return await MapToPropertyDetailResponseAsync(property);
  }

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

  private async Task<PropertyResponse> MapToPropertyResponseAsync(Property p)
  {
    var averageRating = await _reviewRepo.GetAverageRatingAsync(p.Id);

    return new PropertyResponse
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
      Country = p.Location.Country,
      AverageRating = averageRating,
      Images = p.Images
    };
  }

  private async Task<PropertyDetailResponse> MapToPropertyDetailResponseAsync(Property p)
  {
    var averageRating = await _reviewRepo.GetAverageRatingAsync(p.Id);

    return new PropertyDetailResponse
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
      Country = p.Location.Country,
      AverageRating = averageRating,
      Reservations = p.Reservations
        .OrderBy(r => r.StartDate)
        .Select(r => new PropertyReservationResponse
        {
          Id = r.Id,
          GuestId = r.GuestId,
          StartDate = r.StartDate,
          EndDate = r.EndDate,
          Status = r.Status,
          CreatedAt = r.CreatedAt
        })
        .ToList(),
      BlockedDates = p.BlockedDates
        .OrderBy(b => b.StartDate)
        .Select(b => new PropertyBlockedDateResponse
        {
          Id = b.Id,
          StartDate = b.StartDate,
          EndDate = b.EndDate
        })
        .ToList(),
      Images = p.Images
    };
  }

  public async Task<ImageResponse> UploadImageAsync(int propertyId, Guid currentUser, IFormFile imageFile)
  {
    var property = await _propertyRepo.GetByIdAsync(propertyId)
      ?? throw new Exception("Property not found.");

    if (property.HostId != currentUser)
      throw new UnauthorizedAccessException("Don't have permission to upload images to this property.");

    // Validar extensión de archivo
    var allowedExtensions = new List<string> { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    var extension = Path.GetExtension(imageFile.FileName).ToLower();

    if (!allowedExtensions.Contains(extension))
      throw new Exception("Invalid image format. Allowed: JPG, PNG, GIF, WEBP.");

    // Validar tamaño máximo (5MB)
    const long maxFileSize = 5 * 1024 * 1024;
    if (imageFile.Length > maxFileSize)
      throw new Exception("Image size cannot exceed 5MB.");

    // Guardar imagen
    using var stream = imageFile.OpenReadStream();
    var imageUrl = await _imageStorageService.SaveImageAsync(stream, extension);

    // Obtener el orden más alto actual
    var existingImages = await _imageRepo.GetByPropertyIdAsync(propertyId);
    var nextOrder = existingImages.Count > 0 ? existingImages.Max(x => x.Order) + 1 : 0;

    // Crear registro en BD
    var newImage = new Image
    {
      PropertyId = propertyId,
      Url = imageUrl,
      Order = nextOrder
    };

    await _imageRepo.AddAsync(newImage);

    return new ImageResponse
    {
      Id = newImage.Id,
      Url = newImage.Url,
      Order = newImage.Order
    };
  }

  public async Task<List<ImageResponse>> GetPropertyImagesAsync(int propertyId)
  {
    var images = await _imageRepo.GetByPropertyIdAsync(propertyId);

    return images.Select(i => new ImageResponse
    {
      Id = i.Id,
      Url = i.Url,
      Order = i.Order
    }).ToList();
  }

  public async Task DeleteImageAsync(int propertyId, int imageId, Guid currentUser)
  {
    var property = await _propertyRepo.GetByIdAsync(propertyId)
      ?? throw new Exception("Property not found.");

    if (property.HostId != currentUser)
      throw new UnauthorizedAccessException("Don't have permission to delete images from this property.");

    var images = await _imageRepo.GetByPropertyIdAsync(propertyId);
    var imageToDelete = images.FirstOrDefault(i => i.Id == imageId)
      ?? throw new Exception("Image not found.");

    _imageStorageService.DeleteImage(imageToDelete.Url);
    await _imageRepo.DeleteAsync(imageToDelete);
  }

  public async Task ReorderImagesAsync(int propertyId, Guid currentUser, List<(int ImageId, int Order)> imageOrders)
  {
    var property = await _propertyRepo.GetByIdAsync(propertyId)
      ?? throw new Exception("Property not found.");

    if (property.HostId != currentUser)
      throw new UnauthorizedAccessException("Don't have permission to reorder images for this property.");

    var images = await _imageRepo.GetByPropertyIdAsync(propertyId);

    foreach (var (imageId, order) in imageOrders)
    {
      var image = images.FirstOrDefault(i => i.Id == imageId)
        ?? throw new Exception($"Image {imageId} not found.");

      image.Order = order;
      await _imageRepo.UpdateAsync(image);
    }
  }
}