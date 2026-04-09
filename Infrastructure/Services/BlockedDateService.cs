using BookingApp.Application.DTOs;
using BookingApp.Domain.Entities;
using BookingApp.Domain.Interface;

namespace BookingApp.Infrastructure.Services;

public class BlockedDateService
{
  private readonly IBlockedRepository _blockedRepo;
  private readonly IPropertyRepository _propertyRepo;

  public BlockedDateService(
    IBlockedRepository blockedRepo,
    IPropertyRepository propertyRepo)
  {
    _blockedRepo = blockedRepo;
    _propertyRepo = propertyRepo;
  }

  public async Task<BlockedDate> BlockDate(int propertyId, Guid userId, CreateReservationRequest request)
  {
    if (request.StartDate < DateOnly.FromDateTime(DateTime.UtcNow))
      throw new Exception("Cant reserve at the past.");

    if (request.EndDate <= request.StartDate)
      throw new Exception("End date have to be before the start date.");

    var property = await _propertyRepo.GetByIdAsync(propertyId)
      ?? throw new Exception("Property not found.");

    if (property.HostId != userId)
      throw new InvalidOperationException("You cant block a date for this property.");

    bool isBlocked = await _blockedRepo.HasOverlappingAsync(propertyId, request.StartDate, request.EndDate);

    if (isBlocked)
      throw new InvalidOperationException("This dates are blocked.");

    var newBlockedDate = new BlockedDate
    {
      PropertyId = propertyId,
      StartDate = request.StartDate,
      EndDate = request.EndDate
    };

    await _blockedRepo.AddAsync(newBlockedDate);
    return newBlockedDate;
  }

  public async Task UpdateBlockedDate(int blockedDateId, Guid userId, CreateReservationRequest request)
  {
    var blockedDate = await _blockedRepo.GetByIdAsync(blockedDateId)
      ?? throw new Exception("Blocked Not Found.");

    var property = await _propertyRepo.GetByIdAsync(blockedDate.PropertyId)
      ?? throw new Exception("Property Not Found.");

    if (property.HostId != userId)
      throw new UnauthorizedAccessException("You cant modify the blocked date.");

    blockedDate.StartDate = request.StartDate;
    blockedDate.EndDate = request.EndDate;

    await _blockedRepo.UpdateAsync(blockedDate);
  }
}