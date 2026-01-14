using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizQuits.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddChallengesAndParticipations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Challenges",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    TargetCount = table.Column<int>(type: "int", nullable: true),
                    TimeLimitDays = table.Column<int>(type: "int", nullable: true),
                    XpReward = table.Column<int>(type: "int", nullable: false),
                    BadgeCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RewardDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    BonusValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MaxParticipants = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EntrepreneurProfileId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Challenges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Challenges_EntrepreneurProfiles_EntrepreneurProfileId",
                        column: x => x.EntrepreneurProfileId,
                        principalTable: "EntrepreneurProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChallengeParticipations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChallengeId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CurrentProgress = table.Column<int>(type: "int", nullable: false),
                    UserMessage = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    EntrepreneurResponse = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AcceptedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Deadline = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RewardAwarded = table.Column<bool>(type: "bit", nullable: false),
                    XpAwarded = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChallengeParticipations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChallengeParticipations_Challenges_ChallengeId",
                        column: x => x.ChallengeId,
                        principalTable: "Challenges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChallengeParticipations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChallengeParticipations_ChallengeId",
                table: "ChallengeParticipations",
                column: "ChallengeId");

            migrationBuilder.CreateIndex(
                name: "IX_ChallengeParticipations_Status",
                table: "ChallengeParticipations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ChallengeParticipations_UserId_ChallengeId",
                table: "ChallengeParticipations",
                columns: new[] { "UserId", "ChallengeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Challenges_EntrepreneurProfileId",
                table: "Challenges",
                column: "EntrepreneurProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Challenges_Status",
                table: "Challenges",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Challenges_Type",
                table: "Challenges",
                column: "Type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChallengeParticipations");

            migrationBuilder.DropTable(
                name: "Challenges");
        }
    }
}
