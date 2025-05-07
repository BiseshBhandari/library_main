using System;
using Server.DTOs.Response;

namespace Server.Service;

public interface IEmailService
{
    Task SendOrderConfirmationEmailAsync(string toEmail, string claimCode, decimal totalPrice,
    List<OrderItemResponseDTO> items);
}