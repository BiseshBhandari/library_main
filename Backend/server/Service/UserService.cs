using Server.Data;
using Server.Model;
using Server.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace Server.Service
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private const string CURRENT_USER = "LuciHav";

        public UserService(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<string> GetUserEmailAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            return user?.Email;
        }

        public async Task<(string email, string username)> GetCurrentUserInfoAsync()
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.FullName == CURRENT_USER);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            return (email: user.Email, username: user.FullName);
        }

        public async Task<IEnumerable<OrderResponseDTO>> GetUserOrdersAsync(Guid userId)
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
                .Where(o => o.UserId == userId)
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
    }
}