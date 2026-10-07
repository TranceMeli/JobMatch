using System.Text.Json;

namespace RefreshTokens.Api.Data.SeedData;

public static class ApplicantProfileSeed
{
    public const string ProfileName = "Default User";

    public static string BuildDataJson()
    {
        var data = new Dictionary<string, object>
        {
            ["desiredPosition"] = "Junior Frontend Developer",
            ["experienceLevel"] = "Junior",
            ["education"] = "Fachinformatikerin für Anwendungsentwicklung (FIAE)",
            ["skills"] = new[] { "React", "JavaScript", "CSS" },
            ["location"] = "Karlsruhe",
            ["salaryExpectation"] = "50000",
            ["remotePreference"] = "Hybrid",
            ["availability"] = "1 Monat",
            ["languages"] = new[] { "Deutsch", "Englisch" },
            ["githubUrl"] = "https://github.com/example",
            ["linkedinUrl"] = "https://linkedin.com/in/example",
            ["portfolioUrl"] = "",
            ["resumeUrl"] = "",
            ["bio"] = "Motivierte Frontend-Entwicklerin mit Fokus auf React und moderne UI-Entwicklung.",
        };

        return JsonSerializer.Serialize(data);
    }
}