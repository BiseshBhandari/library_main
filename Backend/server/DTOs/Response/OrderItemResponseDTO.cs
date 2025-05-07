using System;

namespace Server.DTOs.Response;

public class OrderItemResponseDTO
{

    public Guid OrderItemId { get; set; }
    public Guid BookId { get; set; }
    public string Title { get; set; }
    public string Author { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}
