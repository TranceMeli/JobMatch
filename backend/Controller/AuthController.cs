using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RefreshTokens.Api.Auth;
using RefreshTokens.Api.Data;
using RefreshTokens.Api.Entities;
using RefreshTokens.Api.Models;

namespace RefreshTokens.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly JwtSettings _jwtSettings;

    public AuthController(
        AppDbContext db,
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        IOptions<JwtSettings> jwtSettings)
    {
        _db = db;
        _userManager = userManager;
        _tokenService = tokenService;
        _jwtSettings = jwtSettings.Value;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (await _userManager.FindByEmailAsync(request.Email) is not null)
        {
            return BadRequest($"Email '{request.Email}' is already registered.");
        }

        var user = new ApplicationUser
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            UserName = request.Email,
            Email = request.Email,
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(e => e.Description));
        }

        await _userManager.AddToRoleAsync(user, Roles.User);
        return Ok($"User '{request.Email}' registered successfully.");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return Unauthorized();
        }

        return await IssueTokensAsync(user);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        if (!Request.Cookies.TryGetValue("refreshToken", out var rawToken) || string.IsNullOrEmpty(rawToken))
        {
            return Unauthorized();
        }

        var existing = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.Token == rawToken);
        if (existing is null)
        {
            return Unauthorized();
        }

        if (!existing.IsActive)
        {
            if (existing.Revoked is not null)
            {
                await RevokeAllActiveTokensAsync(existing.UserId);
            }
            Response.Cookies.Delete("refreshToken");
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(existing.UserId);
        if (user is null)
        {
            return Unauthorized();
        }

        var newRefreshToken = _tokenService.CreateRefreshToken();
        var refreshExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenDays);

        existing.Revoked = DateTime.UtcNow;
        existing.ReplacedByToken = newRefreshToken;

        _db.RefreshTokens.Add(new RefreshToken
        {
            Token = newRefreshToken,
            UserId = user.Id,
            Created = DateTime.UtcNow,
            Expires = refreshExpiresAt,
        });
        await _db.SaveChangesAsync();

        SetRefreshCookie(newRefreshToken, refreshExpiresAt);

        var roles = await _userManager.GetRolesAsync(user);
        var (accessToken, accessExpiresAt) = _tokenService.CreateAccessToken(user, roles);

        return Ok(new AuthResponse(user.Id, user.Email!, roles, accessToken, accessExpiresAt));
    }

    [HttpPost("revoke")]
    public async Task<IActionResult> Revoke()
    {
        if (Request.Cookies.TryGetValue("refreshToken", out var rawToken) && !string.IsNullOrEmpty(rawToken))
        {
            var token = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.Token == rawToken);
            if (token is not null && token.IsActive)
            {
                token.Revoked = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }

        Response.Cookies.Delete("refreshToken");
        return Ok("Refresh token revoked.");
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Unauthorized();
        }

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            firstName = user.FirstName,
            lastName = user.LastName,
            roles,
        });
    }

    private async Task<IActionResult> IssueTokensAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var (accessToken, accessExpiresAt) = _tokenService.CreateAccessToken(user, roles);

        var refreshToken = _tokenService.CreateRefreshToken();
        var refreshExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenDays);

        _db.RefreshTokens.Add(new RefreshToken
        {
            Token = refreshToken,
            UserId = user.Id,
            Created = DateTime.UtcNow,
            Expires = refreshExpiresAt,
        });
        await _db.SaveChangesAsync();

        SetRefreshCookie(refreshToken, refreshExpiresAt);

        return Ok(new AuthResponse(user.Id, user.Email!, roles, accessToken, accessExpiresAt));
    }


    private void SetRefreshCookie(string token, DateTime expiresAt)
    {
        Response.Cookies.Append("refreshToken", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = expiresAt,
            Path = "/",
        });
    }

    private async Task RevokeAllActiveTokensAsync(string userId)
    {
        var activeTokens = await _db.RefreshTokens
            .Where(t => t.UserId == userId && t.Revoked == null)
            .ToListAsync();

        foreach (var token in activeTokens)
        {
            token.Revoked = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
    }
}
