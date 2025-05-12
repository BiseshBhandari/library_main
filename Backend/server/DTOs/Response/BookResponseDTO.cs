using System;
using System.Collections.Generic;

namespace Server.DTOs.Response
{
    public class BookResponseDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string ISBN { get; set; }
        public string Genre { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public decimal Price { get; set; }
        public decimal EffectivePrice { get; set; }
        public int InventoryCount { get; set; }
        public bool IsOnSale { get; set; }
        public float? DiscountPercentage { get; set; }
        public DateTime? DiscountStart { get; set; }
        public DateTime? DiscountEnd { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int Rating { get; set; }
        public List<ReviewResponseDTO> Reviews { get; set; }
    }
}