using BookingApp.Application.Intefaces.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace BookingApp.Infrastructure.Services;

public class LocalImageStorageService : IImageStorageService
{
  private readonly IWebHostEnvironment _env;
  private readonly IHttpContextAccessor _httpContextAccessor;

  public LocalImageStorageService(IWebHostEnvironment env, IHttpContextAccessor httpContextAccessor)
  {
    _env = env;
    _httpContextAccessor = httpContextAccessor;
  }
  public async Task<string> SaveImageAsync(Stream imageStream, string extension)
  {
    var uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");

    if (!Directory.Exists(uploadsFolder))
      Directory.CreateDirectory(uploadsFolder);

    var fileName = $"{Guid.NewGuid()}{extension}";
    var filePath = Path.Combine(uploadsFolder, fileName);

    using (var fileStream = new FileStream(filePath, FileMode.Create))
    {
      await imageStream.CopyToAsync(fileStream);
    }

    var request = _httpContextAccessor.HttpContext!.Request;
    var baseUrl = $"{request.Scheme}://{request.Host}";

    return $"{baseUrl}/uploads/{fileName}";
  }

  public void DeleteImage(string imageUrl)
  {
    if (string.IsNullOrEmpty(imageUrl)) return;

    var fileName = Path.GetFileName(new Uri(imageUrl).LocalPath);
    var filePath = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", fileName);

    if (File.Exists(filePath))
    {
      File.Delete(filePath);
    }
  }
}