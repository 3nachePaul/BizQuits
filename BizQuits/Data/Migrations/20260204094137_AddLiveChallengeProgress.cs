using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizQuits.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLiveChallengeProgress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CoinsReward",
                table: "Challenges",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ProofInstructions",
                table: "Challenges",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TrackingMode",
                table: "Challenges",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CoinsAwarded",
                table: "ChallengeParticipations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ProofImageUrl",
                table: "ChallengeParticipations",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProofSubmittedAt",
                table: "ChallengeParticipations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProofText",
                table: "ChallengeParticipations",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TargetProgress",
                table: "ChallengeParticipations",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoinsReward",
                table: "Challenges");

            migrationBuilder.DropColumn(
                name: "ProofInstructions",
                table: "Challenges");

            migrationBuilder.DropColumn(
                name: "TrackingMode",
                table: "Challenges");

            migrationBuilder.DropColumn(
                name: "CoinsAwarded",
                table: "ChallengeParticipations");

            migrationBuilder.DropColumn(
                name: "ProofImageUrl",
                table: "ChallengeParticipations");

            migrationBuilder.DropColumn(
                name: "ProofSubmittedAt",
                table: "ChallengeParticipations");

            migrationBuilder.DropColumn(
                name: "ProofText",
                table: "ChallengeParticipations");

            migrationBuilder.DropColumn(
                name: "TargetProgress",
                table: "ChallengeParticipations");
        }
    }
}
