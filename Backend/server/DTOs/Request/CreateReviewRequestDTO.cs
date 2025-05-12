using System;
using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Request
{
    public class CreateReviewRequestDTO
    {
        [Required]
        public Guid BookId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        public string Comment { get; set; }
    }
}