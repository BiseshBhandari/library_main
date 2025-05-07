using System;
using Server.DTOs.Response;

namespace Server.Service;

public class MockEmailService : IEmailService
{
    public Task SendOrderConfirmationEmailAsync(string toEmail, string claimCode, decimal totalPrice, List<OrderItemResponseDTO> items)
    {
        // Simulate email sending
        Console.WriteLine($"Sending email to {toEmail}:");
        Console.WriteLine($"Claim Code: {claimCode}");
        Console.WriteLine($"Total Price: {totalPrice:C}");
        Console.WriteLine("Items:");
        foreach (var item in items)
        {
            Console.WriteLine($"- {item.Title} by {item.Author}, {item.Quantity} x {item.Price:C}");
        }
        return Task.CompletedTask;
    }
}
