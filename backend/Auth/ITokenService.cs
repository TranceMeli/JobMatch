using RefreshTokens.Api.Entities;

namespace RefreshTokens.Api.Auth;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) CreateAccessToken(ApplicationUser user, IEnumerable<string> roles);

    string CreateRefreshToken();
}