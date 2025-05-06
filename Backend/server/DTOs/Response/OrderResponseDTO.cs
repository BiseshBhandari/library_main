using System;

namespace Server.DTOs.Response;

public class OrderResponseDTO
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Status { get; set; }
    public decimal Total { get; set; }
    public decimal Discount { get; set; }
    public string ClaimCode { get; set; }

    public DateTime CreatedAt { get; set; }
    public List<OrderItemResponseDTO> Items { get; set; }

}
