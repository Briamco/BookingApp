using System.ComponentModel.DataAnnotations;

namespace BookingApp.Application.DTOs;

public class ResendConfirmationRequest
{
  [Required]
  [EmailAddress]
  public string Email { get; set; } = string.Empty;
}