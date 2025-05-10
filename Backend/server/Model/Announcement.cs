using System;
using System.ComponentModel.DataAnnotations;

namespace Server.Model;

public class Announcement
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public string Message { get; set; }

    [Required]
    public DateTime StartDate { get; set; } = DateTime.UtcNow;

    [Required]
    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

}
