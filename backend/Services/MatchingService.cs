using System.Text.Json;
using RefreshTokens.Api.Entities;
using O = RefreshTokens.Api.Services.QuestionnaireCatalog.Options;

namespace RefreshTokens.Api.Services;

/// <summary>
/// Berechnet den Match-Score: 85 % aus den Auswahlfragen (gewichtete Kriterien),
/// 15 % aus gemeinsamen Themen in den Freitexten. Kriterien, die eine Seite nicht
/// beantwortet hat, werden übersprungen und die übrigen Gewichte neu verteilt.
/// </summary>
public sealed class MatchingService
{
    public const int ChoiceShare = 85;
    public const int PersonalShare = 15;

    private static readonly string[] PersonalApplicantKeys = ["motivation", "problemSolving", "expectations", "lastProject", "aboutYou"];
    private static readonly string[] PersonalCompanyKeys = ["juniorReason", "support", "expectations", "firstWeeks", "culture"];

    public MatchResult Calculate(
        Profile applicantProfile,
        QuestionnaireResponse applicantResponse,
        Profile companyProfile,
        QuestionnaireResponse companyResponse)
    {
        var a = Parse(applicantResponse.AnswersJson);
        var c = Parse(companyResponse.AnswersJson);

        // Relative Gewichte; null-Werte (unbeantwortet) zählen nicht mit
        var criteria = new List<Criterion>
        {
            // Technik
            new("Technologien", 17, Jaccard(a, c, "technologies")),
            new("Entwicklungsbereiche", 13, Jaccard(a, c, "developmentFocus")),
            new("Werkzeuge", 4, Coverage(a, c, "tools")),
            new("Arbeitsweisen", 3, Coverage(a, c, "methods")),
            new("Code-Qualität", 3, ScaleCloseness(a, c, "codeQuality")),
            new("Features und Wartung", 3, ScaleCloseness(a, c, "featureVsMaintenance")),
            new("KI-Tools", 2, AiTools(a, c)),

            // Zusammenarbeit
            new("Teamarbeit", 8, Exact(a, c, "teamStyle")),
            new("Eigenverantwortung", 8, ScaleCloseness(a, c, "autonomy")),
            new("Sprachen", 5, Coverage(a, c, "workLanguages")),
            new("Feedback", 4, CompanyAtMost(a, c, "feedbackFrequency", O.FeedbackFrequency)),
            new("Pair Programming", 3, ScaleCloseness(a, c, "pairProgramming")),
            new("Kommunikation", 3, ScaleCloseness(a, c, "communicationStyle")),
            new("Meetings", 2, CompanyAtMost(a, c, "meetings", O.Meetings)),
            new("Teamgröße", 2, OrdinalCloseness(a, c, "teamSize", O.TeamSizes)),

            // Lernen und Entwicklung
            new("Einarbeitung", 8, ScaleCloseness(a, c, "onboarding")),
            new("Buddy", 3, ImportanceVsYesNo(a, c, "buddy")),
            new("Lernstil", 3, Overlap(a, c, "learningStyle")),
            new("Weiterbildungsbudget", 3, ImportanceVsYesNo(a, c, "learningBudget")),
            new("Entwicklungsmöglichkeiten", 9, Jaccard(a, c, "careerDirection", "careerSupport")),

            // Rahmenbedingungen
            new("Arbeitsmodell", 13, WorkModel(a, c)),
            new("Bürotage", 6, CompanyAtMost(a, c, "officeDays", O.OfficeDays)),
            new("Wochenstunden", 6, OrdinalCloseness(a, c, "hoursPerWeek", O.Hours)),
            new("Startzeitpunkt", 4, OrdinalCloseness(a, c, "startDate", O.StartDates)),
            new("Planbare Arbeitszeiten", 4, ImportanceVsLevel(a, c, "overtime", O.Overtime)),
            new("Deutschniveau", 5, ApplicantAtLeast(a, c, "germanLevel", O.GermanLevels)),

            // Werte
            new("Arbeitgeberangebot", 9, Jaccard(a, c, "priorities", "offers")),
            new("Hierarchien", 3, ImportanceVsLevel(a, c, "hierarchy", O.Hierarchy)),
            new("Branche", 3, ContainsSingle(a, c, "industries")),
            new("Gesellschaftlicher Nutzen", 2, CompanyAtLeastScale(a, c, "socialImpact")),

            // Bewerbungsprozess
            new("Auswahlprozess", 2, Coverage(a, c, "interviewFormat", applicantIsReference: false)),
            new("Prozessdauer", 2, CompanyAtMost(a, c, "processDuration", O.ProcessDuration)),
        };

        var answered = criteria.Where(x => x.Value is not null).ToList();
        var choiceValue = answered.Count == 0
            ? 0
            : answered.Sum(x => x.Weight * x.Value!.Value) / answered.Sum(x => x.Weight);

        // Freitexte: gemeinsame Themen über alle Antworten einer Seite (Dice-Koeffizient)
        var applicantThemes = TextThemes.Detect(PersonalApplicantKeys.Select(k => GetString(a, k)));
        var companyThemes = TextThemes.Detect(PersonalCompanyKeys.Select(k => GetString(c, k)));
        var commonThemes = applicantThemes.Intersect(companyThemes).ToList();
        var personalValue = applicantThemes.Count == 0 || companyThemes.Count == 0
            ? 0
            : 2d * commonThemes.Count / (applicantThemes.Count + companyThemes.Count);

        var score = (int)Math.Round(ChoiceShare * choiceValue + PersonalShare * personalValue, MidpointRounding.AwayFromZero);
        score = Math.Clamp(score, 0, 100);

        // Gemeinsame Themen bekommen einen festen Platz, sobald mindestens zwei übereinstimmen
        var personalReason = commonThemes.Count >= 2
            ? $"Ihr legt beide Wert auf {JoinThemes(commonThemes.Take(3).ToList())}"
            : null;

        var reasons = answered
            .Where(x => x.Value >= 0.75)
            .OrderByDescending(x => x.Value * x.Weight)
            .Take(personalReason is null ? 3 : 2)
            .Select(x => ReasonText(x.Label))
            .ToList();

        if (personalReason is not null) reasons.Add(personalReason);

        if (reasons.Count == 0)
        {
            reasons.Add("Noch wenig Übereinstimmung bei den gemeinsamen Kriterien");
        }

        return new MatchResult(score, reasons);
    }

