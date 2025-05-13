using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Model;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [Route("api/notifications")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NotificationController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/notifications/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Notification>>> GetNotificationsByUserId(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest(new { message = "User ID cannot be empty." });
            }

            Console.WriteLine($"Fetching notifications for UserId: {userId}");

            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            Console.WriteLine($"Total notifications found: {notifications.Count}");

            return Ok(notifications);
        }

        // DELETE: api/notifications/user/{userId}
        [HttpDelete("user/{userId}")]
        public async Task<IActionResult> DeleteNotificationsByUserId(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest(new { message = "User ID cannot be empty." });
            }

            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .ToListAsync();

            if (!notifications.Any())
            {
                return NotFound(new { message = "No notifications found for the given user." });
            }

            _context.Notifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();

            return Ok(new { message = "All notifications cleared successfully." });
        }
    }
}
