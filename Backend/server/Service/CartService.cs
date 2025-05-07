// using System;
// using System.Linq;
// using System.Threading.Tasks;
// using Microsoft.EntityFrameworkCore;
// using Server.Data;
// using Server.DTOs.Request;
// using Server.DTOs.Response;
// using Server.Model;
// using Server.Service;
// using Microsoft.Extensions.Logging;

// namespace Server.Service
// {
//     public class CartService : ICartService
//     {
//         private readonly ApplicationDbContext _context;
//         private readonly ILogger<CartService> _logger;

//         public CartService(ApplicationDbContext context, ILogger<CartService> logger)
//         {
//             _context = context;
//             _logger = logger;
//         }

//         public async Task<CartResponseDTO> GetCartAsync(Guid userId)
//         {
//             _logger.LogInformation("Fetching cart for user {UserId}", userId);
//             var cart = await _context.Carts
//                 .Include(c => c.CartItems)
//                 .ThenInclude(ci => ci.Book)
//                 .FirstOrDefaultAsync(c => c.UserId == userId);

//             if (cart == null)
//             {
//                 _logger.LogInformation("No cart found for user {UserId}", userId);
//                 return new CartResponseDTO
//                 {
//                     CartId = Guid.Empty,
//                     UserId = userId,
//                     Items = new List<CartItemResponseDTO>(),
//                     TotalPrice = 0
//                 };
//             }

//             var items = cart.CartItems.Select(ci => new CartItemResponseDTO
//             {
//                 CartItemId = ci.Id,
//                 BookId = ci.BookId,
//                 Title = ci.Book.Title,
//                 Author = ci.Book.Author,
//                 ImageUrl = ci.Book.ImageUrl ?? string.Empty,
//                 Price = ci.Price,
//                 Quantity = ci.Quantity
//             }).ToList();

//             _logger.LogInformation("Cart retrieved for user {UserId} with {ItemCount} items", userId, items.Count);
//             return new CartResponseDTO
//             {
//                 CartId = cart.Id,
//                 UserId = cart.UserId,
//                 Items = items,
//                 TotalPrice = items.Sum(i => i.Price * i.Quantity)
//             };
//         }

//         public async Task<CartResponseDTO> AddCartItemAsync(Guid userId, AddToCartItemRequestDTO request)
//         {
//             const int maxRetries = 3;
//             int retryCount = 0;

//             while (retryCount < maxRetries)
//             {
//                 using var transaction = await _context.Database.BeginTransactionAsync();
//                 try
//                 {
//                     _logger.LogInformation("Attempting to add item {BookId} for user {UserId}, attempt {Attempt}", request.BookId, userId, retryCount + 1);

//                     // Load book to verify existence and inventory
//                     var book = await _context.Books.FindAsync(request.BookId);
//                     if (book == null)
//                     {
//                         _logger.LogWarning("Book {BookId} not found", request.BookId);
//                         throw new Exception("Book not found");
//                     }

//                     if (book.InventoryCount < request.Quantity)
//                     {
//                         _logger.LogWarning("Insufficient inventory for book {BookId}. Requested: {Requested}, Available: {Available}", request.BookId, request.Quantity, book.InventoryCount);
//                         throw new Exception("Insufficient inventory");
//                     }

//                     // Load cart with items
//                     var cart = await _context.Carts
//                         .Include(c => c.CartItems)
//                         .FirstOrDefaultAsync(c => c.UserId == userId);

//                     if (cart == null)
//                     {
//                         _logger.LogInformation("Creating new cart for user {UserId}", userId);
//                         cart = new Cart
//                         {
//                             Id = Guid.NewGuid(),
//                             UserId = userId,
//                             CreatedAt = DateTime.UtcNow,
//                             UpdatedAt = DateTime.UtcNow
//                         };
//                         _context.Carts.Add(cart);
//                         await _context.SaveChangesAsync(); // Save cart to initialize RowVersion
//                     }

