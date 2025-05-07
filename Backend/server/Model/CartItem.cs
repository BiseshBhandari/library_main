// using System;
// using System.ComponentModel.DataAnnotations;

// namespace Server.Model;

// public class CartItem
// {
//     [Key]
//     public Guid Id { get; set; }

//     public Guid CartId { get; set; }

//     public Cart Cart { get; set; }

//     public Guid BookId { get; set; }

//     public Book Book { get; set; }

//     [Range(1, int.MaxValue)]
//     public int Quantity { get; set; }

//     [Range(0, double.MaxValue)]
//     public decimal Price { get; set; }

//     public DateTime AddedAt { get; set; }

//     [Timestamp]
//     public byte[] RowVersion { get; set; }

// }
using System;
using System.ComponentModel.DataAnnotations;

namespace Server.Model;

public class CartItem
{
    [Key]
    public Guid Id { get; set; }

    public Guid CartId { get; set; }

    public Cart Cart { get; set; }

    public Guid BookId { get; set; }

    public Book Book { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    public DateTime AddedAt { get; set; }
}