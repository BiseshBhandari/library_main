using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Server.Data;
using Server.DTOs.Response;
using Server.DTOs.Request;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Server.Model;
using System.IO;
using Server.Models;

namespace Server.Controllers
{
    [Route("api/Admin/Book/")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly string _imagesPath;

        public BookController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _imagesPath = Path.Combine(environment.ContentRootPath, "Images");
            if (!Directory.Exists(_imagesPath))
            {
                Directory.CreateDirectory(_imagesPath);
            }
        }

        [HttpGet("getAllBooks")]
        public async Task<ActionResult<IEnumerable<BookResponseDTO>>> GetBooks([FromQuery] Guid? userId)
        {
            try
            {
                // Fetch all books
                var books = await _context.Books.ToListAsync();
                var now = DateTime.UtcNow;

                // Calculate average ratings for all books
                var averageRatings = await _context.Reviews
                    .GroupBy(r => r.BookId)
                    .Select(g => new
                    {
                        BookId = g.Key,
                        AverageRating = g.Average(r => r.Rating)
                    })
                    .ToListAsync();

                // Fetch user-specific ratings if userId is provided
                var userReviews = new List<ReviewRating>();
                if (userId.HasValue)
                {
                    userReviews = await _context.Reviews
                        .Where(r => r.UserId == userId.Value)
                        .GroupBy(r => r.BookId)
                        .Select(g => new ReviewRating
                        {
                            BookId = g.Key,
                            LatestRating = g.OrderByDescending(r => r.CreatedAt).First().Rating
                        })
                        .ToListAsync();
                }

                // Map books to DTOs
                var bookDtos = books.Select(b =>
                {
                    // Discount logic
                    bool isDiscountExpired = b.DiscountEnd.HasValue && b.DiscountEnd.Value < now;
                    bool discountActive = !isDiscountExpired &&
                                         b.IsOnSale &&
                                         b.DiscountPercentage.HasValue &&
                                         b.DiscountStart.HasValue &&
                                         b.DiscountEnd.HasValue &&
                                         b.DiscountStart.Value <= now &&
                                         b.DiscountEnd.Value >= now;

                    decimal effectivePrice = discountActive
                        ? Math.Round(b.Price * (1 - (decimal)b.DiscountPercentage.Value / 100), 2)
                        : b.Price;

                    // Determine rating: user-specific if userId exists, else average rating
                    int rating = userId.HasValue
                        ? (userReviews.FirstOrDefault(r => r.BookId == b.Id)?.LatestRating ?? 0)
                        : (int)Math.Round(averageRatings.FirstOrDefault(a => a.BookId == b.Id)?.AverageRating ?? 0);

                    return new BookResponseDTO
                    {
                        Id = b.Id,
                        Title = b.Title,
                        Author = b.Author,
                        ISBN = b.ISBN,
                        Genre = b.Genre,
                        Description = b.Description,
                        ImageUrl = b.ImageUrl,
                        Price = b.Price,
                        EffectivePrice = effectivePrice,
                        InventoryCount = b.InventoryCount,
                        IsOnSale = isDiscountExpired ? false : b.IsOnSale,
                        DiscountPercentage = isDiscountExpired ? null : b.DiscountPercentage,
                        DiscountStart = isDiscountExpired ? null : b.DiscountStart,
                        DiscountEnd = isDiscountExpired ? null : b.DiscountEnd,
                        CreatedAt = b.CreatedAt,
                        UpdatedAt = b.UpdatedAt,
                        Rating = rating
                    };
                }).ToList();

                return Ok(bookDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while retrieving books", error = ex.Message });
            }
        }

        [HttpPost("addBook")]
        public async Task<ActionResult<BookResponseDTO>> AddBook([FromForm] BookRequestDTO bookDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                if (await _context.Books.AnyAsync(b => b.ISBN == bookDto.ISBN))
                {
                    return Conflict(new { message = "A book with this ISBN already exists" });
                }

                string? imageUrl = null;
                if (bookDto.Image != null)
                {
                    imageUrl = await SaveImageAsync(bookDto.Image);
                }

                var book = new Book
                {
                    Id = Guid.NewGuid(),
                    Title = bookDto.Title,
                    Author = bookDto.Author,
                    ISBN = bookDto.ISBN,
                    Genre = bookDto.Genre,
                    Description = bookDto.Description,
                    ImageUrl = imageUrl,
                    Price = bookDto.Price,
                    InventoryCount = bookDto.InventoryCount,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Books.Add(book);
                await _context.SaveChangesAsync();

                var bookResponse = new BookResponseDTO
                {
                    Id = book.Id,
                    Title = book.Title,
                    Author = book.Author,
                    ISBN = book.ISBN,
                    Genre = book.Genre,
                    Description = book.Description,
                    ImageUrl = book.ImageUrl,
                    Price = book.Price,
                    EffectivePrice = book.Price,
                    InventoryCount = book.InventoryCount,
                    IsOnSale = book.IsOnSale,
                    CreatedAt = book.CreatedAt,
                    UpdatedAt = book.UpdatedAt,
                    Rating = 0
                };

                return CreatedAtAction(nameof(GetBooks), new { id = book.Id }, bookResponse);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while adding the book", error = ex.Message });
            }
        }

        [HttpPut("updateBook/{id}")]
        public async Task<ActionResult<BookResponseDTO>> UpdateBook(Guid id, [FromForm] BookUpdateRequestDTO bookDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var book = await _context.Books.FindAsync(id);
                if (book == null)
                {
                    return NotFound(new { message = "Book not found" });
                }

                if (bookDto.ISBN != book.ISBN && await _context.Books.AnyAsync(b => b.ISBN == bookDto.ISBN))
                {
                    return Conflict(new { message = "A book with this ISBN already exists" });
                }

                book.Title = bookDto.Title ?? book.Title;
                book.Author = bookDto.Author ?? book.Title;
                book.ISBN = bookDto.ISBN ?? book.ISBN;
                book.Genre = bookDto.Genre ?? book.Genre;
                book.Description = bookDto.Description ?? book.Description;
                book.Price = bookDto.Price ?? book.Price;
                book.InventoryCount = bookDto.InventoryCount ?? book.InventoryCount;

                if (bookDto.Image != null)
                {
                    if (!string.IsNullOrEmpty(book.ImageUrl))
                    {
                        var oldImagePath = Path.Combine(_imagesPath, Path.GetFileName(book.ImageUrl));
                        if (System.IO.File.Exists(oldImagePath))
                        {
                            System.IO.File.Delete(oldImagePath);
                        }
                    }
                    book.ImageUrl = await SaveImageAsync(bookDto.Image);
                }

                book.UpdatedAt = DateTime.UtcNow;

                _context.Books.Update(book);
                await _context.SaveChangesAsync();

                bool isDiscountExpired = book.DiscountEnd.HasValue && book.DiscountEnd.Value < DateTime.UtcNow;
                bool discountActive = !isDiscountExpired &&
                                     book.IsOnSale &&
                                     book.DiscountPercentage.HasValue &&
                                     book.DiscountStart.HasValue &&
                                     book.DiscountEnd.HasValue &&
                                     book.DiscountStart.Value <= DateTime.UtcNow &&
                                     book.DiscountEnd.Value >= DateTime.UtcNow;

                decimal effectivePrice = discountActive
                    ? Math.Round(book.Price * (1 - (decimal)book.DiscountPercentage.Value / 100), 2)
                    : book.Price;

                var bookResponse = new BookResponseDTO
                {
                    Id = book.Id,
                    Title = book.Title,
                    Author = book.Author,
                    ISBN = book.ISBN,
                    Genre = book.Genre,
                    Description = book.Description,
                    ImageUrl = book.ImageUrl,
                    Price = book.Price,
                    EffectivePrice = effectivePrice,
                    InventoryCount = book.InventoryCount,
                    IsOnSale = isDiscountExpired ? false : book.IsOnSale,
                    DiscountPercentage = isDiscountExpired ? null : book.DiscountPercentage,
                    DiscountStart = isDiscountExpired ? null : book.DiscountStart,
                    DiscountEnd = isDiscountExpired ? null : book.DiscountEnd,
                    CreatedAt = book.CreatedAt,
                    UpdatedAt = book.UpdatedAt,
                    Rating = 0
                };

                return Ok(bookResponse);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while updating the book", error = ex.Message });
            }
        }

        [HttpDelete("deleteBook/{id}")]
        public async Task<IActionResult> DeleteBook(Guid id)
        {
            try
            {
                var book = await _context.Books.FindAsync(id);
                if (book == null)
                {
                    return NotFound(new { message = "Book not found" });
                }

                if (!string.IsNullOrEmpty(book.ImageUrl))
                {
                    var imagePath = Path.Combine(_imagesPath, Path.GetFileName(book.ImageUrl));
                    if (System.IO.File.Exists(imagePath))
                    {
                        System.IO.File.Delete(imagePath);
                    }
                }

                _context.Books.Remove(book);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while deleting the book", error = ex.Message });
            }
        }

        private async Task<string> SaveImageAsync(IFormFile image)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                throw new ArgumentException("Only .jpg, .jpeg, .png, and .gif files are allowed.");
            }

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(_imagesPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            return $"/images/{fileName}";
        }
    }
}