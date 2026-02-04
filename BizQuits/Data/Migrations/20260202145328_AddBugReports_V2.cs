using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizQuits.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBugReports_V2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminNotes",
                table: "BugReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "BugReports",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "BugReports",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminNotes",
                table: "BugReports");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "BugReports");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "BugReports");
        }
    }
}
