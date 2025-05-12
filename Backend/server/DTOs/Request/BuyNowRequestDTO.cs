using System;
using System.Collections.Generic;

namespace Server.DTOs.Request
{
    public class BuyNowRequestDTO
    {
        public List<BuyNowItemDTO> Items { get; set; }
    }

    public class BuyNowItemDTO
    {
        public Guid BookId { get; set; }
        public int Quantity { get; set; }
    }
}