    private static string ReasonText(string label) => label switch
    {
        "Technologien" => "Sehr gute Übereinstimmung beim gewünschten bzw. eingesetzten Tech-Stack",
        "Entwicklungsbereiche" => "Die fachlichen Schwerpunkte passen sehr gut zusammen",
        "Arbeitsmodell" => "Das gewünschte und angebotene Arbeitsmodell passt zusammen",
        "Einarbeitung" => "Die Erwartungen an die Einarbeitung passen gut zusammen",
        "Teamarbeit" => "Die bevorzugte Arbeitsweise passt zum Entwicklerteam",
        "Eigenverantwortung" => "Die Erwartungen an Eigenverantwortung sind ähnlich",
        "Arbeitgeberangebot" => "Wichtige Erwartungen des Bewerbers werden vom Unternehmen angeboten",
        "Entwicklungsmöglichkeiten" => "Die gewünschte Entwicklung passt zu den angebotenen Entwicklungsmöglichkeiten",
        "Werkzeuge" => "Die Werkzeuge des Teams sind bereits bekannt",
        "Arbeitsweisen" => "Die Arbeitsweisen des Teams sind bereits bekannt",
        "Code-Qualität" => "Ähnliche Ansprüche an Tests und Code-Qualität",
        "Features und Wartung" => "Die Art der Aufgaben passt zusammen",
        "KI-Tools" => "Die Haltung zu KI-Tools passt zusammen",
        "Sprachen" => "Die Teamsprache passt",
        "Feedback" => "Feedback kommt so oft wie gewünscht",
        "Pair Programming" => "Ähnliche Vorstellungen vom Pair Programming",
        "Kommunikation" => "Der Kommunikationsstil passt zusammen",
        "Meetings" => "Der Meeting-Umfang passt",
        "Teamgröße" => "Die Teamgröße passt",
        "Buddy" => "Ein fester Ansprechpartner ist vorgesehen",
        "Lernstil" => "Die Art der Wissensweitergabe passt zum Lernstil",
        "Weiterbildungsbudget" => "Ein Weiterbildungsbudget ist vorhanden",
        "Bürotage" => "Die Anzahl der Bürotage passt",
        "Wochenstunden" => "Die Wochenstunden passen zusammen",
        "Startzeitpunkt" => "Der Startzeitpunkt passt",
        "Planbare Arbeitszeiten" => "Die Arbeitszeiten sind so planbar wie gewünscht",
        "Deutschniveau" => "Das Deutschniveau passt zur Stelle",
        "Hierarchien" => "Die Entscheidungswege passen zum Wunsch nach flachen Hierarchien",
        "Branche" => "Die Branche passt zu den Interessen",
        "Gesellschaftlicher Nutzen" => "Das Produkt hat den gewünschten gesellschaftlichen Nutzen",
        "Auswahlprozess" => "Der Auswahlprozess passt zu den bevorzugten Formen",
        "Prozessdauer" => "Die Rückmeldung kommt rechtzeitig",
        _ => "Gute Übereinstimmung"
    };

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

