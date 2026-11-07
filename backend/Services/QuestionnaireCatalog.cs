namespace RefreshTokens.Api.Services;

using RefreshTokens.Api.Models;

public static class QuestionnaireCatalog
{
    public const string JuniorDeveloper = "Junior Developer";

    private static readonly string[] JobTypes =
    [
        JuniorDeveloper
    ];

    // Kategorien in Anzeigereihenfolge (Fragebogen-Schritte und Antwortenübersicht)
    public static class Categories
    {
        public const string Tech = "Technik";
        public const string Collaboration = "Zusammenarbeit";
        public const string Learning = "Lernen und Entwicklung";
        public const string Conditions = "Rahmenbedingungen";
        public const string Values = "Werte";
        public const string Hiring = "Bewerbungsprozess";
        public const string Personal = "Persönlich";
    }

    // Gemeinsame Antwortoptionen – die Reihenfolge ist für das Matching relevant (Ordinalskalen)
    public static class Options
    {
        public static readonly string[] Technologies = ["C#", "Java", "Python", "JavaScript / TypeScript", "React", "Vue", "Angular", "Django", "ASP.NET Core", "PHP", "Symfony"];
        public static readonly string[] DevelopmentFocus = ["Frontend", "Backend", "Full Stack", "Webentwicklung", "APIs", "Datenbanken"];
        public static readonly string[] WorkModels = ["Remote", "Hybrid", "Vor Ort"];
        public static readonly string[] TeamStyles = ["Überwiegend selbstständig", "Überwiegend im Team", "Mischung aus beidem"];
        public static readonly string[] Priorities = ["Mentoring", "Weiterbildung", "Moderne Technologien", "Interessante Projekte", "Gutes Team", "Remote", "Flexible Arbeitszeiten", "Eigenverantwortung"];
        public static readonly string[] CareerDirections = ["Frontend", "Backend", "Full Stack", "Data Analysis", "2D Game Development", "AI"];

        public static readonly string[] Hours = ["Bis 20 Stunden", "20–30 Stunden", "30–35 Stunden", "35–40 Stunden"];
        public static readonly string[] StartDates = ["Sofort", "In 1–3 Monaten", "In 3–6 Monaten", "Später als 6 Monate"];
        public static readonly string[] OfficeDays = ["0", "1", "2", "3", "4", "5"];
        public static readonly string[] WorkLanguages = ["Deutsch", "Englisch", "Französisch", "Spanisch"];
        public static readonly string[] FeedbackFrequency = ["Täglich", "Wöchentlich", "Alle zwei Wochen", "Monatlich"];
        public static readonly string[] Methods = ["Scrum", "Kanban", "Code Reviews", "Continuous Integration", "Test-Driven Development"];
        public static readonly string[] YesNo = ["Ja", "Nein"];
        public static readonly string[] Meetings = ["Bis 1 Stunde", "1–2 Stunden", "Mehr als 2 Stunden"];
        public static readonly string[] TeamSizes = ["Bis 5 Personen", "6–10 Personen", "11–20 Personen", "Mehr als 20 Personen"];
        public static readonly string[] Hierarchy = ["Sehr flach", "Eher flach", "Eher hierarchisch", "Hierarchisch"];
        public static readonly string[] LearningStyles = ["Dokumentation lesen", "Videos und Kurse", "Pair Programming", "Ausprobieren", "Code Reviews"];
        public static readonly string[] Tools = ["Git", "Docker", "CI/CD", "Jira", "Cloud (AWS, Azure, GCP)", "Linux"];
        public static readonly string[] AiToolsApplicant = ["Ja, gern", "Egal", "Lieber nicht"];
        public static readonly string[] AiToolsCompany = ["Erwünscht", "Erlaubt", "Nicht erlaubt"];
        public static readonly string[] Overtime = ["Nie", "Selten", "Gelegentlich", "Häufig"];
        public static readonly string[] Industries = ["Software / IT", "Gesundheit", "Umwelt und Energie", "Finanzen", "Bildung", "Handel", "Öffentlicher Sektor", "Medien"];
        public static readonly string[] GermanLevels = ["A1", "A2", "B1", "B2", "C1", "C2 / Muttersprache"];
        public static readonly string[] InterviewFormats = ["Gespräch", "Probetag", "Coding-Aufgabe", "Technisches Interview"];
        public static readonly string[] ProcessDuration = ["Innerhalb einer Woche", "1–2 Wochen", "2–4 Wochen", "Länger als 4 Wochen"];
    }

