using System;
using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Request;

public class WhitelistRequestDTO
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid BookId { get; set; }

}