    // ---- Kriterien: null = mindestens eine Seite hat nicht geantwortet ----

    private static double? Jaccard(Dictionary<string, JsonElement> left, Dictionary<string, JsonElement> right, string leftKey, string? rightKey = null)
    {
        var a = GetStrings(left, leftKey);
        var b = GetStrings(right, rightKey ?? leftKey);
        if (a.Count == 0 || b.Count == 0) return null;

        return (double)a.Intersect(b, StringComparer.OrdinalIgnoreCase).Count() / a.Union(b, StringComparer.OrdinalIgnoreCase).Count();
    }

    /// <summary>Anteil der Auswahl der Referenzseite, der auch auf der anderen Seite vorkommt (Standard: Unternehmensseite ist Referenz).</summary>
    private static double? Coverage(Dictionary<string, JsonElement> applicant, Dictionary<string, JsonElement> company, string key, bool applicantIsReference = false)
    {
        var a = GetStrings(applicant, key);
        var c = GetStrings(company, key);
        if (a.Count == 0 || c.Count == 0) return null;

        var reference = applicantIsReference ? a : c;
        var other = applicantIsReference ? c : a;
        return (double)reference.Count(other.Contains) / reference.Count;
    }

    /// <summary>Gemeinsame Einträge bezogen auf die kleinere Auswahl.</summary>
    private static double? Overlap(Dictionary<string, JsonElement> left, Dictionary<string, JsonElement> right, string key)
    {
        var a = GetStrings(left, key);
        var b = GetStrings(right, key);
        if (a.Count == 0 || b.Count == 0) return null;

        return (double)a.Count(b.Contains) / Math.Min(a.Count, b.Count);
    }

    private static double? WorkModel(Dictionary<string, JsonElement> applicant, Dictionary<string, JsonElement> company)
    {
        var preferred = GetString(applicant, "workModel");
        var offered = GetStrings(company, "workModel");
        if (string.IsNullOrWhiteSpace(preferred) || offered.Count == 0) return null;

        return offered.Contains(preferred) ? 1 : 0;
    }

    private static double? Exact(Dictionary<string, JsonElement> left, Dictionary<string, JsonElement> right, string key)
    {
        var a = GetString(left, key);
        var b = GetString(right, key);
        if (string.IsNullOrWhiteSpace(a) || string.IsNullOrWhiteSpace(b)) return null;

        return string.Equals(a, b, StringComparison.OrdinalIgnoreCase) ? 1 : 0;
    }

    private static double? ScaleCloseness(Dictionary<string, JsonElement> left, Dictionary<string, JsonElement> right, string key)
    {
        if (!TryGetScale(left, key, out var a) || !TryGetScale(right, key, out var b)) return null;
        return 1 - Math.Abs(a - b) / 4d;
    }

    /// <summary>Unternehmen erfüllt mindestens den Wunsch (Skala 1–5), sonst anteiliger Abzug.</summary>
    private static double? CompanyAtLeastScale(Dictionary<string, JsonElement> applicant, Dictionary<string, JsonElement> company, string key)
    {
        if (!TryGetScale(applicant, key, out var wish) || !TryGetScale(company, key, out var offer)) return null;
        return offer >= wish ? 1 : 1 - (wish - offer) / 4d;
    }

