using System;
using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Request;

public class BookRequestDTO
{
    [Required, MaxLength(255)]
    public string Title { get; set; }

    [Required, MaxLength(255)]
    public string Author { get; set; }

    [Required, MaxLength(13)]
    public string ISBN { get; set; }

    [Required, MaxLength(100)]
    public string Genre { get; set; }

    public string Description { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue)]
    public int InventoryCount { get; set; }

    // public bool IsOnSale { get; set; }

    public IFormFile? Image { get; set; }

}