using System;
using System.ComponentModel.DataAnnotations;

namespace Server.Model;

public class Order
{
    [Key]
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public User User { get; set; }

    [Required]
    [MaxLength(6)]
    public string ClaimCode { get; set; }

    [Range(0, double.MaxValue)]
    public decimal TotalPrice { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

}
