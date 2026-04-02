using System.IdentityModel.Tokens.Jwt;
using BookingApp.Domain.Entities;
using BookingApp.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Moq;

namespace BookingApp.Tests;

public class JwtProviderTests
{
  [Fact]
  public void GenerateToken_WhenSecretIsMissing_ShouldThrow()
  {
    var configuration = new Mock<IConfiguration>();
    configuration.Setup(c => c["JWT_SECRET"]).Returns((string?)null);
    configuration.Setup(c => c["JWT_ISSUER"]).Returns("booking-app");

    var provider = new JwtProvider(configuration.Object);

    var user = new User { Id = Guid.NewGuid(), Email = "user@test.com" };

    Assert.Throws<InvalidOperationException>(() => provider.GenerateToken(user));
  }

  [Fact]
  public void GenerateToken_WithValidConfig_ShouldContainExpectedClaims()
  {
    var configuration = new Mock<IConfiguration>();
    configuration.Setup(c => c["JWT_SECRET"]).Returns("a-super-secret-key-with-at-least-32-chars");
    configuration.Setup(c => c["JWT_ISSUER"]).Returns("booking-app");

    var provider = new JwtProvider(configuration.Object);

    var user = new User { Id = Guid.NewGuid(), Email = "user@test.com" };

    var token = provider.GenerateToken(user);

    var handler = new JwtSecurityTokenHandler();
    var jwt = handler.ReadJwtToken(token);

    Assert.Equal("booking-app", jwt.Issuer);
    Assert.Contains(jwt.Audiences, a => a == "booking-app");
    Assert.Contains(jwt.Claims, c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == user.Id.ToString());
    Assert.Contains(jwt.Claims, c => c.Type == JwtRegisteredClaimNames.Email && c.Value == user.Email);
    Assert.Contains(jwt.Claims, c => c.Type == JwtRegisteredClaimNames.Jti && !string.IsNullOrWhiteSpace(c.Value));
  }
}
