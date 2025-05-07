using System;

namespace Server.Model;

public class Whitelist
{
    public Guid UserId { get; set; }
    public Guid BookId { get; set; }
    public DateTime CreatedAt { get; set; }
    public User User { get; set; }
    public Book Book { get; set; }
}