//                     // Check for existing item
//                     var existingItem = cart.CartItems.FirstOrDefault(ci => ci.BookId == request.BookId);
//                     if (existingItem != null)
//                     {
//                         _logger.LogInformation("Updating existing item {BookId} in cart {CartId}. New quantity: {NewQuantity}", request.BookId, cart.Id, existingItem.Quantity + request.Quantity);
//                         existingItem.Quantity += request.Quantity;
//                         existingItem.Price = book.Price; // Update price in case it changed
//                         existingItem.AddedAt = DateTime.UtcNow;
//                     }
//                     else
//                     {
//                         _logger.LogInformation("Adding new item {BookId} to cart {CartId}", request.BookId, cart.Id);
//                         var cartItem = new CartItem
//                         {
//                             Id = Guid.NewGuid(),
//                             CartId = cart.Id,
//                             BookId = request.BookId,
//                             Quantity = request.Quantity,
//                             Price = book.Price,
//                             AddedAt = DateTime.UtcNow
//                         };
//                         _context.CartItems.Add(cartItem); // Explicitly add to context
//                         cart.CartItems.Add(cartItem);
//                     }

//                     cart.UpdatedAt = DateTime.UtcNow;

//                     _logger.LogInformation("Saving changes for cart {CartId} with {ItemCount} items", cart.Id, cart.CartItems.Count);
//                     await _context.SaveChangesAsync();
//                     await transaction.CommitAsync();

//                     _logger.LogInformation("Successfully added item {BookId} to cart {CartId} for user {UserId}", request.BookId, cart.Id, userId);
//                     return await GetCartAsync(userId);
//                 }
//                 catch (DbUpdateConcurrencyException ex)
//                 {
//                     retryCount++;
//                     _logger.LogWarning(ex, "Concurrency exception on attempt {Attempt} for user {UserId}, book {BookId}", retryCount, userId, request.BookId);
//                     if (retryCount >= maxRetries)
//                     {
//                         _logger.LogError("Failed to add item to cart after {MaxRetries} attempts due to concurrency issues", maxRetries);
//                         throw new Exception("Failed to add item to cart due to persistent concurrency issues.");
//                     }

//                     await transaction.RollbackAsync();
//                     _context.ChangeTracker.Clear();
//                     await Task.Delay(100 * retryCount); // Backoff delay
//                 }
//                 catch (Exception ex)
//                 {
//                     _logger.LogError(ex, "Error adding item {BookId} to cart for user {UserId}", request.BookId, userId);
//                     await transaction.RollbackAsync();
//                     throw;
//                 }
//             }

//             _logger.LogError("Failed to add item {BookId} to cart for user {UserId} after maximum retries", request.BookId, userId);
//             throw new Exception("Failed to add item to cart after maximum retries.");
//         }

//         public async Task<CartResponseDTO> UpdateCartItemAsync(Guid userId, Guid cartItemId, UpdateCartItemRequestDTO request)
//         {
//             _logger.LogInformation("Updating cart item {CartItemId} for user {UserId}", cartItemId, userId);
//             var cart = await _context.Carts
//                 .Include(c => c.CartItems)
//                 .ThenInclude(ci => ci.Book)
//                 .FirstOrDefaultAsync(c => c.UserId == userId);

//             if (cart == null)
//             {
//                 _logger.LogWarning("Cart not found for user {UserId}", userId);
//                 throw new Exception("Cart not found");
//             }

//             var cartItem = cart.CartItems.FirstOrDefault(ci => ci.Id == cartItemId);
//             if (cartItem == null)
//             {
//                 _logger.LogWarning("Cart item {CartItemId} not found in cart {CartId}", cartItemId, cart.Id);
//                 throw new Exception("Cart item not found");
//             }

//             if (cartItem.Book.InventoryCount < request.Quantity)
//             {
//                 _logger.LogWarning("Insufficient inventory for cart item {CartItemId}. Requested: {Requested}, Available: {Available}", cartItemId, request.Quantity, cartItem.Book.InventoryCount);
//                 throw new Exception("Insufficient inventory");
//             }

//             cartItem.Quantity = request.Quantity;
//             cartItem.AddedAt = DateTime.UtcNow;
//             cart.UpdatedAt = DateTime.UtcNow;

//             try
//             {
//                 _logger.LogInformation("Saving changes for cart {CartId}", cart.Id);
//                 await _context.SaveChangesAsync();
//             }
//             catch (DbUpdateConcurrencyException ex)
//             {
//                 _logger.LogWarning(ex, "Concurrency exception updating cart item {CartItemId}", cartItemId);
//                 _context.ChangeTracker.Clear();
//                 cart = await _context.Carts
//                     .Include(c => c.CartItems)
//                     .ThenInclude(ci => ci.Book)
//                     .FirstOrDefaultAsync(c => c.UserId == userId);

//                 if (cart == null)
//                 {
//                     _logger.LogError("Cart no longer exists for user {UserId}", userId);
//                     throw new Exception("Cart no longer exists");
//                 }

