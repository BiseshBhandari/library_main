using System;
using System.ComponentModel.DataAnnotations;

namespace Server.Model;

public class OrderItem
{
    [Key]
    public Guid Id { get; set; }

    public Guid OrderId { get; set; }

    public Order Order { get; set; }

    public Guid BookId { get; set; }

    public Book Book { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }
}
