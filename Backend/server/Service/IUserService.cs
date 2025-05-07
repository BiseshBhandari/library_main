using System;
using System.Threading.Tasks;

namespace Server.Service
{
    public interface IUserService
    {
        Task<string> GetUserEmailAsync(Guid userId);
        Task<(string email, string username)> GetCurrentUserInfoAsync();  // Note the tuple element names
    }
}