    private static double? OrdinalCloseness(Dictionary<string, JsonElement> left, Dictionary<string, JsonElement> right, string key, string[] options)
    {
        if (!TryGetIndex(left, key, options, out var a) || !TryGetIndex(right, key, options, out var b)) return null;
        return 1 - (double)Math.Abs(a - b) / (options.Length - 1);
    }

    /// <summary>Der Wert des Unternehmens darf den Wunsch nicht überschreiten (z. B. Bürotage, Meetings, Prozessdauer).</summary>
    private static double? CompanyAtMost(Dictionary<string, JsonElement> applicant, Dictionary<string, JsonElement> company, string key, string[] options)
    {
        if (!TryGetIndex(applicant, key, options, out var limit) || !TryGetIndex(company, key, options, out var actual)) return null;
        return actual <= limit ? 1 : 1 - (double)(actual - limit) / (options.Length - 1);
    }

    /// <summary>Der Bewerber erreicht mindestens das geforderte Niveau (z. B. Deutsch).</summary>
    private static double? ApplicantAtLeast(Dictionary<string, JsonElement> applicant, Dictionary<string, JsonElement> company, string key, string[] options)
    {
        if (!TryGetIndex(applicant, key, options, out var level) || !TryGetIndex(company, key, options, out var required)) return null;
        return level >= required ? 1 : Math.Max(0, 1 - (required - level) / 3d);
    }

    /// <summary>Wichtigkeit (Skala 1–5) gegen ein Ja/Nein-Angebot.</summary>
    private static double? ImportanceVsYesNo(Dictionary<string, JsonElement> applicant, Dictionary<string, JsonElement> company, string key)
    {
        var offered = GetString(company, key);
        if (!TryGetScale(applicant, key, out var importance) || string.IsNullOrWhiteSpace(offered)) return null;

        return offered == "Ja" ? 1 : 1 - (importance - 1) / 4d;
    }

    /// <summary>Wichtigkeit (Skala 1–5) gegen eine Stufe, deren erste Option den Wunsch am besten erfüllt.</summary>
    private static double? ImportanceVsLevel(Dictionary<string, JsonElement> applicant, Dictionary<string, JsonElement> company, string key, string[] levels)
    {
        if (!TryGetScale(applicant, key, out var importance) || !TryGetIndex(company, key, levels, out var index)) return null;

        var wish = (importance - 1) / 4d;
        var fulfilled = 1 - (double)index / (levels.Length - 1);
        return 1 - Math.Max(0, wish - fulfilled);
    }

    private static double? ContainsSingle(Dictionary<string, JsonElement> applicant, Dictionary<string, JsonElement> company, string key)
    {
        var interests = GetStrings(applicant, key);
        var value = GetString(company, key);
        if (interests.Count == 0 || string.IsNullOrWhiteSpace(value)) return null;

        return interests.Contains(value) ? 1 : 0;
    }

    private static double? AiTools(Dictionary<string, JsonElement> applicant, Dictionary<string, JsonElement> company)
    {
        if (!TryGetIndex(applicant, "aiTools", O.AiToolsApplicant, out var wish) ||
            !TryGetIndex(company, "aiTools", O.AiToolsCompany, out var policy)) return null;

        // Zeilen: Ja, gern / Egal / Lieber nicht – Spalten: Erwünscht / Erlaubt / Nicht erlaubt
        double[,] table =
        {
            { 1, 0.8, 0 },
            { 1, 1, 1 },
            { 0.5, 1, 1 },
        };
        return table[wish, policy];
    }

    // ---- Lesen der Antworten ----

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

    private static bool TryGetIndex(Dictionary<string, JsonElement> source, string key, string[] options, out int index)
    {
        var value = GetString(source, key);
        index = Array.FindIndex(options, o => string.Equals(o, value, StringComparison.OrdinalIgnoreCase));
        return index >= 0;
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

public sealed record Criterion(string Label, int Weight, double? Value);
