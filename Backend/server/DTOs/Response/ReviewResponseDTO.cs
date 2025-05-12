using System;

namespace Server.DTOs.Response
{
    public class ReviewResponseDTO
    {
        public Guid ReviewId { get; set; }
        public Guid BookId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ReviewerName { get; set; } // Add reviewer name
    }
}