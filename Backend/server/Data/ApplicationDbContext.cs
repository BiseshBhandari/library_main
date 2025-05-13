// using System;
// using Microsoft.EntityFrameworkCore;
// using Server.Model;

// namespace Server.Data
// {
//     public class ApplicationDbContext : DbContext
//     {
//         public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
//         {
//         }

//         public DbSet<User> Users { get; set; }
//         public DbSet<Book> Books { get; set; } = null!;
//         public DbSet<Whitelist> Whitelists { get; set; }
//         public DbSet<Cart> Carts { get; set; }
//         public DbSet<CartItem> CartItems { get; set; }
//         public DbSet<Order> Orders { get; set; }
//         public DbSet<OrderItem> OrderItems { get; set; }
//         public DbSet<Review> Reviews { get; set; }
//         public DbSet<Announcement> Announcements { get; set; } = null!;

//         protected override void OnModelCreating(ModelBuilder modelBuilder)
//         {
//             base.OnModelCreating(modelBuilder);

//             // Configure Book
//             modelBuilder.Entity<Book>(entity =>
//             {
//                 entity.HasKey(b => b.Id);
//                 entity.Property(b => b.Title).IsRequired().HasMaxLength(255);
//                 entity.Property(b => b.Author).IsRequired().HasMaxLength(255);
//                 entity.Property(b => b.ISBN).IsRequired().HasMaxLength(50);
//                 entity.Property(b => b.Genre).IsRequired().HasMaxLength(100);
//                 entity.Property(b => b.Description);
//                 entity.Property(b => b.ImageUrl).HasMaxLength(512);
//                 entity.Property(b => b.Price).IsRequired();
//                 entity.Property(b => b.InventoryCount).IsRequired();
//                 entity.Property(b => b.IsOnSale).IsRequired();
//                 entity.Property(b => b.DiscountPercentage).HasColumnType("float");
//                 entity.Property(b => b.CreatedAt).IsRequired();
//                 entity.Property(b => b.UpdatedAt).IsRequired();
//             });

//             // Configure Review
//             modelBuilder.Entity<Review>(entity =>
//             {
//                 entity.HasKey(r => r.Id);
//                 entity.Property(r => r.BookId).IsRequired();
//                 entity.Property(r => r.UserId).IsRequired();
//                 entity.Property(r => r.Rating).IsRequired();
//                 entity.Property(r => r.Comment);
//                 entity.Property(r => r.CreatedAt).IsRequired();

//                 // Relationship to Book
//                 entity.HasOne(r => r.Book)
//                       .WithMany(b => b.Reviews)
//                       .HasForeignKey(r => r.BookId)
//                       .OnDelete(DeleteBehavior.Cascade);

//                 // Relationship to User
//                 entity.HasOne(r => r.User) // Navigation property
//                       .WithMany(u => u.Reviews) // Assuming User has a collection of Reviews
//                       .HasForeignKey(r => r.UserId) // Foreign key
//                       .OnDelete(DeleteBehavior.Cascade); // Optional: Define delete behavior
//             });

//             // Configure composite primary key for Whitelist
//             modelBuilder.Entity<Whitelist>()
//                 .HasKey(w => new { w.UserId, w.BookId });

//             // Configure relationships for Whitelist
//             modelBuilder.Entity<Whitelist>()
//                 .HasOne(w => w.User)
//                 .WithMany(u => u.Whitelists)
//                 .HasForeignKey(w => w.UserId);

//             modelBuilder.Entity<Whitelist>()
//                 .HasOne(w => w.Book)
//                 .WithMany(b => b.Whitelists)
//                 .HasForeignKey(w => w.BookId);

//             // Configure relationships for Cart
//             modelBuilder.Entity<Cart>()
//                 .HasOne(c => c.User)
//                 .WithMany()
//                 .HasForeignKey(c => c.UserId);

//             // Configure relationships for CartItem
//             modelBuilder.Entity<CartItem>()
//                 .HasOne(ci => ci.Cart)
//                 .WithMany(c => c.CartItems)
//                 .HasForeignKey(ci => ci.CartId);

//             modelBuilder.Entity<CartItem>()
//                 .HasOne(ci => ci.Book)
//                 .WithMany()
//                 .HasForeignKey(ci => ci.BookId);

//             // Configure relationships for Order
//             modelBuilder.Entity<Order>()
//                 .HasOne(o => o.User)
//                 .WithMany(u => u.Orders)
//                 .HasForeignKey(o => o.UserId);

//             // Configure relationships for OrderItem
//             modelBuilder.Entity<OrderItem>()
//                 .HasOne(oi => oi.Order)
//                 .WithMany(o => o.OrderItems)
//                 .HasForeignKey(oi => oi.OrderId);

//             modelBuilder.Entity<OrderItem>()
//                 .HasOne(oi => oi.Book)
//                 .WithMany()
//                 .HasForeignKey(oi => oi.BookId);
//         }
//     }
// }

using System;
using Microsoft.EntityFrameworkCore;
using Server.Model;

namespace Server.Data
{
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
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Announcement> Announcements { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Book
            modelBuilder.Entity<Book>(entity =>
            {
                entity.HasKey(b => b.Id);
                entity.Property(b => b.Title).IsRequired().HasMaxLength(255);
                entity.Property(b => b.Author).IsRequired().HasMaxLength(255);
                entity.Property(b => b.ISBN).IsRequired().HasMaxLength(50);
                entity.Property(b => b.Genre).IsRequired().HasMaxLength(100);
                entity.Property(b => b.Description);
                entity.Property(b => b.ImageUrl).HasMaxLength(512);
                entity.Property(b => b.Price).IsRequired();
                entity.Property(b => b.InventoryCount).IsRequired();
                entity.Property(b => b.IsOnSale).IsRequired();
                entity.Property(b => b.DiscountPercentage).HasColumnType("float");
                entity.Property(b => b.CreatedAt).IsRequired();
                entity.Property(b => b.UpdatedAt).IsRequired();
            });

            // Configure Review
            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(r => r.Id);
                entity.Property(r => r.BookId).IsRequired();
                entity.Property(r => r.UserId).IsRequired();
                entity.Property(r => r.Rating).IsRequired();
                entity.Property(r => r.Comment);
                entity.Property(r => r.CreatedAt).IsRequired();

                // Relationship to Book
                entity.HasOne(r => r.Book)
                      .WithMany(b => b.Reviews)
                      .HasForeignKey(r => r.BookId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Relationship to User
                entity.HasOne(r => r.User) // Navigation property
                      .WithMany(u => u.Reviews) // Assuming User has a collection of Reviews
                      .HasForeignKey(r => r.UserId) // Foreign key
                      .OnDelete(DeleteBehavior.Cascade); // Optional: Define delete behavior
            });

            // Configure Notification
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(n => n.Id);
                entity.Property(n => n.UserId).IsRequired();
                entity.Property(n => n.Message).IsRequired();
                entity.Property(n => n.CreatedAt).IsRequired();
            });

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

            // Configure relationships for Order
            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId);

            // Configure relationships for OrderItem
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
}