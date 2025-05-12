using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs.Request;
using Server.DTOs.Response;
using Server.Model;

namespace Server.Service;

public class OrderService : IOrderService
{
    private readonly ApplicationDbContext _context;

    public OrderService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<OrderResponseDTO>> GetUserOrdersAsync(Guid userId)
    {
        // Find user first to ensure they exist
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            throw new Exception("User not found");

        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Book)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(order => new OrderResponseDTO
        {
            OrderId = order.Id,
            UserId = order.UserId,
            ClaimCode = order.ClaimCode,
            TotalPrice = order.TotalPrice,
            Status = order.Status,
            CreatedAt = order.CreatedAt,
            Items = order.OrderItems.Select(oi => new OrderItemResponseDTO
            {
                OrderItemId = oi.Id,
                BookId = oi.BookId,
                Title = oi.Book.Title,
                Author = oi.Book.Author,
                Price = oi.Price,
                Quantity = oi.Quantity
            }).ToList()
        }).ToList();
    }

    public async Task<OrderResponseDTO> PlaceOrderAsync(Guid userId, PlaceOrderRequestDTO request)
    {
        var user = await _context.Users
            .Include(u => u.Orders)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            throw new Exception("User not found");

        if (request.Items == null || !request.Items.Any())
            throw new Exception("Order must contain at least one item");

        foreach (var item in request.Items)
        {
            var book = await _context.Books.FindAsync(item.BookId);
            if (book == null)
                throw new Exception($"Book with ID {item.BookId} not found");
            if (book.InventoryCount < item.Quantity)
                throw new Exception($"Insufficient inventory for book: {book.Title}");
        }

        // Calculate total price
        var totalPrice = request.Items.Sum(i => i.Price * i.Quantity);

        // Apply 5% discount if the user is buying 5 or more books
        var totalBooks = request.Items.Sum(i => i.Quantity);
        if (totalBooks >= 5)
        {
            totalPrice *= 0.95m; // Apply 5% discount
        }

        // Check if the user has 10 or more successful orders
        var successfulOrdersCount = user.Orders.Count(o => o.Status == "Complete");
        if (successfulOrdersCount >= 10)
        {
            totalPrice *= 0.90m; // Apply an additional 10% discount
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ClaimCode = GenerateClaimCode(),
            TotalPrice = totalPrice,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            OrderItems = request.Items.Select(item => new OrderItem
            {
                Id = Guid.NewGuid(),
                BookId = item.BookId,
                Quantity = item.Quantity,
                Price = item.Price
            }).ToList()
        };

        // Update inventory
        foreach (var item in request.Items)
        {
            var book = await _context.Books.FindAsync(item.BookId);
            book.InventoryCount -= item.Quantity;
        }

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return await GetOrderAsync(userId, order.Id);
    }

    public async Task<OrderResponseDTO> CancelOrderAsync(Guid userId, Guid orderId)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Book)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

        if (order == null)
            throw new Exception("Order not found");

        if (order.Status != "Pending")
            throw new Exception("Only pending orders can be cancelled");

        // Restore inventory
        foreach (var item in order.OrderItems)
        {
            item.Book.InventoryCount += item.Quantity;
        }

        order.Status = "Cancelled";
        await _context.SaveChangesAsync();

        return new OrderResponseDTO
        {
            OrderId = order.Id,
            UserId = order.UserId,
            ClaimCode = order.ClaimCode,
            TotalPrice = order.TotalPrice,
            Status = order.Status,
            CreatedAt = order.CreatedAt,
            Items = order.OrderItems.Select(oi => new OrderItemResponseDTO
            {
                OrderItemId = oi.Id,
                BookId = oi.BookId,
                Title = oi.Book.Title,
                Author = oi.Book.Author,
                Price = oi.Price,
                Quantity = oi.Quantity
            }).ToList()
        };
    }

    public async Task<OrderResponseDTO> GetOrderAsync(Guid userId, Guid orderId)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Book)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

        if (order == null)
            throw new Exception("Order not found");

        return new OrderResponseDTO
        {
            OrderId = order.Id,
            UserId = order.UserId,
            ClaimCode = order.ClaimCode,
            TotalPrice = order.TotalPrice,
            Status = order.Status,
            CreatedAt = order.CreatedAt,
            Items = order.OrderItems.Select(oi => new OrderItemResponseDTO
            {
                OrderItemId = oi.Id,
                BookId = oi.BookId,
                Title = oi.Book.Title,
                Author = oi.Book.Author,
                Price = oi.Price,
                Quantity = oi.Quantity
            }).ToList()
        };
    }

    private string GenerateClaimCode()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 6)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }
}