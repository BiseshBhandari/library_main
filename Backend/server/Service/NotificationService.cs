using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Server.Data;
using Server.Model;

namespace Server.Service
{
    public class NotificationService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(ApplicationDbContext dbContext, ILogger<NotificationService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task SaveNotificationAsync(string userId, string message)
        {
            try
            {
                var notification = new Notification
                {
                    UserId = userId,
                    Message = message,
                    CreatedAt = DateTime.UtcNow
                };

                _dbContext.Notifications.Add(notification);
                await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save notification for UserId {UserId}", userId);
                throw;
            }
        }
    }
}
