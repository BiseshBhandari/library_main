using System;

namespace Server.DTOs.Response;

public class OrderItemResponseDTO
{

    public Guid Id { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public BookResponseDTO Book { get; set; }

}
