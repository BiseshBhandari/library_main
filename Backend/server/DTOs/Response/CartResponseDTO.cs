// using System;

// namespace Server.DTOs.Response;

// public class CartResponseDTO
// {
//     public Guid CartId { get; set; }
//     public Guid UserId { get; set; }
//     public List<CartItemResponseDTO> Items { get; set; }
//     public decimal TotalPrice { get; set; }
// }

using System;

namespace Server.DTOs.Response;

public class CartResponseDTO
{
    public Guid CartId { get; set; }
    public Guid UserId { get; set; }
    public List<CartItemResponseDTO> Items { get; set; }
    public decimal TotalPrice { get; set; }
}