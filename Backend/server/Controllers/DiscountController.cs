using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs.Request;
using Server.Model;

namespace Server.Controllers
{
    [Route("api/discount/")]
    [ApiController]
    public class DiscountController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DiscountController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddDiscount([FromBody] DiscountCreateDTO dto)
        {
            var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == dto.BookId);

            if (book == null)
            {
                return NotFound(new { message = "Book not found." });
            }

            if (dto.DiscountEnd <= dto.DiscountStart)
            {
                return BadRequest(new { message = "Discount end time must be after start time." });
            }

            book.DiscountPercentage = dto.DiscountPercentage;
            book.DiscountStart = dto.DiscountStart.ToUniversalTime();
            book.DiscountEnd = dto.DiscountEnd.ToUniversalTime();
            book.IsOnSale = true;
            book.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Discount applied successfully." });
        }
    }
}
