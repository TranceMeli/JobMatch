using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using RefreshTokens.Api.Auth;
using RefreshTokens.Api.Data;
using RefreshTokens.Api.Entities;
using RefreshTokens.Api.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()
    ?? throw new InvalidOperationException("Der 'JwtSettings'-Abschnitt fehlt in appsettings.json.");

// Der Schlüssel gehört nicht ins Repository: lokal über User Secrets, sonst über die Umgebungsvariable JwtSettings__Key.
if (Encoding.UTF8.GetByteCount(jwtSettings.Key) < 32)
    throw new InvalidOperationException(
        "JwtSettings:Key fehlt oder ist kürzer als 32 Byte. Lokal setzen mit: " +
        "dotnet user-secrets set \"JwtSettings:Key\" \"<langer zufälliger Wert>\"");

var frontendUrls = builder.Configuration.GetSection("Frontend:Urls").Get<string[]>() is { Length: > 0 } urls
    ? urls
    : [builder.Configuration["Frontend:Url"] ?? "http://localhost:5173"];

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=jobmatch.db"));

builder.Services.AddIdentityCore<ApplicationUser>(options =>
{
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
})
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddSingleton<MatchingService>();


builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(frontendUrls)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "JobMatch API", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Access-Token. Beispiel: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    await db.Database.MigrateAsync();

    // Demo-Konten mit bekannten Passwörtern nur lokal anlegen
    if (app.Environment.IsDevelopment())
        await DbSeeder.SeedAsync(app.Services);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();