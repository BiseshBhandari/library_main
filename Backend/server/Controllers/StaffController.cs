// using Microsoft.AspNetCore.Http;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;
// using Server.Data;
// using Server.DTOs.Response;
// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Threading.Tasks;

// namespace Server.Controllers
// {
//     [Route("api/staff")]
//     [ApiController]
//     public class StaffController : ControllerBase
//     {
//         private readonly ApplicationDbContext _context;

//         public StaffController(ApplicationDbContext context)
//         {
//             _context = context;
//         }

//         // GET: api/staff/getAllOrders
//         [HttpGet("getAllOrders")]
//         public async Task<ActionResult<IEnumerable<OrderResponseDTO>>> GetAllOrders()
//         {
//             try
//             {
//                 var orders = await _context.Orders
//                     .Include(o => o.OrderItems)
//                     .ThenInclude(oi => oi.Book)
//                     .OrderByDescending(o => o.CreatedAt)
//                     .ToListAsync();

//                 var response = orders.Select(order => new OrderResponseDTO
//                 {
//                     OrderId = order.Id,
//                     UserId = order.UserId,
//                     Status = order.Status,
//                     TotalPrice = order.TotalPrice,
//                     ClaimCode = order.ClaimCode,
//                     CreatedAt = order.CreatedAt,
//                     Items = order.OrderItems.Select(oi => new OrderItemResponseDTO
//                     {
//                         OrderItemId = oi.Id,
//                         BookId = oi.BookId,
//                         Quantity = oi.Quantity,
//                         Title = oi.Book.Title,
//                         Author = oi.Book.Author,
//                         Price = oi.Book.Price,
//                     }).ToList()
//                 }).ToList();

