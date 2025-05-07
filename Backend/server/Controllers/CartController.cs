// using System;
// using System.Threading.Tasks;
// using Microsoft.AspNetCore.Mvc;
// using Server.DTOs.Request;
// using Server.DTOs.Response;
// using Server.Service;


// namespace Server.Controllers
// {
//     [ApiController]
//     [Route("api/users/{userId}/cart")]
//     public class CartController : ControllerBase
//     {
//         private readonly ICartService _cartService;

//         public CartController(ICartService cartService)
//         {
//             _cartService = cartService;
//         }

//         [HttpGet]
//         public async Task<ActionResult<CartResponseDTO>> GetCart(Guid userId)
//         {
//             var cart = await _cartService.GetCartAsync(userId);
//             return Ok(cart);
//         }

//         [HttpPost("items")]
//         public async Task<ActionResult<CartResponseDTO>> AddCartItem(Guid userId, [FromBody] AddToCartItemRequestDTO request)
//         {
//             try
//             {
//                 var cart = await _cartService.AddCartItemAsync(userId, request);
//                 return Ok(cart);
//             }
//             catch (Exception ex)
//             {
//                 return BadRequest(ex);
//             }
//         }

//         [HttpPut("items/{cartItemId}")]
//         public async Task<ActionResult<CartResponseDTO>> UpdateCartItem(Guid userId, Guid cartItemId, [FromBody] UpdateCartItemRequestDTO request)
//         {
//             try
//             {
//                 var cart = await _cartService.UpdateCartItemAsync(userId, cartItemId, request);
//                 return Ok(cart);
//             }
//             catch (Exception ex)
//             {
//                 return BadRequest(ex.Message);
//             }
//         }

//         [HttpDelete("items/{cartItemId}")]
//         public async Task<ActionResult<CartResponseDTO>> DeleteCartItem(Guid userId, Guid cartItemId)
//         {
//             try
//             {
//                 var cart = await _cartService.DeleteCartItemAsync(userId, cartItemId);
//                 return Ok(cart);
//             }
//             catch (Exception ex)
//             {
//                 return BadRequest(ex.Message);
//             }
//         }
//     }
// }

using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Server.DTOs.Request;
using Server.DTOs.Response;
using Server.Service;
using Microsoft.Extensions.Logging;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/users/{userId}/cart")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly ILogger<CartController> _logger;

        public CartController(ICartService cartService, ILogger<CartController> logger)
        {
            _cartService = cartService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<CartResponseDTO>> GetCart(Guid userId)
        {
            try
            {
                var cart = await _cartService.GetCartAsync(userId);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching cart for user {UserId}", userId);
                return BadRequest(new { Message = "Failed to fetch cart: " + ex.Message });
            }
        }

        [HttpPost("items")]
        public async Task<ActionResult<CartResponseDTO>> AddCartItem(Guid userId, [FromBody] AddToCartItemRequestDTO request)
        {
            try
            {
                var cart = await _cartService.AddCartItemAsync(userId, request);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding item to cart for user {UserId}", userId);
                return BadRequest(new { Message = "Failed to add item to cart: " + ex.Message });
            }
        }

        [HttpPut("items/{cartItemId}")]
        public async Task<ActionResult<CartResponseDTO>> UpdateCartItem(Guid userId, Guid cartItemId, [FromBody] UpdateCartItemRequestDTO request)
        {
            try
            {
                var cart = await _cartService.UpdateCartItemAsync(userId, cartItemId, request);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cart item {CartItemId} for user {UserId}", cartItemId, userId);
                return BadRequest(new { Message = "Failed to update cart item: " + ex.Message });
            }
        }

        [HttpDelete("items/{cartItemId}")]
        public async Task<ActionResult<CartResponseDTO>> DeleteCartItem(Guid userId, Guid cartItemId)
        {
            try
            {
                var cart = await _cartService.DeleteCartItemAsync(userId, cartItemId);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting cart item {CartItemId} for user {UserId}", cartItemId, userId);
                return BadRequest(new { Message = "Failed to delete cart item: " + ex.Message });
            }
        }
    }
}