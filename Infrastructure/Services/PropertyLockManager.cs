using System.Collections.Concurrent;

namespace BookingApp.Infrastructure.Services;

internal static class PropertyLockManager
{
  private static readonly ConcurrentDictionary<int, SemaphoreSlim> Locks = new();

  public static SemaphoreSlim GetLock(int propertyId)
  {
    return Locks.GetOrAdd(propertyId, _ => new SemaphoreSlim(1, 1));
  }
}