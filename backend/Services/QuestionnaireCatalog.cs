namespace RefreshTokens.Api.Services;

using RefreshTokens.Api.Models;

public static class QuestionnaireCatalog
{
    public const string JuniorDeveloper = "Junior Developer";

    private static readonly string[] JobTypes =
    [
        JuniorDeveloper
    ];

    private static readonly IReadOnlyList<QuestionDefinition> ApplicantQuestions =
    [
        new(
            "technologies",
            "Mit welchen Technologien möchtest du gerne arbeiten?",
            "multi",
            ["C#", "Java", "Python", "JavaScript / TypeScript", "React", "Vue", "Angular", "Django", "ASP.NET Core", "PHP", "Symfony"],
            true),
        new(
            "developmentFocus",
            "Welche Bereiche der Entwicklung interessieren dich besonders?",
            "multi",
            ["Frontend", "Backend", "Full Stack", "Webentwicklung", "APIs", "Datenbanken"],
            true),
        new(
            "workModel",
            "In welchem Arbeitsmodell möchtest du arbeiten?",
            "single",
            ["Remote", "Hybrid", "Vor Ort"],
            true),
        new(
            "onboarding",
            "Wie wichtig ist dir eine strukturierte Einarbeitung?",
            "scale",
            [],
            true),
        new(
            "teamStyle",
            "Wie möchtest du am liebsten arbeiten?",
            "single",
            ["Überwiegend selbstständig", "Überwiegend im Team", "Mischung aus beidem"],
            true),
        new(
            "autonomy",
            "Wie viel Verantwortung möchtest du als Junior übernehmen?",
            "scale",
            [],
            true),
        new(
            "priorities",
            "Was ist dir bei deinem ersten Arbeitgeber besonders wichtig?",
            "multi",
            ["Mentoring", "Weiterbildung", "Moderne Technologien", "Interessante Projekte", "Gutes Team", "Remote", "Flexible Arbeitszeiten", "Eigenverantwortung"],
            true),
        new(
            "careerDirection",
            "In welche Richtung möchtest du dich langfristig entwickeln?",
            "multi",
            ["Frontend", "Backend", "Full Stack", "Data Analysis", "2D Game Development", "AI"],
            true),
        new(
            "motivation",
            "Warum hast du dich für die Softwareentwicklung entschieden?",
            "text",
            [],
            true),
        new(
            "problemSolving",
            "Wie gehst du vor, wenn du bei einer technischen Aufgabe nicht weiterkommst?",
            "text",
            [],
            true),
        new(
            "expectations",
            "Was erwartest du von deinem ersten Arbeitgeber?",
            "text",
            [],
            true),
        new(
            "aboutYou",
            "Gibt es noch etwas, das du über deine Arbeitsweise oder Motivation sagen möchtest?",
            "text",
            [],
            false)
    ];

    private static readonly IReadOnlyList<QuestionDefinition> CompanyQuestions =
    [
        new(
            "technologies",
            "Welche Technologien werden in diesem Team tatsächlich eingesetzt?",
            "multi",
            ["C#", "Java", "Python", "JavaScript / TypeScript", "React", "Vue", "Angular", "Django", "ASP.NET Core", "PHP", "Symfony"],
            true),
        new(
            "developmentFocus",
            "In welchen Bereichen arbeitet der Junior überwiegend?",
            "multi",
            ["Frontend", "Backend", "Full Stack", "Webentwicklung", "APIs", "Datenbanken"],
            true),
        new(
            "workModel",
            "Welche Arbeitsmodelle bietet ihr für diese Stelle an?",
            "multi",
            ["Remote", "Hybrid", "Vor Ort"],
            true),
        new(
            "onboarding",
            "Wie strukturiert ist die Einarbeitung für einen Junior?",
            "scale",
            [],
            true),
        new(
            "teamStyle",
            "Wie arbeitet das Entwicklerteam typischerweise?",
            "single",
            ["Überwiegend selbstständig", "Überwiegend im Team", "Mischung aus beidem"],
            true),
        new(
            "autonomy",
            "Wie viel Eigenverantwortung erhält ein Junior?",
            "scale",
            [],
            true),
        new(
            "offers",
            "Was bietet ihr einem Junior besonders?",
            "multi",
            ["Mentoring", "Weiterbildung", "Moderne Technologien", "Interessante Projekte", "Gutes Team", "Remote", "Flexible Arbeitszeiten", "Eigenverantwortung"],
            true),
        new(
            "careerSupport",
            "Welche Entwicklungsmöglichkeiten gibt es?",
            "multi",
            ["Frontend", "Backend", "Full Stack", "Data Analysis", "2D Game Development", "AI"],
            true),
        new(
            "juniorReason",
            "Warum sucht ihr einen Junior Developer für diese Stelle?",
            "text",
            [],
            true),
        new(
            "support",
            "Wie unterstützt ihr einen Junior, wenn er bei einer technischen Aufgabe nicht weiterkommt?",
            "text",
            [],
            true),
        new(
            "expectations",
            "Was erwartet ihr von einem Junior nach den ersten sechs Monaten?",
            "text",
            [],
            true),
        new(
            "culture",
            "Was sollte ein Bewerber über eure Arbeitskultur wissen?",
            "text",
            [],
            false)
    ];

    public static IReadOnlyList<string> GetJobTypes() => JobTypes;

    public static IReadOnlyList<QuestionnaireQuestionDto> GetQuestions(string jobType, bool applicant)
    {
        EnsureJobType(jobType);

        var source = applicant ? ApplicantQuestions : CompanyQuestions;

        return source
            .Select(q => new QuestionnaireQuestionDto(q.Key, q.Text, q.Type, q.Options, q.Required))
            .ToList();
    }

    public static IReadOnlyList<QuestionDefinition> GetDefinitions(string jobType, bool applicant)
    {
        EnsureJobType(jobType);
        return applicant ? ApplicantQuestions : CompanyQuestions;
    }

    public static void EnsureJobType(string jobType)
    {
        if (!JobTypes.Contains(jobType, StringComparer.OrdinalIgnoreCase))
        {
            throw new KeyNotFoundException($"Die Jobkategorie '{jobType}' wird noch nicht unterstützt.");
        }
    }

    public sealed record QuestionDefinition(
        string Key,
        string Text,
        string Type,
        IReadOnlyList<string> Options,
        bool Required);
}
