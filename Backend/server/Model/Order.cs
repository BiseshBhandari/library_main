using System;

namespace Server.Model;

public class Order
{
    public Guid Id { get; set; }       // Primary Key for Order
    public Guid UserId { get; set; }   // Foreign Key referencing User's Id (Guid)
    public string Status { get; set; }
    public decimal Total { get; set; }
    public decimal Discount { get; set; }
    public string ClaimCode { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation: One Order has many OrderItems
    public List<OrderItem> OrderItems { get; set; } = new();

}
