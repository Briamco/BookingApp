using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BookingApp.Application.Intefaces;
using BookingApp.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace BookingApp.Infrastructure.Services;

public class JwtProvider : IJwtProvider
{
  private readonly IConfiguration _configuration;

  public JwtProvider(IConfiguration configuration)
  {
    _configuration = configuration;
  }
  public string GenerateToken(User user)
  {
    var secretKey = _configuration["JWT_SECRET"];
    var issuer = _configuration["JWT_ISSUER"];

    if (string.IsNullOrEmpty(secretKey))
      throw new InvalidOperationException("Not jwt secret");

    var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
    var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

    var claims = new[]
    {
      new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
      new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
      new Claim(JwtRegisteredClaimNames.Email, user.Email),
      new Claim(JwtRegisteredClaimNames.GivenName, user.FirstName ?? string.Empty),
      new Claim(JwtRegisteredClaimNames.FamilyName, user.LastName ?? string.Empty),
      new Claim(JwtRegisteredClaimNames.PhoneNumber, user.Phone ?? string.Empty),
      new Claim("is_confirmed", user.IsConfirmed.ToString().ToLowerInvariant()),
      new Claim(System.Security.Claims.ClaimTypes.Role, "Host"),
      new Claim(System.Security.Claims.ClaimTypes.Role, "Guest"),
      new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };

    var token = new JwtSecurityToken(
      issuer: issuer,
      audience: issuer,
      claims,
      expires: DateTime.UtcNow.AddHours(2),
      signingCredentials: credentials
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
  }
}