using System.Text.Json;
using RefreshTokens.Api.Entities;

namespace RefreshTokens.Api.Services;

public sealed class MatchingService
{
    public MatchResult Calculate(
        Profile applicantProfile,
        QuestionnaireResponse applicantResponse,
        Profile companyProfile,
        QuestionnaireResponse companyResponse)
    {
        var applicantAnswers = Parse(applicantResponse.AnswersJson);
        var companyAnswers = Parse(companyResponse.AnswersJson);

        // Persönliche Freitext-Fragen: gemeinsame Themen über alle Antworten einer Seite
        var applicantThemes = TextThemes.Detect(PersonalApplicantKeys.Select(k => GetString(applicantAnswers, k)));
        var companyThemes = TextThemes.Detect(PersonalCompanyKeys.Select(k => GetString(companyAnswers, k)));
        var commonThemes = applicantThemes.Intersect(companyThemes).ToList();
        // Dice-Koeffizient: bestraft ausführlichere Antworten weniger als Jaccard
        var personalValue = applicantThemes.Count == 0 || companyThemes.Count == 0
            ? 0
            : 2d * commonThemes.Count / (applicantThemes.Count + companyThemes.Count);

        // Gewichte ergeben 100: 85 % Auswahlfragen, 15 % persönliche Antworten
        var criteria = new List<Criterion>
        {
            new("Technologien", 17, Jaccard(applicantAnswers, companyAnswers, "technologies")),
            new("Entwicklungsbereiche", 13, Jaccard(applicantAnswers, companyAnswers, "developmentFocus")),
            new("Arbeitsmodell", 13, WorkModel(applicantAnswers, companyAnswers)),
            new("Einarbeitung", 8, ScaleCloseness(applicantAnswers, companyAnswers, "onboarding")),
            new("Teamarbeit", 8, Exact(applicantAnswers, companyAnswers, "teamStyle")),
            new("Eigenverantwortung", 8, ScaleCloseness(applicantAnswers, companyAnswers, "autonomy")),
            new("Arbeitgeberangebot", 9, Jaccard(applicantAnswers, companyAnswers, "priorities", "offers")),
            new("Entwicklungsmöglichkeiten", 9, Jaccard(applicantAnswers, companyAnswers, "careerDirection", "careerSupport")),
            new("Persönliche Antworten", PersonalWeight, personalValue)
        };

        var score = (int)Math.Round(criteria.Sum(c => c.Weight * c.Value), MidpointRounding.AwayFromZero);
        score = Math.Clamp(score, 0, 100);

        // Gemeinsame Themen aus den Freitexten bekommen einen festen Platz, sobald mindestens zwei übereinstimmen
        var personalReason = commonThemes.Count >= 2
            ? $"Ihr legt beide Wert auf {JoinThemes(commonThemes.Take(3).ToList())}"
            : null;

        var reasons = criteria
            .Where(c => c.Label != "Persönliche Antworten" && c.Value >= 0.75)
            .OrderByDescending(c => c.Value * c.Weight)
            .Take(personalReason is null ? 3 : 2)
            .Select(c => c.Label switch
            {
                "Technologien" => "Sehr gute Übereinstimmung beim gewünschten bzw. eingesetzten Tech-Stack",
                "Entwicklungsbereiche" => "Die fachlichen Schwerpunkte passen sehr gut zusammen",
                "Arbeitsmodell" => "Das gewünschte und angebotene Arbeitsmodell passt zusammen",
                "Einarbeitung" => "Die Erwartungen an die Einarbeitung passen gut zusammen",
                "Teamarbeit" => "Die bevorzugte Arbeitsweise passt zum Entwicklerteam",
                "Eigenverantwortung" => "Die Erwartungen an Eigenverantwortung sind ähnlich",
                "Arbeitgeberangebot" => "Wichtige Erwartungen des Bewerbers werden vom Unternehmen angeboten",
                "Entwicklungsmöglichkeiten" => "Die gewünschte Entwicklung passt zu den angebotenen Entwicklungsmöglichkeiten",
                _ => "Gute Übereinstimmung"
            })
            .ToList();

        if (personalReason is not null) reasons.Add(personalReason);

        if (reasons.Count == 0)
        {
            reasons.Add("Noch wenig Übereinstimmung bei den gemeinsamen Kriterien");
        }

        return new MatchResult(score, reasons);
    }

