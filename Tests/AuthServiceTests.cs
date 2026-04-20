using BookingApp.Application.DTOs;
using BookingApp.Application.Intefaces;
using BookingApp.Application.Intefaces.Services;
using BookingApp.Domain.Entities;
using BookingApp.Domain.Interface;
using BookingApp.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Moq;

namespace BookingApp.Tests;

public class AuthServiceTests
{
  [Fact]
  public async Task RegisterAsync_WhenPhoneFormatIsInvalid_ShouldThrow()
  {
    var (service, userRepository, _, _, _) = BuildAuthService();

    var request = BuildRegisterRequest();
    request.Phone = "123-456-7890";

    await Assert.ThrowsAsync<Exception>(() => service.RegisterAsync(request));

    userRepository.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Never);
  }

  [Fact]
  public async Task RegisterAsync_WhenEmailAlreadyExists_ShouldThrow()
  {
    var (service, userRepository, _, _, _) = BuildAuthService();

    var request = BuildRegisterRequest();

    userRepository
      .Setup(r => r.GetByEmailAsync(request.Email))
      .ReturnsAsync(new User { Email = request.Email });

    await Assert.ThrowsAsync<Exception>(() => service.RegisterAsync(request));

    userRepository.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Never);
  }

  [Fact]
  public async Task RegisterAsync_WhenRequestIsValid_ShouldPersistUserAndQueueConfirmationEmail()
  {
    var (service, userRepository, passwordHasher, _, notificationService) = BuildAuthService();

    var request = BuildRegisterRequest();

    userRepository
      .Setup(r => r.GetByEmailAsync(request.Email))
      .ReturnsAsync((User?)null);

    passwordHasher
      .Setup(p => p.Hash(request.Password))
      .Returns("hashed-password");

    User? addedUser = null;
    userRepository
      .Setup(r => r.AddAsync(It.IsAny<User>()))
      .Callback<User>(u => addedUser = u)
      .Returns(Task.CompletedTask);

    var result = await service.RegisterAsync(request);

    Assert.Equal("User register. Please check your mail for confirm your account.", result);
    Assert.NotNull(addedUser);
    Assert.NotEqual(Guid.Empty, addedUser!.Id);
    Assert.Equal(request.Email, addedUser!.Email);
    Assert.Equal("hashed-password", addedUser.Password);
    Assert.False(string.IsNullOrWhiteSpace(addedUser.ConfirmationToken));
    Assert.NotNull(addedUser.TokenExpiresAt);

    notificationService.Verify(n => n.CreateNotificationAsync(
      addedUser.Id,
      "Confirm your account",
      It.Is<string>(body =>
        body.Contains("/auth/confirm?token=") &&
        body.Contains(addedUser.ConfirmationToken!)),
      Domain.Enums.NotificationType.Email),
      Times.Once);
  }

  [Fact]
  public async Task LoginAsync_WhenUserDoesNotExist_ShouldThrow()
  {
    var (service, userRepository, _, _, _) = BuildAuthService();

    userRepository
      .Setup(r => r.GetByEmailAsync("missing@test.com"))
      .ReturnsAsync((User?)null);

    var request = new LoginRequest
    {
      Email = "missing@test.com",
      Password = "password"
    };

    await Assert.ThrowsAsync<Exception>(() => service.LoginAsync(request));
  }

  [Fact]
  public async Task LoginAsync_WhenUserIsNotConfirmed_ShouldThrow()
  {
    var (service, userRepository, _, _, _) = BuildAuthService();

    userRepository
      .Setup(r => r.GetByEmailAsync("user@test.com"))
      .ReturnsAsync(new User
      {
        Email = "user@test.com",
        Password = "hashed",
        IsConfirmed = false
      });

    var request = new LoginRequest
    {
      Email = "user@test.com",
      Password = "password"
    };

    await Assert.ThrowsAsync<Exception>(() => service.LoginAsync(request));
  }

  [Fact]
  public async Task LoginAsync_WhenPasswordIsInvalid_ShouldThrow()
  {
    var (service, userRepository, passwordHasher, _, _) = BuildAuthService();

    var user = new User
    {
      Email = "user@test.com",
      Password = "hashed",
      IsConfirmed = true
    };

    userRepository
      .Setup(r => r.GetByEmailAsync(user.Email))
      .ReturnsAsync(user);

    passwordHasher
      .Setup(p => p.Verify("wrong-password", user.Password))
      .Returns(false);

    var request = new LoginRequest
    {
      Email = user.Email,
      Password = "wrong-password"
    };

    await Assert.ThrowsAsync<Exception>(() => service.LoginAsync(request));
  }

  [Fact]
  public async Task LoginAsync_WhenCredentialsAreValid_ShouldReturnTokenAndUser()
  {
    var (service, userRepository, passwordHasher, jwtProvider, _) = BuildAuthService();

    var user = new User
    {
      Id = Guid.NewGuid(),
      FirstName = "John",
      LastName = "Doe",
      Email = "user@test.com",
      Phone = "819-123-4567",
      Password = "hashed-password",
      IsConfirmed = true
    };

    userRepository
      .Setup(r => r.GetByEmailAsync(user.Email))
      .ReturnsAsync(user);

    passwordHasher
      .Setup(p => p.Verify("valid-password", user.Password))
      .Returns(true);

    jwtProvider
      .Setup(j => j.GenerateToken(user))
      .Returns("jwt-token");

    var request = new LoginRequest
    {
      Email = user.Email,
      Password = "valid-password"
    };

    var response = await service.LoginAsync(request);

    Assert.Equal("jwt-token", response.Token);
    Assert.Equal(user.Id, response.User.Id);
    Assert.Equal(user.FirstName, response.User.FirstName);
    Assert.Equal(user.LastName, response.User.LastName);
    Assert.Equal(user.Email, response.User.Email);
    Assert.Equal(user.Phone, response.User.Phone);
    Assert.Equal(user.IsConfirmed, response.User.IsConfirmed);
    jwtProvider.Verify(j => j.GenerateToken(user), Times.Once);
  }

  [Fact]
  public async Task ConfirmEmailAsync_WhenTokenDoesNotExist_ShouldThrow()
  {
    var (service, userRepository, _, _, _) = BuildAuthService();

    userRepository
      .Setup(r => r.GetByConfirmationToken("invalid-token"))
      .ReturnsAsync((User?)null);

    await Assert.ThrowsAsync<Exception>(() => service.ConfirmEmailAsync("invalid-token"));
  }

  [Fact]
  public async Task ConfirmEmailAsync_WhenTokenExpired_ShouldThrow()
  {
    var (service, userRepository, _, _, _) = BuildAuthService();

    userRepository
      .Setup(r => r.GetByConfirmationToken("expired-token"))
      .ReturnsAsync(new User
      {
        Email = "user@test.com",
        TokenExpiresAt = DateTime.UtcNow.AddMinutes(-5)
      });

    await Assert.ThrowsAsync<Exception>(() => service.ConfirmEmailAsync("expired-token"));
  }

  [Fact]
  public async Task ConfirmEmailAsync_WhenTokenIsValid_ShouldConfirmAndUpdateUser()
  {
    var (service, userRepository, _, _, _) = BuildAuthService();

    var user = new User
    {
      Email = "user@test.com",
      IsConfirmed = false,
      ConfirmationToken = "valid-token",
      TokenExpiresAt = DateTime.UtcNow.AddMinutes(5)
    };

    userRepository
      .Setup(r => r.GetByConfirmationToken("valid-token"))
      .ReturnsAsync(user);

    userRepository
      .Setup(r => r.UpdateAsync(user))
      .Returns(Task.CompletedTask);

    var result = await service.ConfirmEmailAsync("valid-token");

    Assert.True(result);
    Assert.True(user.IsConfirmed);
    Assert.Null(user.ConfirmationToken);
    Assert.Null(user.TokenExpiresAt);
    userRepository.Verify(r => r.UpdateAsync(user), Times.Once);
  }

  [Fact]
  public async Task ResendConfirmationEmailAsync_WhenUserDoesNotExist_ShouldThrow()
  {
    var (service, userRepository, _, _, _) = BuildAuthService();

    userRepository
      .Setup(r => r.GetByEmailAsync("missing@test.com"))
      .ReturnsAsync((User?)null);

    await Assert.ThrowsAsync<Exception>(() => service.ResendConfirmationEmailAsync("missing@test.com"));
  }

  [Fact]
  public async Task ResendConfirmationEmailAsync_WhenUserIsAlreadyConfirmed_ShouldThrow()
  {
    var (service, userRepository, _, _, _) = BuildAuthService();

    userRepository
      .Setup(r => r.GetByEmailAsync("user@test.com"))
      .ReturnsAsync(new User
      {
        Email = "user@test.com",
        IsConfirmed = true
      });

    await Assert.ThrowsAsync<Exception>(() => service.ResendConfirmationEmailAsync("user@test.com"));
  }

  [Fact]
  public async Task ResendConfirmationEmailAsync_WhenUserIsUnconfirmed_ShouldRefreshTokenAndQueueEmail()
  {
    var (service, userRepository, _, _, notificationService) = BuildAuthService();

    var user = new User
    {
      Id = Guid.NewGuid(),
      FirstName = "John",
      Email = "user@test.com",
      IsConfirmed = false
    };

    userRepository
      .Setup(r => r.GetByEmailAsync(user.Email))
      .ReturnsAsync(user);

    userRepository
      .Setup(r => r.UpdateAsync(user))
      .Returns(Task.CompletedTask);

    var result = await service.ResendConfirmationEmailAsync(user.Email);

    Assert.Equal("A new confirmation email has been sent.", result);
    Assert.False(string.IsNullOrWhiteSpace(user.ConfirmationToken));
    Assert.NotNull(user.TokenExpiresAt);
    userRepository.Verify(r => r.UpdateAsync(user), Times.Once);
    notificationService.Verify(n => n.CreateNotificationAsync(
      user.Id,
      "Confirm your Comit account",
      It.Is<string>(body =>
        body.Contains("/auth/confirm?token=") &&
        body.Contains(user.ConfirmationToken!)),
      Domain.Enums.NotificationType.Email),
      Times.Once);
  }

  private static RegisterRequest BuildRegisterRequest()
  {
    return new RegisterRequest
    {
      FirstName = "John",
      LastName = "Doe",
      Email = "john.doe@test.com",
      Phone = "819-123-4567",
      Password = "StrongPassword123"
    };
  }

  private static (
    AuthService service,
    Mock<IUserRepository> userRepository,
    Mock<IPasswordHasher> passwordHasher,
    Mock<IJwtProvider> jwtProvider,
    Mock<INotificationService> notificationService) BuildAuthService()
  {
    var userRepository = new Mock<IUserRepository>();
    var passwordHasher = new Mock<IPasswordHasher>();
    var jwtProvider = new Mock<IJwtProvider>();
    var notificationService = new Mock<INotificationService>();
    var configuration = new Mock<IConfiguration>();
    configuration.Setup(c => c["FRONTEND_URL"]).Returns("http://localhost:3000");

    var service = new AuthService(
      userRepository.Object,
      passwordHasher.Object,
      jwtProvider.Object,
      notificationService.Object,
      configuration.Object
    );

    return (service, userRepository, passwordHasher, jwtProvider, notificationService);
  }
}