    private static QuestionDefinition Q(string key, string text, string type, string[] options, bool required, string category,
        string? scaleMin = null, string? scaleMax = null) =>
        new(key, text, type, options, required, category, scaleMin, scaleMax);

    private static readonly IReadOnlyList<QuestionDefinition> ApplicantQuestions =
    [
        // Technik
        Q("technologies", "Mit welchen Technologien möchtest du gerne arbeiten?", "multi", Options.Technologies, true, Categories.Tech),
        Q("developmentFocus", "Welche Bereiche der Entwicklung interessieren dich besonders?", "multi", Options.DevelopmentFocus, true, Categories.Tech),
        Q("tools", "Mit welchen Werkzeugen hast du schon gearbeitet?", "multi", Options.Tools, false, Categories.Tech),
        Q("methods", "Welche Arbeitsweisen kennst du schon?", "multi", Options.Methods, false, Categories.Tech),
        Q("codeQuality", "Wie wichtig sind dir Tests und Code-Qualität?", "scale", [], false, Categories.Tech, "unwichtig", "sehr wichtig"),
        Q("featureVsMaintenance", "Woran arbeitest du lieber?", "scale", [], false, Categories.Tech, "neue Features", "Wartung und Refactoring"),
        Q("aiTools", "Möchtest du KI-Tools wie Copilot im Alltag nutzen?", "single", Options.AiToolsApplicant, false, Categories.Tech),

        // Zusammenarbeit
        Q("teamStyle", "Wie möchtest du am liebsten arbeiten?", "single", Options.TeamStyles, true, Categories.Collaboration),
        Q("autonomy", "Wie viel Verantwortung möchtest du als Junior übernehmen?", "scale", [], true, Categories.Collaboration, "wenig", "viel"),
        Q("workLanguages", "In welchen Sprachen möchtest du arbeiten?", "multi", Options.WorkLanguages, false, Categories.Collaboration),
        Q("feedbackFrequency", "Wie oft wünschst du dir Feedback?", "single", Options.FeedbackFrequency, false, Categories.Collaboration),
        Q("pairProgramming", "Wie gern arbeitest du im Pair Programming?", "scale", [], false, Categories.Collaboration, "gar nicht", "sehr gern"),
        Q("communicationStyle", "Wie kommunizierst du am liebsten?", "scale", [], false, Categories.Collaboration, "synchron (Calls)", "asynchron (Chat, Tickets)"),
        Q("meetings", "Wie viel Zeit in Meetings pro Tag ist für dich angenehm?", "single", Options.Meetings, false, Categories.Collaboration),
        Q("teamSize", "In welcher Teamgröße fühlst du dich wohl?", "single", Options.TeamSizes, false, Categories.Collaboration),

        // Lernen und Entwicklung
        Q("onboarding", "Wie wichtig ist dir eine strukturierte Einarbeitung?", "scale", [], true, Categories.Learning, "unwichtig", "sehr wichtig"),
        Q("buddy", "Wie wichtig ist dir ein fester Ansprechpartner (Buddy)?", "scale", [], false, Categories.Learning, "unwichtig", "sehr wichtig"),
        Q("learningStyle", "Wie lernst du am besten?", "multi", Options.LearningStyles, false, Categories.Learning),
        Q("learningBudget", "Wie wichtig ist dir ein Weiterbildungsbudget?", "scale", [], false, Categories.Learning, "unwichtig", "sehr wichtig"),
        Q("careerDirection", "In welche Richtung möchtest du dich langfristig entwickeln?", "multi", Options.CareerDirections, true, Categories.Learning),

        // Rahmenbedingungen
        Q("workModel", "In welchem Arbeitsmodell möchtest du arbeiten?", "single", Options.WorkModels, true, Categories.Conditions),
        Q("officeDays", "Wie viele Bürotage pro Woche passen für dich höchstens?", "single", Options.OfficeDays, false, Categories.Conditions),
        Q("hoursPerWeek", "Wie viele Stunden pro Woche möchtest du arbeiten?", "single", Options.Hours, false, Categories.Conditions),
        Q("startDate", "Ab wann kannst du starten?", "single", Options.StartDates, false, Categories.Conditions),
        Q("overtime", "Wie wichtig sind dir planbare Arbeitszeiten ohne Überstunden?", "scale", [], false, Categories.Conditions, "unwichtig", "sehr wichtig"),
        Q("germanLevel", "Welches Deutschniveau hast du?", "single", Options.GermanLevels, false, Categories.Conditions),

        // Werte
        Q("priorities", "Was ist dir bei deinem ersten Arbeitgeber besonders wichtig?", "multi", Options.Priorities, true, Categories.Values),
        Q("hierarchy", "Wie wichtig sind dir flache Hierarchien?", "scale", [], false, Categories.Values, "unwichtig", "sehr wichtig"),
        Q("industries", "Für welche Branchen interessierst du dich?", "multi", Options.Industries, false, Categories.Values),
        Q("socialImpact", "Wie wichtig ist dir, dass das Produkt einen gesellschaftlichen Nutzen hat?", "scale", [], false, Categories.Values, "unwichtig", "sehr wichtig"),

        // Bewerbungsprozess
        Q("interviewFormat", "Welche Form des Kennenlernens ist dir am liebsten?", "multi", Options.InterviewFormats, false, Categories.Hiring),
        Q("processDuration", "Wie schnell brauchst du eine Rückmeldung bis zur Zusage?", "single", Options.ProcessDuration, false, Categories.Hiring),

        // Persönlich (Freitext, fließt über gemeinsame Themen ein)
        Q("motivation", "Warum hast du dich für die Softwareentwicklung entschieden?", "text", [], true, Categories.Personal),
        Q("problemSolving", "Wie gehst du vor, wenn du bei einer technischen Aufgabe nicht weiterkommst?", "text", [], true, Categories.Personal),
        Q("expectations", "Was erwartest du von deinem ersten Arbeitgeber?", "text", [], true, Categories.Personal),
        Q("lastProject", "An welchem Projekt hast du zuletzt gearbeitet?", "text", [], false, Categories.Personal),
        Q("aboutYou", "Gibt es noch etwas, das du über deine Arbeitsweise oder Motivation sagen möchtest?", "text", [], false, Categories.Personal),
    ];

