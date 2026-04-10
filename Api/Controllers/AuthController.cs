using BookingApp.Application.DTOs;
using BookingApp.Infrastructure.Services;
using BookingApp.Application.Intefaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookingApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AuthService service, IUserService userService) : ControllerBase
{
  private readonly AuthService _service = service;
  private readonly IUserService _userService = userService;

  [HttpPost("register")]
  [AllowAnonymous]
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
  [AllowAnonymous]
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

  [HttpPost("confirm")]
  [AllowAnonymous]
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

  [HttpGet("me")]
  [Authorize]
  public async Task<IActionResult> GetUserInfo()
  {
    try
    {
      var userId = _userService.GetUserId();
      var userInfo = await _service.GetUserInfoAsync(userId);
      return Ok(userInfo);
    }
    catch (UnauthorizedAccessException ex)
    {
      return Unauthorized(new { error = ex.Message });
    }
    catch (Exception ex)
    {
      return BadRequest(new { error = ex.Message });
    }
  }
}