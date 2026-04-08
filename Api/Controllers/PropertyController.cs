using BookingApp.Application.DTOs;
using BookingApp.Application.Intefaces;
using BookingApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace BookingApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PropertyController(PropertyService service, IUserService userService, ReservationService reservationService) : ControllerBase
{
  private readonly PropertyService _service = service;
  private readonly IUserService _userService = userService;
  private readonly ReservationService _reservationService = reservationService;

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
  [Authorize]
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

      return Ok(property);
    }
    catch (Exception ex)
    {
      return BadRequest(new { error = ex.Message });
    }
  }

  [HttpPut("{id}")]
  [Authorize]
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
  [Authorize]
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

  [HttpPost("{propertyId}/reservate")]
  [Authorize]
  public async Task<IActionResult> CreateReservation(int propertyId, [FromBody] CreateReservationRequest request)
  {
    try
    {
      var currentUserId = _userService.GetUserId();
      var newReservation = await _reservationService.CreateReservationAsync(propertyId, currentUserId, request);

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
}