    private static readonly IReadOnlyList<QuestionDefinition> CompanyQuestions =
    [
        // Technik
        Q("technologies", "Welche Technologien werden in diesem Team tatsächlich eingesetzt?", "multi", Options.Technologies, true, Categories.Tech),
        Q("developmentFocus", "In welchen Bereichen arbeitet der Junior überwiegend?", "multi", Options.DevelopmentFocus, true, Categories.Tech),
        Q("tools", "Welche Werkzeuge nutzt das Team täglich?", "multi", Options.Tools, false, Categories.Tech),
        Q("methods", "Welche Arbeitsweisen nutzt ihr?", "multi", Options.Methods, false, Categories.Tech),
        Q("codeQuality", "Wie wichtig sind Tests und Code-Qualität im Team?", "scale", [], false, Categories.Tech, "unwichtig", "sehr wichtig"),
        Q("featureVsMaintenance", "Woran arbeitet ein Junior in dieser Stelle überwiegend?", "scale", [], false, Categories.Tech, "neue Features", "Wartung und Refactoring"),
        Q("aiTools", "Sind KI-Tools wie Copilot bei euch erlaubt?", "single", Options.AiToolsCompany, false, Categories.Tech),

        // Zusammenarbeit
        Q("teamStyle", "Wie arbeitet das Entwicklerteam typischerweise?", "single", Options.TeamStyles, true, Categories.Collaboration),
        Q("autonomy", "Wie viel Eigenverantwortung erhält ein Junior?", "scale", [], true, Categories.Collaboration, "wenig", "viel"),
        Q("workLanguages", "Welche Sprachen spricht das Team im Alltag?", "multi", Options.WorkLanguages, false, Categories.Collaboration),
        Q("feedbackFrequency", "Wie oft bekommt ein Junior Feedback?", "single", Options.FeedbackFrequency, false, Categories.Collaboration),
        Q("pairProgramming", "Wie oft wird bei euch im Pair Programming gearbeitet?", "scale", [], false, Categories.Collaboration, "nie", "täglich"),
        Q("communicationStyle", "Wie kommuniziert euer Team überwiegend?", "scale", [], false, Categories.Collaboration, "synchron (Calls)", "asynchron (Chat, Tickets)"),
        Q("meetings", "Wie viel Zeit verbringt ein Junior täglich in Meetings?", "single", Options.Meetings, false, Categories.Collaboration),
        Q("teamSize", "Wie groß ist das Team, in dem der Junior arbeitet?", "single", Options.TeamSizes, false, Categories.Collaboration),

        // Lernen und Entwicklung
        Q("onboarding", "Wie strukturiert ist die Einarbeitung für einen Junior?", "scale", [], true, Categories.Learning, "kaum", "sehr strukturiert"),
        Q("buddy", "Bekommt der Junior einen festen Ansprechpartner (Buddy)?", "single", Options.YesNo, false, Categories.Learning),
        Q("learningStyle", "Wie wird Wissen bei euch weitergegeben?", "multi", Options.LearningStyles, false, Categories.Learning),
        Q("learningBudget", "Bietet ihr ein Weiterbildungsbudget an?", "single", Options.YesNo, false, Categories.Learning),
        Q("careerSupport", "Welche Entwicklungsmöglichkeiten gibt es?", "multi", Options.CareerDirections, true, Categories.Learning),

        // Rahmenbedingungen
        Q("workModel", "Welche Arbeitsmodelle bietet ihr für diese Stelle an?", "multi", Options.WorkModels, true, Categories.Conditions),
        Q("officeDays", "Wie viele Bürotage pro Woche erwartet ihr?", "single", Options.OfficeDays, false, Categories.Conditions),
        Q("hoursPerWeek", "Wie viele Stunden pro Woche umfasst die Stelle?", "single", Options.Hours, false, Categories.Conditions),
        Q("startDate", "Ab wann soll die Stelle besetzt werden?", "single", Options.StartDates, false, Categories.Conditions),
        Q("overtime", "Wie häufig fallen Überstunden oder Bereitschaftsdienste an?", "single", Options.Overtime, false, Categories.Conditions),
        Q("germanLevel", "Welches Deutschniveau braucht die Stelle wirklich?", "single", Options.GermanLevels, false, Categories.Conditions),

        // Werte
        Q("offers", "Was bietet ihr einem Junior besonders?", "multi", Options.Priorities, true, Categories.Values),
        Q("hierarchy", "Wie sind die Entscheidungswege bei euch?", "single", Options.Hierarchy, false, Categories.Values),
        Q("industries", "In welcher Branche ist euer Produkt?", "single", Options.Industries, false, Categories.Values),
        Q("socialImpact", "Wie stark hat euer Produkt einen gesellschaftlichen Nutzen?", "scale", [], false, Categories.Values, "kaum", "sehr stark"),

        // Bewerbungsprozess
        Q("interviewFormat", "Wie läuft euer Auswahlprozess ab?", "multi", Options.InterviewFormats, false, Categories.Hiring),
        Q("processDuration", "Wie lange dauert euer Prozess bis zur Zusage?", "single", Options.ProcessDuration, false, Categories.Hiring),

        // Persönlich (Freitext, fließt über gemeinsame Themen ein)
        Q("juniorReason", "Warum sucht ihr einen Junior Developer für diese Stelle?", "text", [], true, Categories.Personal),
        Q("support", "Wie unterstützt ihr einen Junior, wenn er bei einer technischen Aufgabe nicht weiterkommt?", "text", [], true, Categories.Personal),
        Q("expectations", "Was erwartet ihr von einem Junior nach den ersten sechs Monaten?", "text", [], true, Categories.Personal),
        Q("firstWeeks", "Woran arbeitet ein Junior in den ersten Wochen?", "text", [], false, Categories.Personal),
        Q("culture", "Was sollte ein Bewerber über eure Arbeitskultur wissen?", "text", [], false, Categories.Personal),
    ];

    public static IReadOnlyList<string> GetJobTypes() => JobTypes;

    public static IReadOnlyList<QuestionnaireQuestionDto> GetQuestions(string jobType, bool applicant)
    {
        EnsureJobType(jobType);

        var source = applicant ? ApplicantQuestions : CompanyQuestions;

        return source
            .Select(q => new QuestionnaireQuestionDto(q.Key, q.Text, q.Type, q.Options, q.Required, q.Category, q.ScaleMin, q.ScaleMax))
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
        bool Required,
        string Category,
        string? ScaleMin = null,
        string? ScaleMax = null);
}
