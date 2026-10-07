namespace RefreshTokens.Api.Entities;

public class Interest
{
    public int Id { get; set; }
    public string FromUserId { get; set; } = string.Empty;
    public string ToUserId { get; set; } = string.Empty;
    public string JobType { get; set; } = string.Empty;
    public bool IsPositive { get; set; }
    public DateTime CreatedAt { get; set; }
}
