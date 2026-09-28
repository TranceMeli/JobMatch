using System.Text.Json;

namespace RefreshTokens.Api.Data.SeedData;

public static class CompanyProfileSeed
{
    public const string ProfileName = "TechBau GmbH";

    public static string BuildDataJson()
    {
        var data = new Dictionary<string, object>
        {
            ["industry"] = "Software / IT",
            ["companySize"] = "11-50",
            ["locations"] = new[] { "Karlsruhe", "Remote" },
            ["requiredSkills"] = new[] { "React", "TypeScript", "Node.js" },
            ["requiredExperience"] = "Mid",
            ["salaryMin"] = "55000",
            ["salaryMax"] = "70000",
            ["remoteOptions"] = new[] { "Remote", "Hybrid" },
            ["benefits"] = new[] { "Homeoffice-Budget", "30 Tage Urlaub", "Weiterbildungsbudget" },
            ["jobtitle"] = "Frontend Developer (React)",
            ["bio"] = "Wir sind ein wachsendes Softwareunternehmen aus Karlsruhe und suchen Verstärkung für unser Produktteam.",
        };

        return JsonSerializer.Serialize(data);
    }
}