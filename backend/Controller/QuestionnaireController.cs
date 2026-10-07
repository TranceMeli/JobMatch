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
[Route("api/questionnaires")]
[Authorize]
public class QuestionnaireController : ControllerBase
{
    private readonly AppDbContext _db;

    public QuestionnaireController(AppDbContext db)
    {
        _db = db;
    }

    private string UserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? throw new InvalidOperationException("Keine User-ID im Token gefunden.");

    private bool IsApplicant => User.IsInRole(Roles.User);

    [HttpGet("job-types")]
    public IActionResult GetJobTypes()
    {
        return Ok(QuestionnaireCatalog.GetJobTypes());
    }

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var responses = await _db.QuestionnaireResponses
            .Where(x => x.UserId == UserId)
            .OrderByDescending(x => x.UpdatedAt)
            .Select(x => new QuestionnaireResponseSummaryDto(x.JobType, x.UpdatedAt))
            .ToListAsync();

        return Ok(responses);
    }

    [HttpGet("{jobType}")]
    public IActionResult GetQuestions(string jobType)
    {
        try
        {
            QuestionnaireCatalog.EnsureJobType(jobType);
            return Ok(new
            {
                jobType = QuestionnaireCatalog.GetJobTypes()
                    .First(x => string.Equals(x, jobType, StringComparison.OrdinalIgnoreCase)),
                questions = QuestionnaireCatalog.GetQuestions(jobType, IsApplicant)
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet("{jobType}/answers")]
    public async Task<IActionResult> GetAnswers(string jobType)
    {
        try
        {
            QuestionnaireCatalog.EnsureJobType(jobType);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }

        var response = await _db.QuestionnaireResponses
            .FirstOrDefaultAsync(x => x.UserId == UserId && x.JobType == jobType);

        if (response is null)
            return Ok(new Dictionary<string, JsonElement>());

        return Content(response.AnswersJson, "application/json");
    }

    [HttpPost("{jobType}")]
    public async Task<IActionResult> Save(string jobType, [FromBody] JsonElement body)
    {
        try
        {
            QuestionnaireCatalog.EnsureJobType(jobType);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }

        if (body.ValueKind != JsonValueKind.Object ||
            !body.TryGetProperty("answers", out var answers) ||
            answers.ValueKind != JsonValueKind.Object)
        {
            return BadRequest(new { error = "answers muss ein JSON-Objekt sein." });
        }

        var definitions = QuestionnaireCatalog.GetDefinitions(jobType, IsApplicant);
        foreach (var question in definitions.Where(q => q.Required))
        {
            if (!answers.TryGetProperty(question.Key, out var answer) ||
                answer.ValueKind == JsonValueKind.Null ||
                (answer.ValueKind == JsonValueKind.String && string.IsNullOrWhiteSpace(answer.GetString())) ||
                (answer.ValueKind == JsonValueKind.Array && answer.GetArrayLength() == 0))
            {
                return BadRequest(new { error = $"Bitte beantworte die Frage '{question.Text}'." });
            }

            if (question.Type == "scale")
            {
                if (answer.ValueKind != JsonValueKind.Number ||
                    !answer.TryGetInt32(out var scale) ||
                    scale is < 1 or > 5)
                {
                    return BadRequest(new { error = $"Die Antwort auf '{question.Text}' muss zwischen 1 und 5 liegen." });
                }
            }

            if (question.Type == "single" &&
                (answer.ValueKind != JsonValueKind.String ||
                 !question.Options.Contains(answer.GetString()!, StringComparer.OrdinalIgnoreCase)))
            {
                return BadRequest(new { error = $"Ungültige Antwort auf '{question.Text}'." });
            }

            if (question.Type == "multi")
            {
                if (answer.ValueKind != JsonValueKind.Array)
                    return BadRequest(new { error = $"Ungültige Mehrfachauswahl bei '{question.Text}'." });

                foreach (var item in answer.EnumerateArray())
                {
                    if (item.ValueKind != JsonValueKind.String ||
                        !question.Options.Contains(item.GetString()!, StringComparer.OrdinalIgnoreCase))
                        return BadRequest(new { error = $"Ungültige Auswahl bei '{question.Text}'." });
                }
            }
        }

        var normalizedJobType = QuestionnaireCatalog.GetJobTypes()
            .First(x => string.Equals(x, jobType, StringComparison.OrdinalIgnoreCase));

        var response = await _db.QuestionnaireResponses
            .FirstOrDefaultAsync(x => x.UserId == UserId && x.JobType == normalizedJobType);

        if (response is null)
        {
            response = new QuestionnaireResponse
            {
                UserId = UserId,
                JobType = normalizedJobType
            };
            _db.QuestionnaireResponses.Add(response);
        }

        response.AnswersJson = answers.GetRawText();
        response.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new QuestionnaireResponseSummaryDto(response.JobType, response.UpdatedAt));
    }
}
