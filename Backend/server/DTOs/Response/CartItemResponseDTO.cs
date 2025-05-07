// using System;

// namespace Server.DTOs.Response;

// public class CartItemResponseDTO
// {

//         public Guid CartItemId { get; set; }
//         public Guid BookId { get; set; }
//         public string Title { get; set; }
//         public string Author { get; set; }
//         public string ImageUrl { get; set; }
//         public decimal Price { get; set; }
//         public int Quantity { get; set; }

// }

using System;

namespace Server.DTOs.Response;

public class CartItemResponseDTO
{
        public Guid CartItemId { get; set; }
        public Guid BookId { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string ImageUrl { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
}