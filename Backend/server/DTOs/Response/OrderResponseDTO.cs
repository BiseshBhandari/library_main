using System;

namespace Server.DTOs.Response;

public class OrderResponseDTO
{
    public Guid OrderId { get; set; }
    public Guid UserId { get; set; }
    public string ClaimCode { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<OrderItemResponseDTO> Items { get; set; }

}
