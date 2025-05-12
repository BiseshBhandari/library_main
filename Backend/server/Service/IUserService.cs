using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Server.DTOs.Response;

namespace Server.Service
{
    public interface IUserService
    {
        Task<string> GetUserEmailAsync(Guid userId);
        Task<(string email, string username)> GetCurrentUserInfoAsync();
        Task<IEnumerable<OrderResponseDTO>> GetUserOrdersAsync(Guid userId);
    }
}