using System;
using System.ComponentModel.DataAnnotations;

namespace Server.Model;

public class Book
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(255)]
    public string Title { get; set; }

    [Required]
    [MaxLength(255)]
    public string Author { get; set; }

    [Required]
    [MaxLength(50)]
    public string ISBN { get; set; }

    [Required]
    [MaxLength(100)]
    public string Genre { get; set; }

    public string Description { get; set; }

    [MaxLength(512)]
    public string? ImageUrl { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue)]
    public int InventoryCount { get; set; }

    public bool IsOnSale { get; set; }

    public DateTime? DiscountStart { get; set; }
    public DateTime? DiscountEnd { get; set; }

    [Range(0, 100)]
    public float? DiscountPercentage { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<Whitelist> Whitelists { get; set; } = new List<Whitelist>();

 public ICollection<Review> Reviews { get; set; } = new List<Review>(); // Added navigation property
}