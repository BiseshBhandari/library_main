
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs.Request;
using Server.DTOs.Response;
using Server.Model;
using Microsoft.Extensions.Logging;

namespace Server.Service
{
    public class CartService : ICartService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CartService> _logger;

        public CartService(ApplicationDbContext context, ILogger<CartService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<CartResponseDTO> GetCartAsync(Guid userId)
        {
            _logger.LogInformation("Fetching cart for user {UserId}", userId);
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Book)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                _logger.LogInformation("No cart found for user {UserId}", userId);
                return new CartResponseDTO
                {
                    CartId = Guid.Empty,
                    UserId = userId,
                    Items = new List<CartItemResponseDTO>(),
                    TotalPrice = 0
                };
            }

            var now = DateTime.UtcNow;
            var items = cart.CartItems.Select(ci =>
            {
                // Recalculate effective price based on current discount status
                bool isDiscountActive = ci.Book.IsOnSale &&
                                        ci.Book.DiscountStart.HasValue &&
                                        ci.Book.DiscountEnd.HasValue &&
                                        ci.Book.DiscountStart.Value <= now &&
                                        ci.Book.DiscountEnd.Value >= now;

                decimal effectivePrice = isDiscountActive && ci.Book.DiscountPercentage.HasValue
                    ? Math.Round(ci.Book.Price * (1 - (decimal)ci.Book.DiscountPercentage.Value / 100), 2)
                    : ci.Book.Price;

                return new CartItemResponseDTO
                {
                    CartItemId = ci.Id,
                    BookId = ci.BookId,
                    Title = ci.Book.Title,
                    Author = ci.Book.Author,
                    ImageUrl = ci.Book.ImageUrl ?? string.Empty,
                    OriginalPrice = ci.Book.Price, // Store original price
                    Price = effectivePrice, // Use recalculated effective price
                    IsDiscountActive = isDiscountActive, // Indicate if discount is active
                    Quantity = ci.Quantity
                };
            }).ToList();

