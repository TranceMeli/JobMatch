namespace RefreshTokens.Api.Entities;

public class QuestionnaireResponse
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string JobType { get; set; } = string.Empty;
    public string AnswersJson { get; set; } = "{}";
    public DateTime UpdatedAt { get; set; }
}
