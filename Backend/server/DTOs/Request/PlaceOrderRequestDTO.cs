using System;
using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Request;

public class PlaceOrderRequestDTO
{
    [Required]
    public List<OrderItemDTO> Items { get; set; }
}

public class OrderItemDTO
{
    [Required]
    public Guid BookId { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0")]
    public int Quantity { get; set; }

    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "Price must be greater than or equal to 0")]
    public decimal Price { get; set; }
}
