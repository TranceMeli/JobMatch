using System.Text.RegularExpressions;

namespace RefreshTokens.Api.Services;

/// <summary>
/// Erkennt Themen in Freitext-Antworten anhand von Stichwörtern.
/// Die Auswertung läuft vollständig lokal – es werden keine Texte an externe Dienste gesendet.
/// Grenze: Es wird keine Bedeutung verstanden, nur Stichwörter (inkl. Wortstämme) aus dieser Liste.
/// </summary>
public static class TextThemes
{
    private static readonly (string Label, Regex Pattern)[] Themes =
    [
        // Bezeichnungen sind so gewählt, dass sie in „Ihr legt beide Wert auf …“ passen
        Theme("Weiterentwicklung", @"lern|weiterentwick|weiterbild|wissen\s+vermitteln|neugier"),
        Theme("Mentoring", @"hilfe|mentor|unterstütz|erfahrene\w*\s+kolleg|zugehen|frage"),
        Theme("eigenständiges Problemlösen", @"\bzunächst\b|selbst\s+(zu\s+)?(verstehen|versuch|lös)|lösungsweg"),
        Theme("Feedback", @"feedback|code[\s-]?review|rückmeldung"),
        Theme("Eigeninitiative", @"eigeninitiative|eigenständig|selbstständig|verantwortung|einbring"),
        Theme("Teamarbeit", @"\bteam|gemeinsam|zusammenarbeit|austausch"),
        Theme("Fehlerkultur", @"fehler"),
        Theme("Einarbeitung", @"einarbeitung|onboarding"),
        Theme("Praxiserfahrung", @"projekt|praktisch|praxis|ausprobier"),
        Theme("neue Technologien", @"\bki\b|künstliche\s+intelligenz|\bai\b|neue\w*\s+technologie"),
        Theme("offene Kommunikation", @"offen\w*\s+(und|kommunikation|zusammenarbeit)|respektvoll|kommunikation|erwünscht"),
    ];

    private static (string, Regex) Theme(string label, string pattern) =>
        (label, new Regex(pattern, RegexOptions.IgnoreCase | RegexOptions.CultureInvariant | RegexOptions.Compiled));

    public static HashSet<string> Detect(IEnumerable<string> texts)
    {
        var text = string.Join("\n", texts);

        return Themes
            .Where(t => t.Pattern.IsMatch(text))
            .Select(t => t.Label)
            .ToHashSet();
    }
}