//                 return Ok(response);
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(StatusCodes.Status500InternalServerError,
//                     new { message = "An error occurred while retrieving orders", error = ex.Message });
//             }
//         }

//         // GET: api/staff/getOrderByClaimCode/{claimCode}
//         [HttpGet("getOrderByClaimCode/{claimCode}")]
//         public async Task<ActionResult<OrderResponseDTO>> GetOrderDetailsByClaimCode(string claimCode)
//         {
//             if (string.IsNullOrWhiteSpace(claimCode))
//             {
//                 return BadRequest(new { message = "Claim code cannot be empty." });
//             }

//             try
//             {
//                 var order = await _context.Orders
//                     .Include(o => o.OrderItems)
//                     .ThenInclude(oi => oi.Book)
//                     .FirstOrDefaultAsync(o => o.ClaimCode == claimCode);

//                 if (order == null)
//                 {
//                     return NotFound(new { message = "Order not found for the given claim code." });
//                 }

//                 var response = new OrderResponseDTO
//                 {
//                     OrderId = order.Id,
//                     UserId = order.UserId,
//                     Status = order.Status,
//                     TotalPrice = order.TotalPrice,
//                     ClaimCode = order.ClaimCode,
//                     CreatedAt = order.CreatedAt,
//                     Items = order.OrderItems.Select(oi => new OrderItemResponseDTO
//                     {
//                         OrderItemId = oi.Id,
//                         BookId = oi.BookId,
//                         Quantity = oi.Quantity,
//                         Title = oi.Book.Title,
//                         Author = oi.Book.Author,
//                         Price = oi.Book.Price,
//                     }).ToList()
//                 };

//                 return Ok(response);
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(StatusCodes.Status500InternalServerError,
//                     new { message = "An error occurred while retrieving the order", error = ex.Message });
//             }
//         }

//         // PUT: api/staff/updateClaimStatus/{claimCode}
//         [HttpPut("updateClaimStatus/{claimCode}")]
//         public async Task<IActionResult> UpdateClaimStatusToComplete(string claimCode)
//         {
//             if (string.IsNullOrWhiteSpace(claimCode))
//             {
//                 return BadRequest(new { message = "Claim code cannot be empty." });
//             }

//             try
//             {
//                 var order = await _context.Orders
//                     .FirstOrDefaultAsync(o => o.ClaimCode == claimCode);

//                 if (order == null)
//                 {
//                     return NotFound(new { message = "Order not found for the given claim code." });
//                 }

//                 order.Status = "Complete";
//                 order.UpdatedAt = DateTime.UtcNow;
//                 _context.Orders.Update(order);
//                 await _context.SaveChangesAsync();

//                 return Ok(new { message = "Claim status updated to 'Complete' successfully." });
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(StatusCodes.Status500InternalServerError,
//                     new { message = "An error occurred while updating the claim status", error = ex.Message });
//             }
//         }
//     }
// }

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Server.Data;
using Server.DTOs.Response;
using Server.Hubs;
using Server.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [Route("api/staff")]
    [ApiController]
    public class StaffController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public StaffController(ApplicationDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // GET: api/staff/getAllOrders
        [HttpGet("getAllOrders")]
        public async Task<ActionResult<IEnumerable<OrderResponseDTO>>> GetAllOrders()
        {
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Book)
                    .OrderByDescending(o => o.CreatedAt)
                    .ToListAsync();

                var response = orders.Select(order => new OrderResponseDTO
                {
                    OrderId = order.Id,
                    UserId = order.UserId,
                    Status = order.Status,
                    TotalPrice = order.TotalPrice,
                    ClaimCode = order.ClaimCode,
                    CreatedAt = order.CreatedAt,
                    Items = order.OrderItems.Select(oi => new OrderItemResponseDTO
                    {
                        OrderItemId = oi.Id,
                        BookId = oi.BookId,
                        Quantity = oi.Quantity,
                        Title = oi.Book.Title,
                        Author = oi.Book.Author,
                        Price = oi.Book.Price,
                    }).ToList()
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while retrieving orders", error = ex.Message });
            }
        }

        // GET: api/staff/getOrderByClaimCode/{claimCode}
        [HttpGet("getOrderByClaimCode/{claimCode}")]
        public async Task<ActionResult<OrderResponseDTO>> GetOrderDetailsByClaimCode(string claimCode)
        {
            if (string.IsNullOrWhiteSpace(claimCode))
            {
                return BadRequest(new { message = "Claim code cannot be empty." });
            }

            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Book)
                    .FirstOrDefaultAsync(o => o.ClaimCode == claimCode);

                if (order == null)
                {
                    return NotFound(new { message = "Order not found for the given claim code." });
                }

                var response = new OrderResponseDTO
                {
                    OrderId = order.Id,
                    UserId = order.UserId,
                    Status = order.Status,
                    TotalPrice = order.TotalPrice,
                    ClaimCode = order.ClaimCode,
                    CreatedAt = order.CreatedAt,
                    Items = order.OrderItems.Select(oi => new OrderItemResponseDTO
                    {
                        OrderItemId = oi.Id,
                        BookId = oi.BookId,
                        Quantity = oi.Quantity,
                        Title = oi.Book.Title,
                        Author = oi.Book.Author,
                        Price = oi.Book.Price,
                    }).ToList()
                };

                // Send real-time notification to the user
                await _hubContext.Clients.User(order.UserId.ToString()).SendAsync("OrderCompleted", new
                {
                    OrderId = order.Id,
                    Message = "Your order has been marked as complete."
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while retrieving the order", error = ex.Message });
            }
        }

        // PUT: api/staff/updateClaimStatus/{claimCode}
        [HttpPut("updateClaimStatus/{claimCode}")]
        public async Task<IActionResult> UpdateClaimStatusToComplete(string claimCode)
        {
            if (string.IsNullOrWhiteSpace(claimCode))
            {
                return BadRequest(new { message = "Claim code cannot be empty." });
            }

            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Book)
                    .FirstOrDefaultAsync(o => o.ClaimCode == claimCode);

                if (order == null)
                {
                    return NotFound(new { message = "Order not found for the given claim code." });
                }

                order.Status = "Complete";
                order.UpdatedAt = DateTime.UtcNow;
                _context.Orders.Update(order);
                await _context.SaveChangesAsync();

                // Prepare book details for the notification
                var bookDetails = order.OrderItems.Select(oi => new
                {
                    Title = oi.Book.Title,
                    Author = oi.Book.Author,
                    Quantity = oi.Quantity,
                    Price = oi.Book.Price
                }).ToList();

                // Send real-time notification to the user
                await _hubContext.Clients.User(order.UserId.ToString()).SendAsync("OrderCompleted", new
                {
                    OrderId = order.Id,
                    Message = "Your order has been marked as complete.",
                    claimCode = claimCode,
                    Books = bookDetails
                });

                // Save notification to the database
                var notification = new Notification
                {
                    UserId = order.UserId.ToString(),
                    Message = $"Your order with claim code {claimCode} has been marked as complete.",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Claim status updated to 'Complete' successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while updating the claim status", error = ex.Message });
            }
        }

        // POST: api/staff/testNotification
        [HttpPost("testNotification")]
        public async Task<IActionResult> TestNotification()
        {
            try
            {
                // Send a test notification to all connected users
                await _hubContext.Clients.All.SendAsync("TestNotification", new
                {
                    Message = "This is a test notification sent to all users."
                });

                return Ok(new { message = "Test notification sent successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while sending the test notification", error = ex.Message });
            }
        }

        // POST: api/staff/sendNotificationToUser/{userId}
        [HttpPost("sendNotificationToUser/{userId}")]
        public async Task<IActionResult> SendNotificationToUser(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest(new { message = "User ID cannot be empty." });
            }

            try
            {
                // Send a notification to the specified user
                await _hubContext.Clients.User(userId).SendAsync("UserNotification", new
                {
                    Message = "This is a notification sent to a specific user."
                });

                return Ok(new { message = "Notification sent to user successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while sending the notification", error = ex.Message });
            }
        }
    }
}
