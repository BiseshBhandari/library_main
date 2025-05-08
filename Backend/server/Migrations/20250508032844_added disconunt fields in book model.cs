using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class addeddisconuntfieldsinbookmodel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DiscountEnd",
                table: "Books",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<float>(
                name: "DiscountPercentage",
                table: "Books",
                type: "real",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DiscountStart",
                table: "Books",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DiscountEnd",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "DiscountPercentage",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "DiscountStart",
                table: "Books");
        }
    }
}