    public const int PersonalWeight = 15;

    private static readonly string[] PersonalApplicantKeys = ["motivation", "problemSolving", "expectations", "aboutYou"];
    private static readonly string[] PersonalCompanyKeys = ["juniorReason", "support", "expectations", "culture"];

    private static string JoinThemes(IReadOnlyList<string> themes) => themes.Count switch
    {
        0 => string.Empty,
        1 => themes[0],
        _ => string.Join(", ", themes.Take(themes.Count - 1)) + " und " + themes[^1]
    };

    private static Dictionary<string, JsonElement> Parse(string json)
    {
        return JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json)
            ?? new Dictionary<string, JsonElement>();
    }

    private static double Jaccard(
        Dictionary<string, JsonElement> left,
        Dictionary<string, JsonElement> right,
        string leftKey,
        string? rightKey = null)
    {
        var a = GetStrings(left, leftKey);
        var b = GetStrings(right, rightKey ?? leftKey);

        if (a.Count == 0 || b.Count == 0) return 0;

        var intersection = a.Intersect(b, StringComparer.OrdinalIgnoreCase).Count();
        var union = a.Union(b, StringComparer.OrdinalIgnoreCase).Count();

        return union == 0 ? 0 : (double)intersection / union;
    }

    private static double WorkModel(
        Dictionary<string, JsonElement> applicant,
        Dictionary<string, JsonElement> company)
    {
        var preferred = GetString(applicant, "workModel");
        var offered = GetStrings(company, "workModel");

        if (string.IsNullOrWhiteSpace(preferred) || offered.Count == 0) return 0;

        return offered.Contains(preferred, StringComparer.OrdinalIgnoreCase) ? 1 : 0;
    }

    private static double ScaleCloseness(
        Dictionary<string, JsonElement> left,
        Dictionary<string, JsonElement> right,
        string key)
    {
        if (!TryGetScale(left, key, out var a) || !TryGetScale(right, key, out var b)) return 0;
        return 1 - (Math.Abs(a - b) / 4d);
    }

    private static double Exact(
        Dictionary<string, JsonElement> left,
        Dictionary<string, JsonElement> right,
        string key)
    {
        var a = GetString(left, key);
        var b = GetString(right, key);

        return !string.IsNullOrWhiteSpace(a) &&
               !string.IsNullOrWhiteSpace(b) &&
               string.Equals(a, b, StringComparison.OrdinalIgnoreCase)
            ? 1
            : 0;
    }

    private static HashSet<string> GetStrings(Dictionary<string, JsonElement> source, string key)
    {
        if (!source.TryGetValue(key, out var element) || element.ValueKind != JsonValueKind.Array)
            return new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        return element
            .EnumerateArray()
            .Where(x => x.ValueKind == JsonValueKind.String)
            .Select(x => x.GetString()!.Trim())
            .Where(x => x.Length > 0)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
    }

    private static string GetString(Dictionary<string, JsonElement> source, string key)
    {
        if (!source.TryGetValue(key, out var element) || element.ValueKind != JsonValueKind.String)
            return string.Empty;

        return element.GetString()?.Trim() ?? string.Empty;
    }

    private static bool TryGetScale(Dictionary<string, JsonElement> source, string key, out int value)
    {
        value = 0;

        if (!source.TryGetValue(key, out var element))
            return false;

        if (element.ValueKind == JsonValueKind.Number && element.TryGetInt32(out value))
            return value is >= 1 and <= 5;

        if (element.ValueKind == JsonValueKind.String && int.TryParse(element.GetString(), out value))
            return value is >= 1 and <= 5;

        return false;
    }
}

public sealed record MatchResult(int Score, IReadOnlyList<string> Reasons);

public sealed record Criterion(string Label, int Weight, double Value);


