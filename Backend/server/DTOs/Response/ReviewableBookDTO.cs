using System;

namespace Server.DTOs.Response
{
    public class ReviewableBookDTO
    {
        public Guid BookId { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string ImageUrl { get; set; }
        public decimal Price { get; set; } // Original price
        public decimal EffectivePrice { get; set; } // Price with discount applied if active
        public bool IsOnSale { get; set; }
        public DateTime? DiscountStart { get; set; }
        public DateTime? DiscountEnd { get; set; }
        public int Rating { get; set; } /// Stores the latest rating
    }
}