using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Server.DTOs.Request;
using Server.DTOs.Response;
using Server.Service;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/users/{userId}/orders")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IUserService _userService;

        // Email configuration
        private const string SMTP_SERVER = "smtp.gmail.com";
        private const int SMTP_PORT = 587;
        private const string EMAIL_USERNAME = "pk6850708@gmail.com";
        private const string EMAIL_APP_PASSWORD = "kord egir bzsn oydr";
        private const string EMAIL_FROM_NAME = "Bookstore";
        private const string EMAIL_FROM_ADDRESS = "pk6850708@gmail.com";

        // Current timestamp and user information
        private readonly string CURRENT_TIMESTAMP = "2025-05-06 20:43:31";
        private readonly string CURRENT_USER = "User";

        public OrderController(IOrderService orderService, IUserService userService)
        {
            _orderService = orderService;
            _userService = userService;
        }

        [HttpPost]
        public async Task<ActionResult<OrderResponseDTO>> PlaceOrder(Guid userId, [FromBody] PlaceOrderRequestDTO request)
        {
            try
            {
                // Get user email
                var userEmail = await _userService.GetUserEmailAsync(userId);
                if (string.IsNullOrEmpty(userEmail))
                {
                    return BadRequest(new { message = "User email not found" });
                }

                // Place the order
                var order = await _orderService.PlaceOrderAsync(userId, request);

                // Calculate total and discounts
                decimal total = request.Items.Sum(item => item.Price * item.Quantity);
                decimal discount = 0;
                string discountDetails = "";

                // Check for 5% discount for buying 5+ books
                var totalBooks = request.Items.Sum(item => item.Quantity);
                if (totalBooks >= 5)
                {
                    discount += total * 0.05m;
                    discountDetails += "5% discount for purchasing 5 or more books applied.<br>";
                }

                // Check for 10% discount for 10+ successful orders
                var successfulOrdersCount = (await _userService.GetUserOrdersAsync(userId))
                    .Count(o => o.Status == "Complete");
                if (successfulOrdersCount >= 10)
                {
                    discount += (total - discount) * 0.10m;
                    discountDetails += "10% discount for having 10 or more successful orders applied.<br>";
                }

                decimal finalTotal = total - discount;

                // Offer details
                string offerDetails = "";
                if (successfulOrdersCount < 10)
                {
                    offerDetails = $"You are {10 - successfulOrdersCount} successful orders away from earning a 10% discount on all future purchases!<br>";
                }

                // Create and send email
                var email = new MimeMessage();
                email.From.Add(new MailboxAddress(EMAIL_FROM_NAME, EMAIL_FROM_ADDRESS));
                email.To.Add(MailboxAddress.Parse(userEmail));
                email.Subject = $"Order Confirmation - Order #{order.OrderId}";

                var builder = new BodyBuilder();
                builder.HtmlBody = $@"
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }}
        .email-container {{ max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }}
        .header {{ background-color: #007bff; color: #ffffff; padding: 20px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 24px; }}
        .content {{ padding: 20px; }}
        .order-details {{ margin: 20px 0; }}
        table {{ width: 100%; border-collapse: collapse; margin-bottom: 20px; }}
        th, td {{ padding: 10px; border: 1px solid #ddd; text-align: left; }}
        th {{ background-color: #f8f9fa; }}
        .total-section {{ margin-top: 20px; font-size: 18px; font-weight: bold; }}
        .claim-code {{ background-color: #e9ecef; padding: 10px; margin: 20px 0; text-align: center; font-size: 16px; font-weight: bold; }}
        .discount-section {{ margin-top: 20px; color: green; font-size: 14px; }}
        .offer-section {{ margin-top: 20px; color: blue; font-size: 14px; }}
        .footer {{ background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class='email-container'>
        <div class='header'>
            <h1>Order Confirmation</h1>
            <p>Date: {CURRENT_TIMESTAMP}</p>
        </div>
        <div class='content'>
            <p>Dear {CURRENT_USER},</p>
            <p>Thank you for your order! Here are your order details:</p>
            <div class='order-details'>
                <p><strong>Order ID:</strong> {order.OrderId}</p>
                <p><strong>Order Date:</strong> {CURRENT_TIMESTAMP}</p>
                <div class='claim-code'>
                    <h3>Your Claim Code</h3>
                    <h2>{order.ClaimCode}</h2>
                    <p>Please keep this code safe - you'll need it to claim your order.</p>
                </div>
                <h3>Order Summary</h3>
                <table>
                    <tr>
                        <th>Book ID</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                    </tr>";

                foreach (var item in request.Items)
                {
                    builder.HtmlBody += $@"
                    <tr>
                        <td>{item.BookId}</td>
                        <td>{item.Quantity}</td>
                        <td>${item.Price:F2}</td>
                        <td>${(item.Price * item.Quantity):F2}</td>
                    </tr>";
                }

                builder.HtmlBody += $@"
                </table>
                <div class='total-section'>
                    <p>Original Total: ${total:F2}</p>
                    <div class='discount-section'>
                        <h4>Discounts Applied:</h4>
                        <p>{discountDetails}</p>
                        <p>Total Savings: ${discount:F2}</p>
                    </div>
                    <p>Final Total: ${finalTotal:F2}</p>
                </div>
                <div class='offer-section'>
                    <h4>Offers:</h4>
                    <p>{offerDetails}</p>
                </div>
            </div>
            <p>If you have any questions about your order, please contact us.</p>
            <p>Best regards,<br>Your Bookstore Team</p>
        </div>
        <div class='footer'>
            <p>&copy; 2025 Bookstore. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

                email.Body = builder.ToMessageBody();

                // Send the email
                using (var smtp = new SmtpClient())
                {
                    await smtp.ConnectAsync(SMTP_SERVER, SMTP_PORT, SecureSocketOptions.StartTls);
                    await smtp.AuthenticateAsync(EMAIL_USERNAME, EMAIL_APP_PASSWORD);
                    await smtp.SendAsync(email);
                    await smtp.DisconnectAsync(true);
                }

                return Ok(order);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("preview")]
        public async Task<ActionResult<OrderPreviewResponseDTO>> PreviewOrder(Guid userId, [FromBody] PlaceOrderRequestDTO request)
        {
            try
            {
                // Validate user
                var userEmail = await _userService.GetUserEmailAsync(userId);
                if (string.IsNullOrEmpty(userEmail))
                    return BadRequest(new { message = "User not found" });

                if (request.Items == null || !request.Items.Any())
                    return BadRequest(new { message = "Order must contain at least one item" });

                // Calculate original total
                decimal originalTotal = request.Items.Sum(i => i.Price * i.Quantity);
                decimal totalPrice = originalTotal;
                decimal discount = 0;

                // Apply discounts (same logic as PlaceOrderAsync)
                var totalBooks = request.Items.Sum(i => i.Quantity);
                if (totalBooks >= 5)
                {
                    discount += originalTotal * 0.05m;
                    totalPrice *= 0.95m; // 5% discount
                }

                var successfulOrdersCount = (await _userService.GetUserOrdersAsync(userId))
                    .Count(o => o.Status == "Complete");
                if (successfulOrdersCount >= 10)
                {
                    discount += totalPrice * 0.10m;
                    totalPrice *= 0.90m; // 10% discount
                }

                return Ok(new OrderPreviewResponseDTO
                {
                    OriginalTotal = originalTotal,
                    Discount = discount,
                    FinalTotal = totalPrice
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{orderId}/cancel")]
        public async Task<ActionResult<OrderResponseDTO>> CancelOrder(Guid userId, Guid orderId)
        {
            try
            {
                // Get user email
                var userEmail = await _userService.GetUserEmailAsync(userId);
                if (string.IsNullOrEmpty(userEmail))
                {
                    return BadRequest(new { message = "User email not found" });
                }

                var order = await _orderService.CancelOrderAsync(userId, orderId);

                // Send cancellation email
                var email = new MimeMessage();
                email.From.Add(new MailboxAddress(EMAIL_FROM_NAME, EMAIL_FROM_ADDRESS));
                email.To.Add(MailboxAddress.Parse(userEmail));
                email.Subject = $"Order Cancellation - Order #{orderId}";

                var builder = new BodyBuilder();
                builder.HtmlBody = $@"
                    <html>
                    <body style='font-family: Arial, sans-serif;'>
                        <div style='padding: 20px;'>
                            <h1>Order Cancellation Confirmation</h1>
                            <p>Date: {CURRENT_TIMESTAMP}</p>
                            <p>Dear {CURRENT_USER},</p>
                            <p>Your order #{orderId} has been cancelled.</p>
                            <p>If you did not request this cancellation, please contact us immediately.</p>
                            <p>Best regards,<br>Your Bookstore Team</p>
                        </div>
                    </body>
                    </html>";

                email.Body = builder.ToMessageBody();

                using (var smtp = new SmtpClient())
                {
                    await smtp.ConnectAsync(SMTP_SERVER, SMTP_PORT, SecureSocketOptions.StartTls);
                    await smtp.AuthenticateAsync(EMAIL_USERNAME, EMAIL_APP_PASSWORD);
                    await smtp.SendAsync(email);
                    await smtp.DisconnectAsync(true);
                }

                return Ok(order);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderResponseDTO>>> GetUserOrders(Guid userId)
        {
            try
            {
                var orders = await _orderService.GetUserOrdersAsync(userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{orderId}")]
        public async Task<ActionResult<OrderResponseDTO>> GetOrder(Guid userId, Guid orderId)
        {
            try
            {
                var order = await _orderService.GetOrderAsync(userId, orderId);
                return Ok(order);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}