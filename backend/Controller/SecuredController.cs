using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RefreshTokens.Api.Controllers;

[ApiController]
[Route("api/secured")]
[Authorize]
public class SecuredController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok($"Hello {User.Identity?.Name}, your access token is valid.");
}
