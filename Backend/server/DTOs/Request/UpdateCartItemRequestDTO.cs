using System;
using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Request;

public class UpdateCartItemRequestDTO
{
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}