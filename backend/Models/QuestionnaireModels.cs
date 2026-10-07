namespace RefreshTokens.Api.Models;

public record QuestionnaireQuestionDto(
    string Key,
    string Text,
    string Type,
    IReadOnlyList<string> Options,
    bool Required);

public record QuestionnaireResponseSummaryDto(
    string JobType,
    DateTime UpdatedAt);

public record SaveQuestionnaireRequest(
    Dictionary<string, object?> Answers);

public record SaveInterestRequest(
    string TargetUserId,
    string JobType,
    bool Positive);

public record MatchCandidateDto(
    string UserId,
    string Name,
    string Title,
    string Location,
    IReadOnlyList<string> Tags,
    string Description,
    string JobType,
    int MatchScore,
    IReadOnlyList<string> MatchReasons);

public record MatchDto(
    string UserId,
    string Name,
    string Title,
    string Location,
    string JobType,
    int MatchScore,
    IReadOnlyList<string> MatchReasons,
    string? Email,
    string? LinkedIn);
