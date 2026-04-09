using BookingApp.Application.DTOs;
using BookingApp.Application.Intefaces;
using BookingApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookingApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Host")]
public class BlockedDateController(BlockedDateService service, IUserService userService) : ControllerBase
{
  public readonly BlockedDateService _service = service;
  public readonly IUserService _userService = userService;

  [HttpPut("{id}")]
  public async Task<IActionResult> UpdateBlockedDate(int id, [FromBody] CreateReservationRequest request)
  {
    try
    {
      var currentUser = _userService.GetUserId();
      await _service.UpdateBlockedDate(id, currentUser, request);

      return Ok(new { message = "Blocked Date update success." });
    }
    catch (UnauthorizedAccessException ex)
    {
      return Forbid(ex.Message);
    }
    catch (Exception ex)
    {
      return BadRequest(new { error = ex.Message });
    }
  }
}