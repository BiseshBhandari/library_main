using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs.Request;
using Server.DTOs.Response;
using Server.Model;

namespace Server.Controllers
{
    [Route("api/Whitelist")]
    [ApiController]
    public class WhitelistController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public WhitelistController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("add")]
        public async Task<ActionResult<WhitelistResponseDTO>> AddToWhitelist([FromBody] WhitelistRequestDTO request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var user = await _context.Users.FindAsync(request.UserId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var book = await _context.Books.FindAsync(request.BookId);
                if (book == null)
                {
                    return NotFound(new { message = "Book not found" });
                }

                if (await _context.Whitelists.AnyAsync(w => w.UserId == request.UserId && w.BookId == request.BookId))
                {
                    return Conflict(new { message = "Book is already in the user's whitelist" });
                }

                var whitelist = new Whitelist
                {
                    UserId = request.UserId,
                    BookId = request.BookId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Whitelists.Add(whitelist);
                await _context.SaveChangesAsync();

                var response = new WhitelistResponseDTO
                {
                    UserId = whitelist.UserId,
                    BookId = whitelist.BookId,
                    BookTitle = book.Title,
                    BookAuthor = book.Author,
                    BookImageUrl = book.ImageUrl,
                    CreatedAt = whitelist.CreatedAt
                };

                return CreatedAtAction(nameof(GetUserWhitelist), new { userId = request.UserId }, response);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while adding the book to the whitelist", error = ex.Message });
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<WhitelistResponseDTO>>> GetUserWhitelist(Guid userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var whitelist = await _context.Whitelists
                    .Where(w => w.UserId == userId)
                    .Include(w => w.Book)
                    .Select(w => new WhitelistResponseDTO
                    {
                        UserId = w.UserId,
                        BookId = w.BookId,
                        BookTitle = w.Book.Title,
                        BookAuthor = w.Book.Author,
                        BookImageUrl = w.Book.ImageUrl,
                        CreatedAt = w.CreatedAt
                    })
                    .ToListAsync();

                return Ok(whitelist);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while retrieving the whitelist", error = ex.Message });
            }
        }

        [HttpDelete("user/{userId}/book/{bookId}")]
        public async Task<IActionResult> RemoveFromWhitelist(Guid userId, Guid bookId)
        {
            try
            {
                var whitelist = await _context.Whitelists
                    .FirstOrDefaultAsync(w => w.UserId == userId && w.BookId == bookId);

                if (whitelist == null)
                {
                    return NotFound(new { message = "Book not found in the user's whitelist" });
                }

                _context.Whitelists.Remove(whitelist);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while removing the book from the whitelist", error = ex.Message });
            }
        }
    }
}