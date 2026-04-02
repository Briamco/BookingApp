using BookingApp.Infrastructure.Services;

namespace BookingApp.Tests;

public class PasswordHasherTests
{
  [Fact]
  public void Hash_ShouldReturnDifferentValueFromPlainText()
  {
    var hasher = new PasswordHasher();

    var password = "MyStrongPassword123";
    var hash = hasher.Hash(password);

    Assert.NotEqual(password, hash);
    Assert.True(hasher.Verify(password, hash));
  }

  [Fact]
  public void Verify_WithWrongPassword_ShouldReturnFalse()
  {
    var hasher = new PasswordHasher();

    var hash = hasher.Hash("CorrectPassword123");

    Assert.False(hasher.Verify("WrongPassword123", hash));
  }

  [Fact]
  public void Hash_SamePasswordTwice_ShouldProduceDifferentHashes()
  {
    var hasher = new PasswordHasher();

    var password = "RepeatableInput123";
    var hash1 = hasher.Hash(password);
    var hash2 = hasher.Hash(password);

    Assert.NotEqual(hash1, hash2);
    Assert.True(hasher.Verify(password, hash1));
    Assert.True(hasher.Verify(password, hash2));
  }
}
