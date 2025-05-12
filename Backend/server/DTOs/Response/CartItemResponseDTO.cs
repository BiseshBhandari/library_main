using System;

namespace Server.DTOs.Response;

public class CartItemResponseDTO
{
        public Guid CartItemId { get; set; }
        public Guid BookId { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string ImageUrl { get; set; }
        public decimal OriginalPrice { get; set; } // Add original price
        public decimal Price { get; set; } // Effective price (after discount if applicable)
        public bool IsDiscountActive { get; set; } // Add flag to indicate if discount is active
        public int Quantity { get; set; }
}