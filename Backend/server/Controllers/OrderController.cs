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
        private readonly string CURRENT_USER = "LuciHav";

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

                // Calculate total
                decimal total = request.Items.Sum(item => item.Price * item.Quantity);

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
                            body {{ font-family: Arial, sans-serif; }}
                            .header {{ background-color: #f8f9fa; padding: 20px; text-align: center; }}
                            .content {{ padding: 20px; }}
                            .order-details {{ margin: 20px 0; }}
                            table {{ width: 100%; border-collapse: collapse; }}
                            th, td {{ padding: 10px; border: 1px solid #ddd; }}
                            th {{ background-color: #f8f9fa; }}
                            .total-section {{ margin-top: 20px; }}
                            .claim-code {{ background-color: #e9ecef; padding: 10px; margin: 20px 0; text-align: center; }}
                        </style>
                    </head>
                    <body>
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
                                    <h3>Total: ${total:F2}</h3>
                                </div>
                            </div>
                            <p>If you have any questions about your order, please contact us.</p>
                            <p>Best regards,<br>Your Bookstore Team</p>
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