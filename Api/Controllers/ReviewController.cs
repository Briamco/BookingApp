using BookingApp.Application.DTOs;
using BookingApp.Application.Intefaces;
using BookingApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookingApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewController(ReviewService service, IUserService userService) : ControllerBase
{
  private readonly ReviewService _service = service;
  private readonly IUserService _userService = userService;

  [HttpPost("reservation/{reservationId}")]
  [Authorize]
  public async Task<IActionResult> CreateReview(int reservationId, [FromBody] CreateReviewRequest request)
  {
    try
    {
      var currentUser = _userService.GetUserId();
      var review = await _service.CreateReviewAsync(reservationId, currentUser, request);

      return CreatedAtAction(
        nameof(CreateReview),
        new { reservationId = review.ReservationId },
        new { message = "Review created successfully.", review }
      );
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
