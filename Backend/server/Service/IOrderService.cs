using Server.DTOs.Request;
using Server.DTOs.Response;

namespace Server.Service;

public interface IOrderService
{
    Task<IEnumerable<OrderResponseDTO>> GetUserOrdersAsync(Guid userId);
    Task<OrderResponseDTO> PlaceOrderAsync(Guid userId, PlaceOrderRequestDTO request);
    Task<OrderResponseDTO> CancelOrderAsync(Guid userId, Guid orderId);
    Task<OrderResponseDTO> GetOrderAsync(Guid userId, Guid orderId);
}