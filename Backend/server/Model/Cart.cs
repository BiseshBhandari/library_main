// using System;
// using System.ComponentModel.DataAnnotations;

// namespace Server.Model;

// public class Cart
// {
//     [Key]
//     public Guid Id { get; set; }

//     public Guid UserId { get; set; }

//     public User User { get; set; }

//     public DateTime CreatedAt { get; set; }

//     public DateTime UpdatedAt { get; set; }

//     public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

//     [Timestamp]
//     public byte[] RowVersion { get; set; }

// }

using System;
using System.ComponentModel.DataAnnotations;

namespace Server.Model;

public class Cart
{
    [Key]
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public User User { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}