using System;

namespace Server.Models
{
    public class ReviewRating
    {
        public Guid BookId { get; set; }
        public int LatestRating { get; set; }
    }
}