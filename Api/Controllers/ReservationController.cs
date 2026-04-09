using BookingApp.Application.DTOs;
using BookingApp.Application.Intefaces;
using BookingApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookingApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationController(ReservationService service, IUserService userService) : ControllerBase
{
  private readonly ReservationService _service = service;
  private readonly IUserService _userService = userService;

  [HttpPut("{id}")]
  [Authorize(Roles = "Guest")]
  public async Task<IActionResult> UpdateReservation(int id, [FromBody] CreateReservationRequest request)
  {
    try
    {
      var currentUser = _userService.GetUserId();
      await _service.UpdateReservationAsync(id, currentUser, request);

      return Ok(new { message = "Reservation update success." });
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

  [HttpPatch("{id}/cancel")]
  [Authorize(Roles = "Guest")]
  public async Task<IActionResult> CancelReservation(int id)
  {
    try
    {
      var currentUser = _userService.GetUserId();
      await _service.CancelReservationAsync(id, currentUser);

      return Ok(new { message = "Reservation cancelation success." });
    }
    catch (UnauthorizedAccessException ex)
    {
      return Forbid(ex.Message);
    }
    catch (InvalidOperationException ex)
    {
      return BadRequest(new { error = ex.Message });
    }
    catch (Exception ex)
    {
      return NotFound(new { error = ex.Message });
    }
  }

  [HttpPatch("{id}/complete")]
  [Authorize(Roles = "Host")]
  public async Task<IActionResult> CompleteReservation(int id)
  {
    try
    {
      await _service.CompleteReservationAsync(id, _userService.GetUserId());

      return Ok(new { message = "Reservation completion success." });
    }
    catch (UnauthorizedAccessException ex)
    {
      return Forbid(ex.Message);
    }
    catch (InvalidOperationException ex)
    {
      return BadRequest(new { error = ex.Message });
    }
    catch (Exception ex)
    {
      return NotFound(new { error = ex.Message });
    }
  }

}