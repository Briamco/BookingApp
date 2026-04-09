using BookingApp.Application.DTOs;
using BookingApp.Domain.Entities;
using BookingApp.Domain.Interface;
using BookingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System.Data;

namespace BookingApp.Infrastructure.Services;

public class BlockedDateService
{
  private readonly IBlockedRepository _blockedRepo;
  private readonly IPropertyRepository _propertyRepo;
  private readonly AppDbContext _context;

  public BlockedDateService(
    IBlockedRepository blockedRepo,
    IPropertyRepository propertyRepo,
    AppDbContext context)
  {
    _blockedRepo = blockedRepo;
    _propertyRepo = propertyRepo;
    _context = context;
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

    var propertyLock = PropertyLockManager.GetLock(propertyId);
    await propertyLock.WaitAsync();

    try
    {
      await using var transaction = await _context.Database.BeginTransactionAsync(CancellationToken.None);

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
      await transaction.CommitAsync();
      return newBlockedDate;
    }
    finally
    {
      propertyLock.Release();
    }
  }

  public async Task UpdateBlockedDate(int blockedDateId, Guid userId, CreateReservationRequest request)
  {
    var blockedDate = await _blockedRepo.GetByIdAsync(blockedDateId)
      ?? throw new Exception("Blocked Not Found.");

    var property = await _propertyRepo.GetByIdAsync(blockedDate.PropertyId)
      ?? throw new Exception("Property Not Found.");

    if (property.HostId != userId)
      throw new UnauthorizedAccessException("You cant modify the blocked date.");

    var propertyLock = PropertyLockManager.GetLock(blockedDate.PropertyId);
    await propertyLock.WaitAsync();

    try
    {
      await using var transaction = await _context.Database.BeginTransactionAsync(CancellationToken.None);

      var hasOverlap = await _context.Reservations.AnyAsync(r =>
        r.PropertyId == blockedDate.PropertyId &&
        r.Status == Domain.Enums.ReservationStatus.Confimed &&
        r.StartDate < request.EndDate &&
        r.EndDate > request.StartDate
      ) || await _context.BlockedDates.AnyAsync(b =>
        b.Id != blockedDate.Id &&
        b.PropertyId == blockedDate.PropertyId &&
        b.StartDate < request.EndDate &&
        b.EndDate > request.StartDate
      );

      if (hasOverlap)
        throw new InvalidOperationException("This dates are blocked.");

      blockedDate.StartDate = request.StartDate;
      blockedDate.EndDate = request.EndDate;

      await _blockedRepo.UpdateAsync(blockedDate);
      await transaction.CommitAsync();
    }
    finally
    {
      propertyLock.Release();
    }
  }
}