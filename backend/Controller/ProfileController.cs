using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RefreshTokens.Api.Data;
using RefreshTokens.Api.Entities;

namespace RefreshTokens.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProfileController(AppDbContext db) => _db = db;

    private string UserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
        ?? throw new InvalidOperationException("Keine User-ID im Token gefunden.");

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var profile = await _db.Profiles.FindAsync(UserId);
        return Ok(Serialize(profile));
    }

    [HttpPost]
    public async Task<IActionResult> Save([FromBody] JsonElement body)
    {
        if (!body.TryGetProperty("name", out var nameProp) || string.IsNullOrWhiteSpace(nameProp.GetString()))
        {
            return BadRequest(new { error = "name ist erforderlich" });
        }

        var name = nameProp.GetString()!.Trim();
        var userId = UserId;

        var data = new Dictionary<string, JsonElement>();
        foreach (var prop in body.EnumerateObject())
        {
            if (prop.Name == "name") continue;
            data[prop.Name] = prop.Value.Clone();
        }

        var profile = await _db.Profiles.FindAsync(userId);
        if (profile is null)
        {
            profile = new Profile { UserId = userId, Name = name, Data = JsonSerializer.Serialize(data), UpdatedAt = DateTime.UtcNow };
            _db.Profiles.Add(profile);
        }
        else
        {
            profile.Name = name;
            profile.Data = JsonSerializer.Serialize(data);
            profile.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok(Serialize(profile));
    }

    private static Dictionary<string, JsonElement>? Serialize(Profile? profile)
    {
        if (profile is null) return null;

        var result = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(profile.Data) ?? new();
        result["name"] = JsonSerializer.SerializeToElement(profile.Name);
        result["updatedAt"] = JsonSerializer.SerializeToElement(profile.UpdatedAt.ToString("o"));
        result["userId"] = JsonSerializer.SerializeToElement(profile.UserId);
        return result;
    }
}