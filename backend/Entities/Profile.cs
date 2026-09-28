namespace RefreshTokens.Api.Entities;

public class Profile
{
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Data { get; set; } = "{}";
    public DateTime UpdatedAt { get; set; }

    public ApplicationUser? User { get; set; }
}