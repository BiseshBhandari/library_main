using System;
using Server.DTOs.Request;
using Server.DTOs.Response;

namespace Server.Service;

public interface ICartService
{
    Task<CartResponseDTO> GetCartAsync(Guid userId);
    Task<CartResponseDTO> AddCartItemAsync(Guid userId, AddToCartItemRequestDTO request);
    Task<CartResponseDTO> UpdateCartItemAsync(Guid userId, Guid cartItemId, UpdateCartItemRequestDTO request);
    Task<CartResponseDTO> DeleteCartItemAsync(Guid userId, Guid cartItemId);
    Task<CartResponseDTO> ClearCartAsync(Guid userId); // Added new method to clear all cart items
}