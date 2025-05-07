using System;

namespace Server.Model;

public class User
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "Member";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    
    public ICollection<Whitelist> Whitelists { get; set; } = new List<Whitelist>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();

}
