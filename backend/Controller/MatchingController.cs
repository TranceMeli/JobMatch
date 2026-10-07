using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RefreshTokens.Api.Data;
using RefreshTokens.Api.Entities;
using RefreshTokens.Api.Models;
using RefreshTokens.Api.Services;

namespace RefreshTokens.Api.Controllers;

[ApiController]
[Route("api/matching")]
[Authorize]
public class MatchingController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly MatchingService _matchingService;

    public MatchingController(
        AppDbContext db,
        UserManager<ApplicationUser> userManager,
        MatchingService matchingService)
    {
        _db = db;
        _userManager = userManager;
        _matchingService = matchingService;
    }

    private string UserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? throw new InvalidOperationException("Keine User-ID im Token gefunden.");

    private bool IsApplicant => User.IsInRole(Roles.User);

    [HttpGet("candidates")]
    public async Task<IActionResult> GetCandidates([FromQuery] string jobType)
    {
        try
        {
            QuestionnaireCatalog.EnsureJobType(jobType);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }

        var normalizedJobType = QuestionnaireCatalog.GetJobTypes()
            .First(x => string.Equals(x, jobType, StringComparison.OrdinalIgnoreCase));

        var ownResponse = await _db.QuestionnaireResponses
            .FirstOrDefaultAsync(x => x.UserId == UserId && x.JobType == normalizedJobType);

        if (ownResponse is null)
        {
            return BadRequest(new { error = "Bitte beantworte zuerst den Fragebogen für diese Jobkategorie." });
        }

        var currentUser = await _userManager.FindByIdAsync(UserId);
        if (currentUser is null)
            return Unauthorized();

        var targetResponses = await _db.QuestionnaireResponses
            .Where(x => x.JobType == normalizedJobType && x.UserId != UserId)
            .ToListAsync();

        var actedOn = await _db.Interests
            .Where(x => x.FromUserId == UserId && x.JobType == normalizedJobType)
            .Select(x => x.ToUserId)
            .ToHashSetAsync();

        var currentProfile = await _db.Profiles.FindAsync(UserId);
        if (currentProfile is null)
            return BadRequest(new { error = "Bitte erstelle zuerst dein Profil." });

        var result = new List<MatchCandidateDto>();

        foreach (var response in targetResponses.Where(x => !actedOn.Contains(x.UserId)))
        {
            var targetUser = await _userManager.FindByIdAsync(response.UserId);
            if (targetUser is null)
                continue;

            var targetRoles = await _userManager.GetRolesAsync(targetUser);
            var targetIsApplicant = targetRoles.Contains(Roles.User);

            if (targetIsApplicant == IsApplicant)
                continue;

            var targetProfile = await _db.Profiles.FindAsync(response.UserId);
            if (targetProfile is null)
                continue;

            var applicantProfile = IsApplicant ? currentProfile : targetProfile;
            var companyProfile = IsApplicant ? targetProfile : currentProfile;
            var applicantResponse = IsApplicant ? ownResponse : response;
            var companyResponse = IsApplicant ? response : ownResponse;

            var score = _matchingService.Calculate(
                applicantProfile,
                applicantResponse,
                companyProfile,
                companyResponse);

            result.Add(BuildCandidate(targetUser, targetProfile, normalizedJobType, targetIsApplicant, score));
        }

        return Ok(result
            .OrderByDescending(x => x.MatchScore)
            .ToList());
    }

    [HttpPost("interest")]
    public async Task<IActionResult> SetInterest([FromBody] SaveInterestRequest request)
    {
        if (request.TargetUserId == UserId)
            return BadRequest(new { error = "Du kannst kein Interesse an deinem eigenen Profil speichern." });

        try
        {
            QuestionnaireCatalog.EnsureJobType(request.JobType);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }

        var normalizedJobType = QuestionnaireCatalog.GetJobTypes()
            .First(x => string.Equals(x, request.JobType, StringComparison.OrdinalIgnoreCase));

        var ownResponse = await _db.QuestionnaireResponses
            .FirstOrDefaultAsync(x => x.UserId == UserId && x.JobType == normalizedJobType);
        var targetResponse = await _db.QuestionnaireResponses
            .FirstOrDefaultAsync(x => x.UserId == request.TargetUserId && x.JobType == normalizedJobType);

        if (ownResponse is null || targetResponse is null)
        {
            return BadRequest(new { error = "Für beide Seiten muss zuerst der passende Fragebogen beantwortet werden." });
        }

        var targetUser = await _userManager.FindByIdAsync(request.TargetUserId);
        var currentUser = await _userManager.FindByIdAsync(UserId);

        if (targetUser is null || currentUser is null)
            return NotFound(new { error = "Profil nicht gefunden." });

        var ownRoles = await _userManager.GetRolesAsync(currentUser);
        var targetRoles = await _userManager.GetRolesAsync(targetUser);

        if (ownRoles.Contains(Roles.User) == targetRoles.Contains(Roles.User))
            return BadRequest(new { error = "Nur Bewerber und Unternehmen können miteinander gematcht werden." });

        var interest = await _db.Interests
            .FirstOrDefaultAsync(x =>
                x.FromUserId == UserId &&
                x.ToUserId == request.TargetUserId &&
                x.JobType == normalizedJobType);

        if (interest is null)
        {
            interest = new Interest
            {
                FromUserId = UserId,
                ToUserId = request.TargetUserId,
                JobType = normalizedJobType,
                IsPositive = request.Positive,
                CreatedAt = DateTime.UtcNow
            };
            _db.Interests.Add(interest);
        }
        else
        {
            interest.IsPositive = request.Positive;
            interest.CreatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        var matched = request.Positive && await _db.Interests.AnyAsync(x =>
            x.FromUserId == request.TargetUserId &&
            x.ToUserId == UserId &&
            x.JobType == normalizedJobType &&
            x.IsPositive);

        MatchResult? score = null;

        if (matched)
        {
            var currentProfile = await _db.Profiles.FindAsync(UserId);
            var targetProfile = await _db.Profiles.FindAsync(request.TargetUserId);

            if (currentProfile is not null && targetProfile is not null)
            {
                score = IsApplicant
                    ? _matchingService.Calculate(currentProfile, ownResponse, targetProfile, targetResponse)
                    : _matchingService.Calculate(targetProfile, targetResponse, currentProfile, ownResponse);
            }
        }

        return Ok(new
        {
            matched,
            jobType = normalizedJobType,
            matchScore = score?.Score,
            matchReasons = score?.Reasons ?? Array.Empty<string>()
        });
    }

    [HttpGet("matches")]
    public async Task<IActionResult> GetMatches()
    {
        var positiveOutgoing = await _db.Interests
            .Where(x => x.FromUserId == UserId && x.IsPositive)
            .ToListAsync();

        var result = new List<MatchDto>();

        foreach (var interest in positiveOutgoing)
        {
            var reciprocal = await _db.Interests.AnyAsync(x =>
                x.FromUserId == interest.ToUserId &&
                x.ToUserId == UserId &&
                x.JobType == interest.JobType &&
                x.IsPositive);

            if (!reciprocal)
                continue;

            var targetUser = await _userManager.FindByIdAsync(interest.ToUserId);
            var targetProfile = await _db.Profiles.FindAsync(interest.ToUserId);
            var ownProfile = await _db.Profiles.FindAsync(UserId);
            var targetResponse = await _db.QuestionnaireResponses
                .FirstOrDefaultAsync(x => x.UserId == interest.ToUserId && x.JobType == interest.JobType);
            var ownResponse = await _db.QuestionnaireResponses
                .FirstOrDefaultAsync(x => x.UserId == UserId && x.JobType == interest.JobType);

            if (targetUser is null || targetProfile is null || ownProfile is null ||
                targetResponse is null || ownResponse is null)
                continue;

            var targetRoles = await _userManager.GetRolesAsync(targetUser);
            var targetIsApplicant = targetRoles.Contains(Roles.User);

            var score = IsApplicant
                ? _matchingService.Calculate(ownProfile, ownResponse, targetProfile, targetResponse)
                : _matchingService.Calculate(targetProfile, targetResponse, ownProfile, ownResponse);

            var profileData = ParseProfile(targetProfile.Data);
            var title = targetIsApplicant
                ? GetString(profileData, "desiredPosition")
                : GetString(profileData, "jobtitle");

            var location = targetIsApplicant
                ? GetString(profileData, "location")
                : GetFirstString(profileData, "locations");

            var linkedIn = targetIsApplicant
                ? GetString(profileData, "linkedinUrl")
                : null;

            result.Add(new MatchDto(
                targetUser.Id,
                targetProfile.Name,
                string.IsNullOrWhiteSpace(title) ? interest.JobType : title,
                location,
                interest.JobType,
                score.Score,
                score.Reasons,
                targetUser.Email,
                linkedIn));
        }

        return Ok(result
            .OrderByDescending(x => x.MatchScore)
            .ToList());
    }

    private static MatchCandidateDto BuildCandidate(
        ApplicationUser user,
        Profile profile,
        string jobType,
        bool isApplicant,
        MatchResult score)
    {
        var data = ParseProfile(profile.Data);
        var title = isApplicant
            ? GetString(data, "desiredPosition")
            : GetString(data, "jobtitle");

        var location = isApplicant
            ? GetString(data, "location")
            : GetFirstString(data, "locations");

        var tags = isApplicant
            ? GetStrings(data, "skills")
            : GetStrings(data, "requiredSkills");

        return new MatchCandidateDto(
            user.Id,
            profile.Name,
            string.IsNullOrWhiteSpace(title) ? jobType : title,
            location,
            tags,
            GetString(data, "bio"),
            jobType,
            score.Score,
            score.Reasons);
    }

    private static Dictionary<string, JsonElement> ParseProfile(string json)
    {
        return JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json)
            ?? new Dictionary<string, JsonElement>();
    }

    private static string GetString(Dictionary<string, JsonElement> data, string key)
    {
        return data.TryGetValue(key, out var element) && element.ValueKind == JsonValueKind.String
            ? element.GetString()?.Trim() ?? string.Empty
            : string.Empty;
    }

    private static string GetFirstString(Dictionary<string, JsonElement> data, string key)
    {
        var values = GetStrings(data, key);
        return values.FirstOrDefault() ?? string.Empty;
    }

    private static List<string> GetStrings(Dictionary<string, JsonElement> data, string key)
    {
        if (!data.TryGetValue(key, out var element) || element.ValueKind != JsonValueKind.Array)
            return [];

        return element.EnumerateArray()
            .Where(x => x.ValueKind == JsonValueKind.String)
            .Select(x => x.GetString()!.Trim())
            .Where(x => x.Length > 0)
            .ToList();
    }
}
