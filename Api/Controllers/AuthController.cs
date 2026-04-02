using BookingApp.Application.DTOs;
using BookingApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookingApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AuthController(AuthService service) : ControllerBase
{
  private readonly AuthService _service = service;

  [HttpPost("register")]
  public async Task<IActionResult> Register([FromBody] RegisterRequest request)
  {
    try
    {
      var message = await _service.RegisterAsync(request);
      return Ok(new { message });
    }
    catch (Exception ex)
    {
      return BadRequest(new { error = ex.Message });
    }
  }

  [HttpPost("login")]
  public async Task<IActionResult> Login([FromBody] LoginRequest request)
  {
    try
    {
      var token = await _service.LoginAsync(request);
      return Ok(new { token });
    }
    catch (Exception ex)
    {
      return Unauthorized(new { error = ex.Message });
    }
  }

  [HttpPost]
  public async Task<IActionResult> ConfirmEmail([FromQuery] string token)
  {
    try
    {
      await _service.ConfirmEmailAsync(token);
      return Ok(new { message = "Account Confirming Succesful" });
    }
    catch (Exception ex)
    {
      return BadRequest(new { error = ex.Message });
    }
  }
}