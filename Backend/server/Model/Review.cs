using System;
using System.ComponentModel.DataAnnotations;

namespace Server.Model
{
    public class Review
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid BookId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        public string Comment { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        public Book Book { get; set; }

        // Add navigation property for User
        public User User { get; set; }
    }
}