            _logger.LogInformation("Cart retrieved for user {UserId} with {ItemCount} items", userId, items.Count);
            return new CartResponseDTO
            {
                CartId = cart.Id,
                UserId = cart.UserId,
                Items = items,
                TotalPrice = items.Sum(i => i.Price * i.Quantity)
            };
        }

        public async Task<CartResponseDTO> AddCartItemAsync(Guid userId, AddToCartItemRequestDTO request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _logger.LogInformation("Attempting to add item {BookId} for user {UserId}", request.BookId, userId);

                var book = await _context.Books.FindAsync(request.BookId);
                if (book == null)
                {
                    _logger.LogWarning("Book {BookId} not found", request.BookId);
                    throw new Exception("Book not found");
                }

                if (book.InventoryCount < request.Quantity)
                {
                    _logger.LogWarning("Insufficient inventory for book {BookId}. Requested: {Requested}, Available: {Available}", request.BookId, request.Quantity, book.InventoryCount);
                    throw new Exception("Insufficient inventory");
                }

                // Calculate effective price at the time of adding to cart
                var now = DateTime.UtcNow;
                bool isDiscountActive = book.IsOnSale &&
                                        book.DiscountStart.HasValue &&
                                        book.DiscountEnd.HasValue &&
                                        book.DiscountStart.Value <= now &&
                                        book.DiscountEnd.Value >= now;

                decimal effectivePrice = isDiscountActive && book.DiscountPercentage.HasValue
                    ? Math.Round(book.Price * (1 - (decimal)book.DiscountPercentage.Value / 100), 2)
                    : book.Price;

                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart == null)
                {
                    _logger.LogInformation("Creating new cart for user {UserId}", userId);
                    cart = new Cart
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Carts.Add(cart);
                    await _context.SaveChangesAsync();
                }

                var existingItem = cart.CartItems.FirstOrDefault(ci => ci.BookId == request.BookId);
                if (existingItem != null)
                {
                    _logger.LogInformation("Updating existing item {BookId} in cart {CartId}. New quantity: {NewQuantity}", request.BookId, cart.Id, existingItem.Quantity + request.Quantity);
                    existingItem.Quantity += request.Quantity;
                    existingItem.Price = effectivePrice; // Update to current effective price
                    existingItem.AddedAt = DateTime.UtcNow;
                }
                else
                {
                    _logger.LogInformation("Adding new item {BookId} to cart {CartId}", request.BookId, cart.Id);
                    var cartItem = new CartItem
                    {
                        Id = Guid.NewGuid(),
                        CartId = cart.Id,
                        BookId = request.BookId,
                        Quantity = request.Quantity,
                        Price = effectivePrice, // Store the effective price at the time of adding
                        AddedAt = DateTime.UtcNow
                    };
                    _context.CartItems.Add(cartItem);
                    cart.CartItems.Add(cartItem);
                }

                cart.UpdatedAt = DateTime.UtcNow;

                _logger.LogInformation("Saving changes for cart {CartId} with {ItemCount} items", cart.Id, cart.CartItems.Count);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Successfully added item {BookId} to cart {CartId} for user {UserId}", request.BookId, cart.Id, userId);
                return await GetCartAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding item {BookId} to cart for user {UserId}", request.BookId, userId);
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<CartResponseDTO> UpdateCartItemAsync(Guid userId, Guid cartItemId, UpdateCartItemRequestDTO request)
        {
            _logger.LogInformation("Updating cart item {CartItemId} for user {UserId}", cartItemId, userId);
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Book)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                _logger.LogWarning("Cart not found for user {UserId}", userId);
                throw new Exception("Cart not found");
            }

            var cartItem = cart.CartItems.FirstOrDefault(ci => ci.Id == cartItemId);
            if (cartItem == null)
            {
                _logger.LogWarning("Cart item {CartItemId} not found in cart {CartId}", cartItemId, cart.Id);
                throw new Exception("Cart item not found");
            }

            if (cartItem.Book.InventoryCount < request.Quantity)
            {
                _logger.LogWarning("Insufficient inventory for cart item {CartItemId}. Requested: {Requested}, Available: {Available}", cartItemId, request.Quantity, cartItem.Book.InventoryCount);
                throw new Exception("Insufficient inventory");
            }

            // Recalculate effective price based on current discount status
            var now = DateTime.UtcNow;
            bool isDiscountActive = cartItem.Book.IsOnSale &&
                                    cartItem.Book.DiscountStart.HasValue &&
                                    cartItem.Book.DiscountEnd.HasValue &&
                                    cartItem.Book.DiscountStart.Value <= now &&
                                    cartItem.Book.DiscountEnd.Value >= now;

            decimal effectivePrice = isDiscountActive && cartItem.Book.DiscountPercentage.HasValue
                ? Math.Round(cartItem.Book.Price * (1 - (decimal)cartItem.Book.DiscountPercentage.Value / 100), 2)
                : cartItem.Book.Price;

            cartItem.Quantity = request.Quantity;
            cartItem.Price = effectivePrice; // Update price based on current discount status
            cartItem.AddedAt = DateTime.UtcNow;
            cart.UpdatedAt = DateTime.UtcNow;

            _logger.LogInformation("Saving changes for cart {CartId}", cart.Id);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully updated cart item {CartItemId} for user {UserId}", cartItemId, userId);
            return await GetCartAsync(userId);
        }

        public async Task<CartResponseDTO> DeleteCartItemAsync(Guid userId, Guid cartItemId)
        {
            _logger.LogInformation("Deleting cart item {CartItemId} for user {UserId}", cartItemId, userId);
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                _logger.LogWarning("Cart not found for user {UserId}", userId);
                throw new Exception("Cart not found");
            }

            var cartItem = cart.CartItems.FirstOrDefault(ci => ci.Id == cartItemId);
            if (cartItem == null)
            {
                _logger.LogWarning("Cart item {CartItemId} not found in cart {CartId}", cartItemId, cart.Id);
                throw new Exception("Cart item not found");
            }

            cart.CartItems.Remove(cartItem);
            cart.UpdatedAt = DateTime.UtcNow;

            if (!cart.CartItems.Any())
            {
                _logger.LogInformation("Cart {CartId} is empty, removing cart", cart.Id);
                _context.Carts.Remove(cart);
            }

            _logger.LogInformation("Saving changes for cart {CartId}", cart.Id);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully deleted cart item {CartItemId} for user {UserId}", cartItemId, userId);
            return await GetCartAsync(userId);
        }

        public async Task<CartResponseDTO> ClearCartAsync(Guid userId)
        {
            _logger.LogInformation("Clearing cart for user {UserId}", userId);
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                _logger.LogInformation("No cart found for user {UserId}, returning empty cart", userId);
                return new CartResponseDTO
                {
                    CartId = Guid.Empty,
                    UserId = userId,
                    Items = new List<CartItemResponseDTO>(),
                    TotalPrice = 0
                };
            }

            _context.CartItems.RemoveRange(cart.CartItems);
            _context.Carts.Remove(cart);
            cart.UpdatedAt = DateTime.UtcNow;

            _logger.LogInformation("Saving changes for cart {CartId}", cart.Id);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully cleared cart for user {UserId}", userId);
            return new CartResponseDTO
            {
                CartId = Guid.Empty,
                UserId = userId,
                Items = new List<CartItemResponseDTO>(),
                TotalPrice = 0
            };
        }
    }
}
