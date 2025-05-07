using Server.Data;
using Server.Model;
using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace Server.Service
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private const string CURRENT_USER = "LuciHav"; // Using the provided current user

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

        public async Task<(string email, string username)> GetCurrentUserInfoAsync()  // Matching tuple element names
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.FullName == CURRENT_USER);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            return (email: user.Email, username: user.FullName); // Explicitly naming tuple elements
        }
    }
}