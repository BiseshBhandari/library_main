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
using Swashbuckle.AspNetCore.Annotations;

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
        public async Task<ActionResult<IEnumerable<BookResponseDTO>>> GetBooks()
        {
            try
            {
                var books = await _context.Books.ToListAsync();
                var now = DateTime.UtcNow;

                var bookDtos = books.Select(b =>
                {
                    // Check if the book is on sale and the discount is currently active
                    bool discountActive = b.IsOnSale &&
                                          b.DiscountPercentage.HasValue &&
                                          b.DiscountStart.HasValue &&
                                          b.DiscountEnd.HasValue &&
                                          b.DiscountStart.Value <= now &&
                                          b.DiscountEnd.Value >= now;

                    // Calculate the effective price
                    decimal effectivePrice = discountActive
                        ? Math.Round(b.Price * (1 - (decimal)b.DiscountPercentage.Value / 100), 2)
                        : b.Price;

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
                        IsOnSale = b.IsOnSale,
                        DiscountPercentage = b.DiscountPercentage,
                        DiscountStart = b.DiscountStart,
                        DiscountEnd = b.DiscountEnd,
                        CreatedAt = b.CreatedAt,
                        UpdatedAt = b.UpdatedAt
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
                    IsOnSale = bookDto.IsOnSale,
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
                    InventoryCount = book.InventoryCount,
                    IsOnSale = book.IsOnSale,
                    CreatedAt = book.CreatedAt,
                    UpdatedAt = book.UpdatedAt
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
        // [Authorize]
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
                book.Author = bookDto.Author ?? book.Author;
                book.ISBN = bookDto.ISBN ?? book.ISBN;
                book.Genre = bookDto.Genre ?? book.Genre;
                book.Description = bookDto.Description ?? book.Description;
                book.Price = bookDto.Price ?? book.Price;
                book.InventoryCount = bookDto.InventoryCount ?? book.InventoryCount;
                book.IsOnSale = bookDto.IsOnSale ?? book.IsOnSale;

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
                    InventoryCount = book.InventoryCount,
                    IsOnSale = book.IsOnSale,
                    CreatedAt = book.CreatedAt,
                    UpdatedAt = book.UpdatedAt
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