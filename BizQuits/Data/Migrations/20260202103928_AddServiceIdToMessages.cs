using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizQuits.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceIdToMessages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ServiceId",
                table: "Messages",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ServiceId",
                table: "Messages",
                column: "ServiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Services_ServiceId",
                table: "Messages",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Services_ServiceId",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Messages_ServiceId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "ServiceId",
                table: "Messages");
        }
    }
}
