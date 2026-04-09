using BookingApp.Application.DTOs;
using BookingApp.Application.Intefaces;
using BookingApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookingApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PropertyController(PropertyService service, IUserService userService, ReservationService reservationService, BlockedDateService blockedDateService) : ControllerBase
{
  private readonly PropertyService _service = service;
  private readonly IUserService _userService = userService;
  private readonly ReservationService _reservationService = reservationService;
  private readonly BlockedDateService _blockedDateService = blockedDateService;

  [HttpGet]
  [AllowAnonymous]
  public async Task<IActionResult> GetProperties(
        [FromQuery] string? location,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int? minCapacity,
        [FromQuery] DateOnly? startDate,
        [FromQuery] DateOnly? endDate)
  {
    try
    {
      var properties = await _service.SearchPropertiesAsync(location, maxPrice, minCapacity, startDate, endDate);

      return Ok(properties);
    }
    catch (Exception ex)
    {
      return StatusCode(500, new { error = "Ocurrió un error al buscar las propiedades.", details = ex.Message });
    }
  }

  [HttpPost]
  [Authorize(Roles = "Host")]
  public async Task<IActionResult> CreateProperty([FromBody] CreatePropertyRequest request)
  {
    try
    {
      var hostId = _userService.GetUserId();

      var newProperty = await _service.CreatePropertyAsync(hostId, request);

      return CreatedAtAction(
        nameof(CreateProperty),
        new { id = newProperty.Id },
        new { message = "Property Creation Success.", propertyId = newProperty.Id }
      );
    }
    catch (Exception ex)
    {
      return BadRequest(new { error = ex.Message });
    }
  }

  [HttpGet("{id}")]
  [AllowAnonymous]
  public async Task<IActionResult> GetById(int id)
  {
    try
    {
      var property = await _service.GetPropertyByIdAsync(id);

      if (property is null)
        return NotFound(new { error = "Property not found." });

      return Ok(property);
    }
    catch (Exception ex)
    {
      return BadRequest(new { error = ex.Message });
    }
  }

  [HttpPut("{id}")]
  [Authorize(Roles = "Host")]
  public async Task<IActionResult> UpdateProperty(int id, [FromBody] CreatePropertyRequest request)
  {
    try
    {
      var currentUserId = _userService.GetUserId();
      await _service.UpdatePropertyAsync(id, currentUserId, request);

      return Ok(new { message = "Property update Success." });
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

  [HttpDelete("{id}")]
  [Authorize(Roles = "Host")]
  public async Task<IActionResult> DeleteProperty(int id)
  {
    try
    {
      var currentUserId = _userService.GetUserId();
      await _service.DeletePropertyAsync(id, currentUserId);

      return Ok(new { message = "Property deletion Success" });
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

  [HttpPost("{id}/reservate")]
  [Authorize(Roles = "Guest")]
  public async Task<IActionResult> CreateReservation(int id, [FromBody] CreateReservationRequest request)
  {
    try
    {
      var currentUserId = _userService.GetUserId();
      var newReservation = await _reservationService.CreateReservationAsync(id, currentUserId, request);

      return CreatedAtAction(
        nameof(CreateReservation),
        new { id = newReservation.Id },
        new { message = "Reservation Creation Success.", propertyId = newReservation.Id }
      );
    }
    catch (Exception ex)
    {
      return BadRequest(new { error = ex.Message });
    }
  }

  [HttpPost("{id}/blockDate")]
  [Authorize(Roles = "Host")]
  public async Task<IActionResult> BlockDate(int id, [FromBody] CreateReservationRequest request)
  {
    try
    {
      var currentUser = _userService.GetUserId();
      var newBlockedDate = await _blockedDateService.BlockDate(id, currentUser, request);

      return CreatedAtAction(
        nameof(BlockDate),
        new { id = newBlockedDate.Id },
        new { message = "Blocked Date Creation Success.", blockedDateId = newBlockedDate.Id }
      );
    }
    catch (Exception ex)
    {
      return BadRequest(new { error = ex.Message });
    }
  }
}