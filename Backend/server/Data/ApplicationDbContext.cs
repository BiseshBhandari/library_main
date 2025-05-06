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

    public DbSet<Order> Orders { get; set; } = null!;
    public DbSet<OrderItem> OrderItems { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Defining relationships
        modelBuilder.Entity<Order>()
            .HasMany(o => o.OrderItems)
            .WithOne(oi => oi.Order)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Book>()
            .HasMany(b => b.OrderItems)
            .WithOne(oi => oi.Book)
            .HasForeignKey(oi => oi.BookId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent deletion if book is referenced
    }
}
