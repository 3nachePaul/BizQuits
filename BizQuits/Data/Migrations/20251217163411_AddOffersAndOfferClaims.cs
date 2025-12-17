using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizQuits.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOffersAndOfferClaims : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OfferClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OfferId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ClaimedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ClaimCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OfferClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OfferClaims_Offers_OfferId",
                        column: x => x.OfferId,
                        principalTable: "Offers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OfferClaims_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OfferClaims_ClaimCode",
                table: "OfferClaims",
                column: "ClaimCode");

            migrationBuilder.CreateIndex(
                name: "IX_OfferClaims_OfferId",
                table: "OfferClaims",
                column: "OfferId");

            migrationBuilder.CreateIndex(
                name: "IX_OfferClaims_UserId_OfferId",
                table: "OfferClaims",
                columns: new[] { "UserId", "OfferId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OfferClaims");
        }
    }
}