//                 cartItem = cart.CartItems.FirstOrDefault(ci => ci.Id == cartItemId);
//                 if (cartItem == null)
//                 {
//                     _logger.LogError("Cart item {CartItemId} no longer exists", cartItemId);
//                     throw new Exception("Cart item no longer exists");
//                 }

//                 cartItem.Quantity = request.Quantity;
//                 cartItem.AddedAt = DateTime.UtcNow;
//                 cart.UpdatedAt = DateTime.UtcNow;

//                 await _context.SaveChangesAsync();
//             }

//             _logger.LogInformation("Successfully updated cart item {CartItemId} for user {UserId}", cartItemId, userId);
//             return await GetCartAsync(userId);
//         }

//         public async Task<CartResponseDTO> DeleteCartItemAsync(Guid userId, Guid cartItemId)
//         {
//             _logger.LogInformation("Deleting cart item {CartItemId} for user {UserId}", cartItemId, userId);
//             var cart = await _context.Carts
//                 .Include(c => c.CartItems)
//                 .FirstOrDefaultAsync(c => c.UserId == userId);

//             if (cart == null)
//             {
//                 _logger.LogWarning("Cart not found for user {UserId}", userId);
//                 throw new Exception("Cart not found");
//             }

//             var cartItem = cart.CartItems.FirstOrDefault(ci => ci.Id == cartItemId);
//             if (cartItem == null)
//             {
//                 _logger.LogWarning("Cart item {CartItemId} not found in cart {CartId}", cartItemId, cart.Id);
//                 throw new Exception("Cart item not found");
//             }

//             cart.CartItems.Remove(cartItem);
//             cart.UpdatedAt = DateTime.UtcNow;

//             if (!cart.CartItems.Any())
//             {
//                 _logger.LogInformation("Cart {CartId} is empty, removing cart", cart.Id);
//                 _context.Carts.Remove(cart);
//             }

//             try
//             {
//                 _logger.LogInformation("Saving changes for cart {CartId}", cart.Id);
//                 await _context.SaveChangesAsync();
//             }
//             catch (DbUpdateConcurrencyException ex)
//             {
//                 _logger.LogWarning(ex, "Concurrency exception deleting cart item {CartItemId}", cartItemId);
//                 _context.ChangeTracker.Clear();
//                 cart = await _context.Carts
//                     .Include(c => c.CartItems)
//                     .FirstOrDefaultAsync(c => c.UserId == userId);

//                 if (cart == null)
//                 {
//                     _logger.LogInformation("Cart was deleted by another operation for user {UserId}", userId);
//                     return await GetCartAsync(userId); // Cart was deleted by another operation
//                 }

//                 cartItem = cart.CartItems.FirstOrDefault(ci => ci.Id == cartItemId);
//                 if (cartItem == null)
//                 {
//                     _logger.LogInformation("Cart item {CartItemId} was already deleted", cartItemId);
//                     return await GetCartAsync(userId); // Item was already deleted
//                 }

//                 cart.CartItems.Remove(cartItem);
//                 cart.UpdatedAt = DateTime.UtcNow;

//                 if (!cart.CartItems.Any())
//                 {
//                     _context.Carts.Remove(cart);
//                 }

//                 await _context.SaveChangesAsync();
//             }

//             _logger.LogInformation("Successfully deleted cart item {CartItemId} for user {UserId}", cartItemId, userId);
//             return await GetCartAsync(userId);
//         }
//     }
// }

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
                .AsNoTracking() // Disable tracking for read-only query
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

            var items = cart.CartItems.Select(ci => new CartItemResponseDTO
            {
                CartItemId = ci.Id,
                BookId = ci.BookId,
                Title = ci.Book.Title,
                Author = ci.Book.Author,
                ImageUrl = ci.Book.ImageUrl ?? string.Empty,
                Price = ci.Price,
                Quantity = ci.Quantity
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

                // Load book to verify existence and inventory
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

                // Load cart with items
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

                // Check for existing item
                var existingItem = cart.CartItems.FirstOrDefault(ci => ci.BookId == request.BookId);
                if (existingItem != null)
                {
                    _logger.LogInformation("Updating existing item {BookId} in cart {CartId}. New quantity: {NewQuantity}", request.BookId, cart.Id, existingItem.Quantity + request.Quantity);
                    existingItem.Quantity += request.Quantity;
                    existingItem.Price = book.Price; // Update price in case it changed
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
                        Price = book.Price,
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

            cartItem.Quantity = request.Quantity;
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
    }
}