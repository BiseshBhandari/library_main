// using System;
// using Microsoft.EntityFrameworkCore;
// using Server.Model;

// namespace Server.Data;

// public class ApplicationDbContext : DbContext
// {

//     public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
//     {

//     }
//     public DbSet<User> Users { get; set; }
//     public DbSet<Book> Books { get; set; } = null!;

//     public DbSet<Whitelist> Whitelists { get; set; }
//     public DbSet<Cart> Carts { get; set; }
//     public DbSet<CartItem> CartItems { get; set; }
//     public DbSet<Order> Orders { get; set; }
//     public DbSet<OrderItem> OrderItems { get; set; }

//     protected override void OnModelCreating(ModelBuilder modelBuilder)
//     {
//         base.OnModelCreating(modelBuilder);

//         // Configure composite primary key for Whitelist
//         modelBuilder.Entity<Whitelist>()
//             .HasKey(w => new { w.UserId, w.BookId });

//         // Configure relationships for Whitelist
//         modelBuilder.Entity<Whitelist>()
//             .HasOne(w => w.User)
//             .WithMany(u => u.Whitelists)
//             .HasForeignKey(w => w.UserId);

//         modelBuilder.Entity<Whitelist>()
//             .HasOne(w => w.Book)
//             .WithMany(b => b.Whitelists)
//             .HasForeignKey(w => w.BookId);

//         // Configure relationships for Cart
//         modelBuilder.Entity<Cart>()
//             .HasOne(c => c.User)
//             .WithMany()
//             .HasForeignKey(c => c.UserId);

//         // Configure relationships for CartItem
//         modelBuilder.Entity<CartItem>()
//             .HasOne(ci => ci.Cart)
//             .WithMany(c => c.CartItems)
//             .HasForeignKey(ci => ci.CartId);

//         modelBuilder.Entity<CartItem>()
//             .HasOne(ci => ci.Book)
//             .WithMany()
//             .HasForeignKey(ci => ci.BookId);

//         modelBuilder.Entity<Order>()
//     .HasOne(o => o.User)
//     .WithMany(u => u.Orders)
//     .HasForeignKey(o => o.UserId);

//         modelBuilder.Entity<OrderItem>()
//             .HasOne(oi => oi.Order)
//             .WithMany(o => o.OrderItems)
//             .HasForeignKey(oi => oi.OrderId);

//         modelBuilder.Entity<OrderItem>()
//             .HasOne(oi => oi.Book)
//             .WithMany()
//             .HasForeignKey(oi => oi.BookId);
//     }
// }

using System;
using Microsoft.EntityFrameworkCore;
using Server.Model;

namespace Server.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Book> Books { get; set; } = null!;
    public DbSet<Whitelist> Whitelists { get; set; }
    public DbSet<Cart> Carts { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure composite primary key for Whitelist
        modelBuilder.Entity<Whitelist>()
            .HasKey(w => new { w.UserId, w.BookId });

        // Configure relationships for Whitelist
        modelBuilder.Entity<Whitelist>()
            .HasOne(w => w.User)
            .WithMany(u => u.Whitelists)
            .HasForeignKey(w => w.UserId);

        modelBuilder.Entity<Whitelist>()
            .HasOne(w => w.Book)
            .WithMany(b => b.Whitelists)
            .HasForeignKey(w => w.BookId);

        // Configure relationships for Cart
        modelBuilder.Entity<Cart>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId);

        // Configure relationships for CartItem
        modelBuilder.Entity<CartItem>()
            .HasOne(ci => ci.Cart)
            .WithMany(c => c.CartItems)
            .HasForeignKey(ci => ci.CartId);

        modelBuilder.Entity<CartItem>()
            .HasOne(ci => ci.Book)
            .WithMany()
            .HasForeignKey(ci => ci.BookId);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Order)
            .WithMany(o => o.OrderItems)
            .HasForeignKey(oi => oi.OrderId);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Book)
            .WithMany()
            .HasForeignKey(oi => oi.BookId);
    }
}