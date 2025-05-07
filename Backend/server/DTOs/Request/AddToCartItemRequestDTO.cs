using System;
using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Request;

public class AddToCartItemRequestDTO
{
    [Required]
    public Guid BookId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}