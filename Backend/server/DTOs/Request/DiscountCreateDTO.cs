using System;
using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Request;

public class DiscountCreateDTO
{
    [Required]
    public Guid BookId { get; set; }

    [Required]
    [Range(0, 100)]
    public float DiscountPercentage { get; set; }

    [Required]
    public DateTime DiscountStart { get; set; }

    [Required]
    public DateTime DiscountEnd { get; set; }
}