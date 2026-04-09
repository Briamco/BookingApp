using System.Net;
using System.Text.Json;

namespace BookingApp.Api.Middlewares;

public class GlobalExceptionMiddleware
{
  private readonly RequestDelegate _next;
  private readonly ILogger<GlobalExceptionMiddleware> _logger;

  public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
  {
    _next = next;
    _logger = logger;
  }

  public async Task InvokeAsync(HttpContext context)
  {
    try
    {
      await _next(context);
    }
    catch (UnauthorizedAccessException ex)
    {
      await WriteErrorAsync(context, HttpStatusCode.Forbidden, ex.Message);
    }
    catch (InvalidOperationException ex)
    {
      await WriteErrorAsync(context, HttpStatusCode.BadRequest, ex.Message);
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "Unhandled exception");
      await WriteErrorAsync(context, HttpStatusCode.InternalServerError, "An unexpected error occurred.");
    }
  }

  private static async Task WriteErrorAsync(HttpContext context, HttpStatusCode statusCode, string message)
  {
    if (context.Response.HasStarted)
      throw new InvalidOperationException("The response has already started.");

    context.Response.Clear();
    context.Response.StatusCode = (int)statusCode;
    context.Response.ContentType = "application/json";

    var payload = JsonSerializer.Serialize(new { error = message });
    await context.Response.WriteAsync(payload);
  }
}