using System.ComponentModel.DataAnnotations;

namespace BookingApp.Application.DTOs;

public class RegisterRequest
{
  [Required]
  public string FirstName { get; set; } = string.Empty;

  [Required]
  public string LastName { get; set; } = string.Empty;

  [Required]
  [EmailAddress]
  public string Email { get; set; } = string.Empty;

  [Required]
  [RegularExpression(@"^8\d9-\d{3}-\d{4}$", ErrorMessage = "Phone must match format 8X9-XXX-XXXX (example: 819-123-4567).")]
  public string Phone { get; set; } = string.Empty;

  [Required]
  [MinLength(8)]
  public string Password { get; set; } = string.Empty;
}