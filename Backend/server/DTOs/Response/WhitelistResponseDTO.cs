using System;

namespace Server.DTOs.Response;

public class WhitelistResponseDTO
{
    public Guid UserId { get; set; }
    public Guid BookId { get; set; }
    public string BookTitle { get; set; }
    public string BookAuthor { get; set; }
    public string? BookImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }

}
