using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations;

public partial class AddQuestionnairesAndInterests : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "QuestionnaireResponses",
            columns: table => new
            {
                Id = table.Column<int>(type: "INTEGER", nullable: false)
                    .Annotation("Sqlite:Autoincrement", true),
                UserId = table.Column<string>(type: "TEXT", nullable: false),
                JobType = table.Column<string>(type: "TEXT", nullable: false),
                AnswersJson = table.Column<string>(type: "TEXT", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_QuestionnaireResponses", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Interests",
            columns: table => new
            {
                Id = table.Column<int>(type: "INTEGER", nullable: false)
                    .Annotation("Sqlite:Autoincrement", true),
                FromUserId = table.Column<string>(type: "TEXT", nullable: false),
                ToUserId = table.Column<string>(type: "TEXT", nullable: false),
                JobType = table.Column<string>(type: "TEXT", nullable: false),
                IsPositive = table.Column<bool>(type: "INTEGER", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Interests", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_QuestionnaireResponses_UserId_JobType",
            table: "QuestionnaireResponses",
            columns: new[] { "UserId", "JobType" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Interests_FromUserId_ToUserId_JobType",
            table: "Interests",
            columns: new[] { "FromUserId", "ToUserId", "JobType" },
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Interests");
        migrationBuilder.DropTable(name: "QuestionnaireResponses");
    }
}
