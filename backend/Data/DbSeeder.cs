using Microsoft.AspNetCore.Identity;
using RefreshTokens.Api.Data.SeedData;
using RefreshTokens.Api.Entities;

namespace RefreshTokens.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        foreach (var role in new[] { Roles.Admin, Roles.User })
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        const string adminEmail = "admin@jobmatch.com";
        var admin = await userManager.FindByEmailAsync(adminEmail);
        if (admin is null)
        {
            admin = new ApplicationUser
            {
                FirstName = "Default",
                LastName = "Admin",
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };

            await userManager.CreateAsync(admin, "Admin123!");
            await userManager.AddToRoleAsync(admin, Roles.Admin);
        }

        const string userEmail = "user@jobmatch.com";
        var user = await userManager.FindByEmailAsync(userEmail);
        if (user is null)
        {
            user = new ApplicationUser
            {
                FirstName = "Default",
                LastName = "User",
                UserName = userEmail,
                Email = userEmail,
                EmailConfirmed = true
            };
            await userManager.CreateAsync(user, "User123!");
            await userManager.AddToRoleAsync(user, Roles.User);
        }

        await SeedProfileAsync(db, admin.Id, CompanyProfileSeed.ProfileName, CompanyProfileSeed.BuildDataJson());
        await SeedProfileAsync(db, user.Id, ApplicantProfileSeed.ProfileName, ApplicantProfileSeed.BuildDataJson());
    }

    private static async Task SeedProfileAsync(AppDbContext db, string userId, string name, string dataJson)
    {
        if (await db.Profiles.FindAsync(userId) is not null) return;

        db.Profiles.Add(new Entities.Profile
        {
            UserId = userId,
            Name = name,
            Data = dataJson,
            UpdatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();
    }
}