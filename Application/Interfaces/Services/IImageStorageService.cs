namespace BookingApp.Application.Intefaces.Services;

public interface IImageStorageService
{
  Task<string> SaveImageAsync(Stream imageStream, string extension);

  void DeleteImage(string imageUrl);
}