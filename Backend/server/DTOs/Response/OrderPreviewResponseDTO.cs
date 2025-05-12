using System;

namespace Server.DTOs.Response
{
    public class OrderPreviewResponseDTO
    {
        public decimal OriginalTotal { get; set; }
        public decimal Discount { get; set; }
        public decimal FinalTotal { get; set; }
    }
}